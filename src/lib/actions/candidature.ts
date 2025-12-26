"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { candidatureSchema, candidatureNoteSchema } from "@/lib/schemas/candidature";
import { revalidatePath } from "next/cache";
import type { CandidatureStatus } from "@prisma/client";
import { PERMISSIONS } from "@/lib/rbac";

export async function submitCandidature(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non authentifié" };
  }

  if (session.user.role !== "client") {
    return { success: false, error: "Seuls les clients peuvent postuler" };
  }

  // Check if user already has a pending candidature
  const existing = await db.candidature.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["en_attente", "a_tester"] },
    },
  });

  if (existing) {
    return { success: false, error: "Vous avez déjà une candidature en cours" };
  }

  const raw = Object.fromEntries(formData);
  const parsed = candidatureSchema.safeParse({
    ...raw,
    age: parseInt(raw.age as string, 10),
    acceptRules: raw.acceptRules === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // Create candidature
    const candidature = await db.candidature.create({
      data: {
        userId: session.user.id,
        pseudoRp: parsed.data.pseudoRp,
        age: parsed.data.age,
        disponibilites: parsed.data.disponibilites,
        experienceRp: parsed.data.experienceRp,
        experienceMecano: parsed.data.experienceMecano,
        motivations: parsed.data.motivations,
        visionRp: parsed.data.visionRp,
        gestionConflits: parsed.data.gestionConflits,
      },
    });

    // Handle dynamic answers if any
    if (parsed.data.dynamicAnswers) {
      const questions = await db.recruitmentQuestion.findMany({
        where: { isActive: true },
      });

      const answers = Object.entries(parsed.data.dynamicAnswers)
        .filter(([fieldName]) => questions.some((q) => q.fieldName === fieldName))
        .map(([fieldName, answerText]) => ({
          candidatureId: candidature.id,
          questionId: questions.find((q) => q.fieldName === fieldName)!.id,
          answerText: String(answerText),
        }));

      if (answers.length > 0) {
        await db.recruitmentAnswer.createMany({ data: answers });
      }
    }

    revalidatePath("/recrutement");
    return { success: true, candidatureId: candidature.id };
  } catch (error) {
    console.error("Error creating candidature:", error);
    return { success: false, error: "Erreur lors de la création de la candidature" };
  }
}

export async function addCandidatureNote(candidatureId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non authentifié" };
  }

  if (!PERMISSIONS.addCandidatureNote(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = candidatureNoteSchema.safeParse({
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    await db.candidatureNote.create({
      data: {
        candidatureId,
        authorId: session.user.id,
        content: parsed.data.content,
      },
    });

    revalidatePath(`/manager/recrutement/${candidatureId}`);
    return { success: true };
  } catch (error) {
    console.error("Error adding note:", error);
    return { success: false, error: "Erreur lors de l'ajout de la note" };
  }
}

export async function updateCandidatureStatus(
  candidatureId: string,
  newStatus: CandidatureStatus
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non authentifié" };
  }

  const candidature = await db.candidature.findUnique({
    where: { id: candidatureId },
  });

  if (!candidature) {
    return { success: false, error: "Candidature introuvable" };
  }

  if (!PERMISSIONS.changeCandidatureStatus(session.user.role, candidature.status, newStatus)) {
    return { success: false, error: "Non autorisé à effectuer ce changement de statut" };
  }

  try {
    await db.$transaction([
      db.candidature.update({
        where: { id: candidatureId },
        data: { status: newStatus },
      }),
      db.candidatureStatusHistory.create({
        data: {
          candidatureId,
          oldStatus: candidature.status,
          newStatus,
          authorId: session.user.id,
        },
      }),
    ]);

    revalidatePath(`/manager/recrutement/${candidatureId}`);
    revalidatePath("/manager/recrutement");
    return { success: true };
  } catch (error) {
    console.error("Error updating status:", error);
    return { success: false, error: "Erreur lors de la mise à jour du statut" };
  }
}

export async function getCandidatures(status?: CandidatureStatus) {
  const session = await auth();
  if (!session?.user || !PERMISSIONS.viewCandidatures(session.user.role)) {
    return [];
  }

  return db.candidature.findMany({
    where: status ? { status } : undefined,
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          image: true,
          discordId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCandidatureById(id: string) {
  const session = await auth();
  if (!session?.user) return null;

  const candidature = await db.candidature.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          image: true,
          discordId: true,
          role: true,
        },
      },
      answers: {
        include: {
          question: true,
        },
      },
      notes: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      statusHistory: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // Check permissions
  if (!candidature) return null;

  // User can see their own candidature or staff can see all
  if (
    candidature.userId !== session.user.id &&
    !PERMISSIONS.viewCandidatures(session.user.role)
  ) {
    return null;
  }

  return candidature;
}

"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isManagement } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const collaborationSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  advantageType: z.string().optional(),
  discountPercent: z.number().min(0).max(100),
  isActive: z.boolean().default(true),
});

export async function getCollaborations() {
  const session = await auth();
  if (!session?.user?.role || !isManagement(session.user.role)) {
    return [];
  }

  return db.collaboration.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      _count: {
        select: { invoices: true },
      },
    },
  });
}

export async function getActiveCollaborations() {
  return db.collaboration.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      advantageType: true,
      discountPercent: true,
    },
  });
}

export async function createCollaboration(data: z.infer<typeof collaborationSchema>) {
  const session = await auth();
  if (!session?.user?.role || !isManagement(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  const validated = collaborationSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message };
  }

  try {
    await db.collaboration.create({
      data: validated.data,
    });

    revalidatePath("/manager/collaborations");
    return { success: true };
  } catch (error) {
    console.error("Error creating collaboration:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateCollaboration(
  id: string,
  data: Partial<z.infer<typeof collaborationSchema>>
) {
  const session = await auth();
  if (!session?.user?.role || !isManagement(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.collaboration.update({
      where: { id },
      data,
    });

    revalidatePath("/manager/collaborations");
    return { success: true };
  } catch (error) {
    console.error("Error updating collaboration:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteCollaboration(id: string) {
  const session = await auth();
  if (!session?.user?.role || !isManagement(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    // Check if collaboration has invoices
    const collaboration = await db.collaboration.findUnique({
      where: { id },
      include: { _count: { select: { invoices: true } } },
    });

    if (!collaboration) {
      return { success: false, error: "Collaboration introuvable" };
    }

    if (collaboration._count.invoices > 0) {
      // Just deactivate instead of delete
      await db.collaboration.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      await db.collaboration.delete({ where: { id } });
    }

    revalidatePath("/manager/collaborations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting collaboration:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

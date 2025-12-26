"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPatron } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Role } from "@prisma/client";

// Users
export async function getUsers() {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return [];
  }

  return db.user.findMany({
    orderBy: [{ role: "desc" }, { username: "asc" }],
    select: {
      id: true,
      discordId: true,
      username: true,
      displayName: true,
      role: true,
      image: true,
      createdAt: true,
      _count: {
        select: { invoices: true },
      },
    },
  });
}

export async function updateUserRole(userId: string, newRole: Role) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  // Prevent changing own role
  if (session.user.id === userId) {
    return { success: false, error: "Vous ne pouvez pas changer votre propre rôle" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

// Services (ServiceCustomisation)
const serviceSchema = z.object({
  name: z.string().min(2),
  price: z.number().min(0),
  category: z.string().optional(),
  hasQuantity: z.boolean().optional(),
});

export async function getServices() {
  return db.serviceCustomisation.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getServiceCategories() {
  // Get unique categories from services
  const services = await db.serviceCustomisation.findMany({
    select: { category: true },
    distinct: ["category"],
    where: { category: { not: null } },
    orderBy: { category: "asc" },
  });

  return services.map((s) => s.category).filter(Boolean) as string[];
}

export async function createService(data: z.infer<typeof serviceSchema>) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.serviceCustomisation.create({
      data: {
        name: data.name,
        price: data.price,
        category: data.category || null,
        hasQuantity: data.hasQuantity || false,
      },
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error creating service:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateService(id: string, data: Partial<z.infer<typeof serviceSchema>>) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.serviceCustomisation.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error updating service:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteService(id: string) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.serviceCustomisation.delete({ where: { id } });
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// Vehicles
const vehicleSchema = z.object({
  name: z.string().min(2),
  code: z.string().optional(),
  category: z.string().optional(),
});

export async function getVehicles() {
  return db.vehicle.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createVehicle(data: z.infer<typeof vehicleSchema>) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.vehicle.create({
      data: {
        name: data.name,
        code: data.code || null,
        category: data.category || null,
      },
    });
    revalidatePath("/admin/vehicles");
    return { success: true };
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateVehicle(id: string, data: Partial<z.infer<typeof vehicleSchema>>) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.vehicle.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/vehicles");
    return { success: true };
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteVehicle(id: string) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.vehicle.delete({ where: { id } });
    revalidatePath("/admin/vehicles");
    return { success: true };
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// Questions (RecruitmentQuestion)
export async function getQuestions() {
  return db.recruitmentQuestion.findMany({
    orderBy: { sortOrder: "asc" },
  });
}

export async function createQuestion(label: string, order: number) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    // Generate a unique fieldName from the label
    const fieldName = `question_${Date.now()}`;

    await db.recruitmentQuestion.create({
      data: { label, fieldName, sortOrder: order, isActive: true },
    });

    revalidatePath("/admin/config");
    return { success: true };
  } catch (error) {
    console.error("Error creating question:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function updateQuestion(id: string, data: { label?: string; order?: number; isActive?: boolean }) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.recruitmentQuestion.update({
      where: { id },
      data: {
        label: data.label,
        sortOrder: data.order,
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/config");
    return { success: true };
  } catch (error) {
    console.error("Error updating question:", error);
    return { success: false, error: "Erreur lors de la mise à jour" };
  }
}

export async function deleteQuestion(id: string) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.recruitmentQuestion.delete({ where: { id } });
    revalidatePath("/admin/config");
    return { success: true };
  } catch (error) {
    console.error("Error deleting question:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

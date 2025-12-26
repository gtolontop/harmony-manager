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

// Services
const serviceSchema = z.object({
  name: z.string().min(2),
  price: z.number().min(0),
  categoryId: z.string().optional(),
});

export async function getServices() {
  return db.service.findMany({
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    include: {
      category: true,
    },
  });
}

export async function getServiceCategories() {
  return db.serviceCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { services: true },
      },
    },
  });
}

export async function createService(data: z.infer<typeof serviceSchema>) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.service.create({
      data: {
        name: data.name,
        price: data.price,
        categoryId: data.categoryId || null,
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
    await db.service.update({
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
    await db.service.delete({ where: { id } });
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

export async function createCategory(name: string) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.serviceCategory.create({
      data: { name },
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Erreur lors de la création" };
  }
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    // Move services to uncategorized first
    await db.service.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await db.serviceCategory.delete({ where: { id } });
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

// Vehicles
const vehicleSchema = z.object({
  name: z.string().min(2),
  brand: z.string().min(1),
  category: z.string().min(1),
  basePrice: z.number().min(0),
});

export async function getVehicles() {
  return db.vehicle.findMany({
    orderBy: [{ brand: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: { customisations: true },
      },
    },
  });
}

export async function createVehicle(data: z.infer<typeof vehicleSchema>) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.vehicle.create({ data });
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

// Questions
export async function getQuestions() {
  return db.candidatureQuestion.findMany({
    orderBy: { order: "asc" },
  });
}

export async function createQuestion(label: string, order: number) {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await db.candidatureQuestion.create({
      data: { label, order, isActive: true },
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
    await db.candidatureQuestion.update({
      where: { id },
      data,
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
    await db.candidatureQuestion.delete({ where: { id } });
    revalidatePath("/admin/config");
    return { success: true };
  } catch (error) {
    console.error("Error deleting question:", error);
    return { success: false, error: "Erreur lors de la suppression" };
  }
}

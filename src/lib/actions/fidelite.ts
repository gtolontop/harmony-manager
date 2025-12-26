"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PERMISSIONS, isStaff } from "@/lib/rbac";

const POINTS_PER_AMOUNT = 500000; // 1 point per 500,000
const BONUS_THRESHOLD = 10000000; // 20% bonus at 10,000,000
const BONUS_DISCOUNT = 20;

function calculateFidelity(totalSpent: number) {
  const points = Math.floor(totalSpent / POINTS_PER_AMOUNT);
  const bonusCount = Math.floor(totalSpent / BONUS_THRESHOLD);
  const currentDiscountPercent = bonusCount * BONUS_DISCOUNT;
  const amountToNextPoint = POINTS_PER_AMOUNT - (totalSpent % POINTS_PER_AMOUNT);
  const amountToNextBonus = BONUS_THRESHOLD - (totalSpent % BONUS_THRESHOLD);
  const pointsToNextBonus = Math.ceil(amountToNextBonus / POINTS_PER_AMOUNT);

  return {
    points,
    currentDiscountPercent,
    amountToNextPoint,
    pointsToNextBonus,
  };
}

export async function addFideliteOperation(discordId: string, amount: number) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non authentifié" };
  }

  if (!PERMISSIONS.addFidelityOperation(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  if (amount <= 0) {
    return { success: false, error: "Le montant doit être positif" };
  }

  try {
    // Find or create client user
    let clientUser = await db.user.findUnique({
      where: { discordId },
    });

    if (!clientUser) {
      return { success: false, error: "Utilisateur Discord introuvable. Le client doit d'abord se connecter." };
    }

    // Create operation
    await db.fideliteOperation.create({
      data: {
        userId: clientUser.id,
        mecanoId: session.user.id,
        amount,
      },
    });

    // Update or create fidelite stats
    const currentStats = await db.fideliteStats.findUnique({
      where: { userId: clientUser.id },
    });

    const newTotalSpent = (currentStats?.totalSpent || 0) + amount;
    const { points, currentDiscountPercent } = calculateFidelity(newTotalSpent);

    await db.fideliteStats.upsert({
      where: { userId: clientUser.id },
      create: {
        userId: clientUser.id,
        totalSpent: newTotalSpent,
        points,
        currentDiscountPercent,
      },
      update: {
        totalSpent: newTotalSpent,
        points,
        currentDiscountPercent,
      },
    });

    revalidatePath("/fidelite");
    return { success: true };
  } catch (error) {
    console.error("Error adding fidelite operation:", error);
    return { success: false, error: "Erreur lors de l'ajout de l'opération" };
  }
}

export async function getFideliteByDiscordId(discordId: string) {
  const session = await auth();
  if (!session?.user) return null;

  // Staff can lookup any user, clients can only see their own
  if (!isStaff(session.user.role) && session.user.discordId !== discordId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { discordId },
    include: {
      fideliteStats: true,
    },
  });

  if (!user) return null;

  const totalSpent = user.fideliteStats?.totalSpent || 0;
  const { points, currentDiscountPercent, amountToNextPoint, pointsToNextBonus } =
    calculateFidelity(totalSpent);

  return {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    totalSpent,
    points,
    currentDiscountPercent,
    amountToNextPoint,
    pointsToNextBonus,
  };
}

export async function getMyFidelite() {
  const session = await auth();
  if (!session?.user) return null;

  return getFideliteByDiscordId(session.user.discordId);
}

export async function getFideliteOperations(userId?: string) {
  const session = await auth();
  if (!session?.user) return [];

  const targetUserId = userId || session.user.id;

  // Only allow viewing own operations or if has permission
  if (targetUserId !== session.user.id && !PERMISSIONS.viewAllFidelity(session.user.role)) {
    return [];
  }

  return db.fideliteOperation.findMany({
    where: { userId: targetUserId },
    include: {
      mecano: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

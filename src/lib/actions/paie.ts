"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isManagement, isPatron, PAY_PERCENTAGES } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import type { Role } from "@prisma/client";

interface MecanoStats {
  id: string;
  username: string;
  displayName: string | null;
  role: Role;
  caWeek: number;
  payPercentage: number;
  payAmount: number;
  invoiceCount: number;
}

interface WeeklyStats {
  totalCA: number;
  totalPay: number;
  taxAmount: number;
  netProfit: number;
  mecanos: MecanoStats[];
}

export async function getWeeklyPayroll(): Promise<WeeklyStats | null> {
  const session = await auth();
  if (!session?.user?.role || !isManagement(session.user.role)) {
    return null;
  }

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Get all staff members
  const staffRoles: Role[] = ["recrue", "mecano_novice", "experimente", "chef_equipe", "patron", "superadmin"];

  const users = await db.user.findMany({
    where: { role: { in: staffRoles } },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
    },
  });

  // Get invoices for each user this week
  const mecanoStats: MecanoStats[] = await Promise.all(
    users.map(async (user) => {
      const invoices = await db.invoice.aggregate({
        where: {
          mecanoId: user.id,
          createdAt: { gte: startOfWeek },
          isWeeklyArchived: false,
        },
        _sum: { finalAmount: true },
        _count: true,
      });

      const caWeek = invoices._sum.finalAmount || 0;
      const payPercentage = PAY_PERCENTAGES[user.role] || 0;
      const payAmount = Math.floor(caWeek * (payPercentage / 100));

      return {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        caWeek,
        payPercentage,
        payAmount,
        invoiceCount: invoices._count,
      };
    })
  );

  // Filter only those with activity and sort by CA
  const activeMecanos = mecanoStats
    .filter((m) => m.caWeek > 0)
    .sort((a, b) => b.caWeek - a.caWeek);

  const totalCA = activeMecanos.reduce((sum, m) => sum + m.caWeek, 0);
  const totalPay = activeMecanos.reduce((sum, m) => sum + m.payAmount, 0);

  // Tax: 6% of total CA
  const taxRate = 0.06;
  const taxAmount = Math.floor(totalCA * taxRate);

  const netProfit = totalCA - totalPay - taxAmount;

  return {
    totalCA,
    totalPay,
    taxAmount,
    netProfit,
    mecanos: activeMecanos,
  };
}

export async function archiveWeeklyInvoices() {
  const session = await auth();
  if (!session?.user?.role || !isPatron(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  try {
    // Archive all invoices from this week
    const result = await db.invoice.updateMany({
      where: {
        createdAt: { gte: startOfWeek },
        isWeeklyArchived: false,
      },
      data: { isWeeklyArchived: true },
    });

    revalidatePath("/manager/paie");
    revalidatePath("/manager");
    revalidatePath("/stats");

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error archiving invoices:", error);
    return { success: false, error: "Erreur lors de l'archivage" };
  }
}

export async function getPayrollHistory(limit = 10) {
  const session = await auth();
  if (!session?.user?.role || !isManagement(session.user.role)) {
    return [];
  }

  // Get archived weeks by grouping archived invoices
  const archivedInvoices = await db.invoice.findMany({
    where: { isWeeklyArchived: true },
    select: {
      finalAmount: true,
      createdAt: true,
      mecano: {
        select: {
          id: true,
          username: true,
          displayName: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 1000, // Limit for performance
  });

  // Group by week
  const weeklyGroups: Record<string, typeof archivedInvoices> = {};

  archivedInvoices.forEach((inv) => {
    const date = new Date(inv.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const key = weekStart.toISOString();

    if (!weeklyGroups[key]) {
      weeklyGroups[key] = [];
    }
    weeklyGroups[key].push(inv);
  });

  // Calculate stats for each week
  return Object.entries(weeklyGroups)
    .map(([weekKey, invoices]) => {
      const totalCA = invoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
      const invoiceCount = invoices.length;

      return {
        weekStart: new Date(weekKey),
        totalCA,
        invoiceCount,
      };
    })
    .sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
    .slice(0, limit);
}

"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { invoiceSchema } from "@/lib/schemas/invoice";
import { revalidatePath } from "next/cache";
import { PERMISSIONS } from "@/lib/rbac";

function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HM-${year}${month}${day}-${random}`;
}

export async function createInvoice(data: {
  client: { firstname: string; name: string; cniPath?: string };
  vehicle: { vehicleId?: string; vehicleName: string; platePath?: string; isOutOfList: boolean };
  services: { serviceId: string; quantity: number }[];
  collaborationId?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Non authentifié" };
  }

  if (!PERMISSIONS.createInvoice(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = invoiceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  try {
    // Get services with prices
    const serviceIds = parsed.data.services.map((s) => s.serviceId);
    const services = await db.serviceCustomisation.findMany({
      where: { id: { in: serviceIds }, isActive: true },
    });

    if (services.length !== serviceIds.length) {
      return { success: false, error: "Certains services sont invalides" };
    }

    // Calculate amounts
    let baseAmount = 0;
    const invoiceServices = parsed.data.services.map((s) => {
      const service = services.find((srv) => srv.id === s.serviceId)!;
      const totalPrice = service.price * s.quantity;
      baseAmount += totalPrice;
      return {
        serviceId: service.id,
        serviceName: service.name,
        quantity: s.quantity,
        unitPrice: service.price,
        totalPrice,
      };
    });

    // Get collaboration discount if any
    let discountPercent = 0;
    let discountAmount = 0;
    let collaborationName: string | null = null;

    if (parsed.data.collaborationId) {
      const collaboration = await db.collaboration.findUnique({
        where: { id: parsed.data.collaborationId, isActive: true },
      });
      if (collaboration) {
        discountPercent = collaboration.discountPercent;
        discountAmount = Math.round(baseAmount * (discountPercent / 100));
        collaborationName = collaboration.name;
      }
    }

    const finalAmount = baseAmount - discountAmount;

    // Handle vehicle out of list
    if (parsed.data.vehicle.isOutOfList) {
      await db.vehicleOutOfList.create({
        data: {
          name: parsed.data.vehicle.vehicleName,
          mecanoId: session.user.id,
        },
      });
    }

    // Create invoice
    const invoice = await db.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        clientFirstname: parsed.data.client.firstname,
        clientName: parsed.data.client.name,
        clientCniPath: parsed.data.client.cniPath,
        vehicleId: parsed.data.vehicle.vehicleId,
        vehicleName: parsed.data.vehicle.vehicleName,
        vehiclePlatePath: parsed.data.vehicle.platePath,
        isOutOfList: parsed.data.vehicle.isOutOfList,
        baseAmount,
        discountPercent,
        discountAmount,
        finalAmount,
        collaborationId: parsed.data.collaborationId,
        collaborationName,
        mecanoId: session.user.id,
        services: {
          create: invoiceServices,
        },
      },
      include: {
        services: true,
      },
    });

    revalidatePath("/compta/facture");
    revalidatePath("/compta/historique");
    revalidatePath("/stats");

    return { success: true, invoice };
  } catch (error) {
    console.error("Error creating invoice:", error);
    return { success: false, error: "Erreur lors de la création de la facture" };
  }
}

export async function getInvoices(options?: {
  mecanoId?: string;
  weekOnly?: boolean;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) return [];

  const where: Record<string, unknown> = {};

  // Filter by mecano if specified or if user doesn't have access to all
  if (options?.mecanoId) {
    where.mecanoId = options.mecanoId;
  } else if (!PERMISSIONS.viewAllInvoices(session.user.role)) {
    where.mecanoId = session.user.id;
  }

  // Filter by week
  if (options?.weekOnly) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    where.createdAt = { gte: startOfWeek };
    where.isWeeklyArchived = false;
  }

  return db.invoice.findMany({
    where,
    include: {
      mecano: {
        select: {
          id: true,
          username: true,
          displayName: true,
          image: true,
        },
      },
      services: true,
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit,
  });
}

export async function getInvoiceStats(userId?: string) {
  const session = await auth();
  if (!session?.user) return null;

  const targetUserId = userId || session.user.id;

  // Only allow viewing own stats or if has permission
  if (targetUserId !== session.user.id && !PERMISSIONS.viewAllStats(session.user.role)) {
    return null;
  }

  const now = new Date();

  // Start of week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [total, month, week, count] = await Promise.all([
    db.invoice.aggregate({
      where: { mecanoId: targetUserId },
      _sum: { finalAmount: true },
    }),
    db.invoice.aggregate({
      where: {
        mecanoId: targetUserId,
        createdAt: { gte: startOfMonth },
      },
      _sum: { finalAmount: true },
    }),
    db.invoice.aggregate({
      where: {
        mecanoId: targetUserId,
        createdAt: { gte: startOfWeek },
        isWeeklyArchived: false,
      },
      _sum: { finalAmount: true },
    }),
    db.invoice.count({
      where: { mecanoId: targetUserId },
    }),
  ]);

  const caTotal = total._sum.finalAmount || 0;
  const caMonth = month._sum.finalAmount || 0;
  const caWeek = week._sum.finalAmount || 0;
  const weeklyObjective = 50000000;

  return {
    caTotal,
    caMonth,
    caWeek,
    invoiceCount: count,
    objectiveProgress: Math.min((caWeek / weeklyObjective) * 100, 100),
  };
}

export async function getServices() {
  return db.serviceCustomisation.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
}

export async function getVehicles() {
  return db.vehicle.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
}

export async function getCollaborations() {
  return db.collaboration.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

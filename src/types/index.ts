import type { Role, CandidatureStatus, TaxPeriodStatus } from "@prisma/client";

// Re-export Prisma types
export type { Role, CandidatureStatus, TaxPeriodStatus };

// User types
export interface UserBasic {
  id: string;
  discordId: string;
  username: string;
  displayName: string | null;
  image: string | null;
  role: Role;
}

// Invoice types
export interface InvoiceWithDetails {
  id: string;
  invoiceNumber: string;
  clientFirstname: string;
  clientName: string;
  clientCniPath: string | null;
  vehicleName: string;
  vehiclePlatePath: string | null;
  isOutOfList: boolean;
  baseAmount: number;
  discountPercent: number;
  discountAmount: number;
  finalAmount: number;
  collaborationName: string | null;
  mecano: UserBasic;
  services: {
    id: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  createdAt: Date;
}

// Stats types
export interface UserStats {
  caTotal: number;
  caMonth: number;
  caWeek: number;
  invoiceCount: number;
  objectiveProgress: number;
}

export interface TeamMemberStats extends UserBasic {
  stats: UserStats;
}

// Fidelity types
export interface FidelityInfo {
  userId: string;
  username: string;
  displayName: string | null;
  totalSpent: number;
  points: number;
  currentDiscountPercent: number;
  amountToNextPoint: number;
  pointsToNextBonus: number;
}

// Candidature types
export interface CandidatureWithDetails {
  id: string;
  user: UserBasic;
  pseudoRp: string;
  age: number;
  disponibilites: string;
  experienceRp: string;
  experienceMecano: string;
  motivations: string;
  visionRp: string;
  gestionConflits: string;
  status: CandidatureStatus;
  createdAt: Date;
  answers: {
    question: {
      label: string;
      fieldType: string;
    };
    answerText: string;
  }[];
  notes: {
    id: string;
    author: UserBasic;
    content: string;
    createdAt: Date;
  }[];
  statusHistory: {
    oldStatus: CandidatureStatus;
    newStatus: CandidatureStatus;
    author: UserBasic;
    createdAt: Date;
  }[];
}

// Tax types
export interface TaxPeriodInfo {
  id: string;
  periodKey: string;
  periodType: string;
  caTotal: number;
  totalPay: number;
  taxableBase: number;
  tvaAmount: number;
  profitTaxAmount: number;
  totalTax: number;
  status: TaxPeriodStatus;
  paidAmount: number | null;
  paidDate: string | null;
  paidNote: string | null;
}

// Admin settings types
export interface ThemeSettings {
  mode: "dark" | "light";
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface RecruitmentSettings {
  isOpen: boolean;
  introText: string;
  confirmationText: string;
}

// Service types
export interface ServiceCategory {
  name: string;
  services: {
    id: string;
    name: string;
    price: number;
    hasQuantity: boolean;
    isActive: boolean;
  }[];
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

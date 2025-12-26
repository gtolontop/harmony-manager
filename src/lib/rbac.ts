import { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Role hierarchy (higher number = more permissions)
export const ROLE_LEVELS: Record<Role, number> = {
  client: 0,
  recrue: 1,
  mecano_novice: 2,
  experimente: 3,
  chef_equipe: 4,
  patron: 5,
  superadmin: 6,
};

// Role display names
export const ROLE_NAMES: Record<Role, string> = {
  client: "Client",
  recrue: "Recrue",
  mecano_novice: "Mécano Novice",
  experimente: "Expérimenté",
  chef_equipe: "Chef d'équipe",
  patron: "Patron",
  superadmin: "Super Admin",
};

// Pay percentages by role
export const DEFAULT_PAY_PERCENTAGES: Record<Role, number> = {
  client: 0,
  recrue: 55,
  mecano_novice: 65,
  experimente: 75,
  chef_equipe: 80,
  patron: 85,
  superadmin: 85,
};

// Check if user has at least the specified role level
export function hasMinRole(userRole: Role, minRole: Role): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[minRole];
}

// Check if user has exactly one of the specified roles
export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

// Check if user is staff (any role above client)
export function isStaff(role: Role): boolean {
  return ROLE_LEVELS[role] >= ROLE_LEVELS.recrue;
}

// Check if user is management (chef_equipe or above)
export function isManagement(role: Role): boolean {
  return ROLE_LEVELS[role] >= ROLE_LEVELS.chef_equipe;
}

// Check if user is patron or superadmin
export function isPatron(role: Role): boolean {
  return ROLE_LEVELS[role] >= ROLE_LEVELS.patron;
}

// Check if user is superadmin
export function isSuperAdmin(role: Role): boolean {
  return role === "superadmin";
}

// Server-side auth guard - use in server components/actions
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

// Server-side role guard - use in server components/actions
export async function requireRole(minRole: Role) {
  const session = await requireAuth();
  if (!hasMinRole(session.user.role, minRole)) {
    redirect("/unauthorized");
  }
  return session;
}

// Server-side specific roles guard
export async function requireRoles(allowedRoles: Role[]) {
  const session = await requireAuth();
  if (!hasRole(session.user.role, allowedRoles)) {
    redirect("/unauthorized");
  }
  return session;
}

// Server-side staff guard
export async function requireStaff() {
  return requireRole("recrue");
}

// Server-side management guard
export async function requireManagement() {
  return requireRole("chef_equipe");
}

// Server-side patron guard
export async function requirePatron() {
  return requireRole("patron");
}

// Server-side superadmin guard
export async function requireSuperAdmin() {
  return requireRole("superadmin");
}

// Permission definitions for different features
export const PERMISSIONS = {
  // Invoices
  createInvoice: (role: Role) => isStaff(role),
  viewAllInvoices: (role: Role) => hasMinRole(role, "chef_equipe"),
  exportInvoices: (role: Role) => isPatron(role),

  // Fidelity
  viewOwnFidelity: () => true,
  addFidelityOperation: (role: Role) => isStaff(role),
  editFidelityOperation: (role: Role) => hasMinRole(role, "experimente"),
  viewAllFidelity: (role: Role) => isPatron(role),

  // Candidatures
  submitCandidature: (role: Role) => role === "client",
  viewCandidatures: (role: Role) => isManagement(role),
  addCandidatureNote: (role: Role) => isManagement(role),
  changeCandidatureStatus: (role: Role, fromStatus: string, toStatus: string) => {
    if (isPatron(role)) return true;
    if (role === "chef_equipe") {
      // Chef d'équipe can only: en_attente -> a_tester/refuse
      return fromStatus === "en_attente" && ["a_tester", "refuse"].includes(toStatus);
    }
    return false;
  },

  // Collaborations
  viewCollaborations: (role: Role) => isManagement(role),
  manageCollaborations: (role: Role) => isPatron(role),

  // Pay & Taxes
  viewPay: (role: Role) => isPatron(role),
  managePay: (role: Role) => isPatron(role),
  viewTaxes: (role: Role) => isPatron(role),
  manageTaxes: (role: Role) => isPatron(role),

  // Statistics
  viewOwnStats: (role: Role) => isStaff(role),
  viewTeamStats: (role: Role) => isManagement(role),
  viewAllStats: (role: Role) => isPatron(role),

  // Administration
  accessAdmin: (role: Role) => isSuperAdmin(role),
  manageServices: (role: Role) => isSuperAdmin(role),
  manageVehicles: (role: Role) => isSuperAdmin(role),
  manageTheme: (role: Role) => isSuperAdmin(role),
  resetData: (role: Role) => isSuperAdmin(role),
} as const;

// Aliases for backwards compatibility
export const PAY_PERCENTAGES = DEFAULT_PAY_PERCENTAGES;
export const ROLE_HIERARCHY = ROLE_LEVELS;
export const ROLE_LABELS = ROLE_NAMES;

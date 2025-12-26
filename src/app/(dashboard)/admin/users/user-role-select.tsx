"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/lib/actions/admin";
import { ROLE_LABELS, ROLE_HIERARCHY } from "@/lib/rbac";
import { toast } from "sonner";
import type { Role } from "@prisma/client";

interface UserRoleSelectProps {
  user: {
    id: string;
    role: Role;
  };
  currentUserId: string;
  currentUserRole: Role;
}

const AVAILABLE_ROLES: Role[] = [
  "client",
  "recrue",
  "mecano_novice",
  "experimente",
  "chef_equipe",
  "patron",
  "superadmin",
];

export function UserRoleSelect({ user, currentUserId, currentUserRole }: UserRoleSelectProps) {
  const [isPending, startTransition] = useTransition();

  const isOwnAccount = user.id === currentUserId;
  const currentHierarchy = ROLE_HIERARCHY[currentUserRole] || 0;
  const userHierarchy = ROLE_HIERARCHY[user.role] || 0;

  // Can only change roles of users with lower hierarchy
  const canChange = !isOwnAccount && userHierarchy < currentHierarchy;

  // Can only assign roles lower than own
  const availableRoles = AVAILABLE_ROLES.filter(
    (role) => (ROLE_HIERARCHY[role] || 0) < currentHierarchy
  );

  const handleChange = (newRole: Role) => {
    if (newRole === user.role) return;

    startTransition(async () => {
      const result = await updateUserRole(user.id, newRole);

      if (result.success) {
        toast.success("Rôle mis à jour");
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  if (!canChange) {
    return null;
  }

  return (
    <Select
      value={user.role}
      onValueChange={(v) => handleChange(v as Role)}
      disabled={isPending}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {ROLE_LABELS[role] || role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateCandidatureStatus } from "@/lib/actions/candidature";
import { toast } from "sonner";
import { PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

type CandidatureStatus = "en_attente" | "a_tester" | "accepte" | "refuse";

interface CandidatureActionsProps {
  candidature: {
    id: string;
    status: string;
  };
  userRole: Role;
}

const statusActions: {
  from: CandidatureStatus[];
  to: CandidatureStatus;
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  description: string;
}[] = [
  {
    from: ["en_attente"],
    to: "a_tester",
    label: "Passer à tester",
    variant: "default",
    description: "Le candidat sera convoqué pour un test en jeu.",
  },
  {
    from: ["en_attente", "a_tester"],
    to: "accepte",
    label: "Accepter",
    variant: "default",
    description: "Le candidat sera accepté et recevra le rôle de recrue.",
  },
  {
    from: ["en_attente", "a_tester"],
    to: "refuse",
    label: "Refuser",
    variant: "destructive",
    description: "Le candidat sera refusé. Cette action est définitive.",
  },
];

export function CandidatureActions({ candidature, userRole }: CandidatureActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [openDialog, setOpenDialog] = useState<CandidatureStatus | null>(null);

  const currentStatus = candidature.status as CandidatureStatus;

  const availableActions = statusActions.filter(
    (action) =>
      action.from.includes(currentStatus) &&
      PERMISSIONS.changeCandidatureStatus(userRole, currentStatus, action.to)
  );

  if (availableActions.length === 0) {
    return null;
  }

  const handleStatusChange = (newStatus: CandidatureStatus) => {
    startTransition(async () => {
      const result = await updateCandidatureStatus(candidature.id, newStatus);
      if (result.success) {
        toast.success("Statut mis à jour");
        setOpenDialog(null);
      } else {
        toast.error(result.error || "Erreur lors de la mise à jour");
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      {availableActions.map((action) => (
        <AlertDialog
          key={action.to}
          open={openDialog === action.to}
          onOpenChange={(open) => setOpenDialog(open ? action.to : null)}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant={action.variant}
              disabled={isPending}
              className={action.to === "accepte" ? "bg-green-600 hover:bg-green-700" : undefined}
            >
              {action.label}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer le changement de statut</AlertDialogTitle>
              <AlertDialogDescription>{action.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleStatusChange(action.to)}
                disabled={isPending}
                className={action.to === "refuse" ? "bg-destructive hover:bg-destructive/90" : undefined}
              >
                {isPending ? "En cours..." : "Confirmer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </div>
  );
}

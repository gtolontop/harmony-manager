"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateCollaboration, deleteCollaboration } from "@/lib/actions/collaboration";
import { toast } from "sonner";

interface CollaborationActionsProps {
  collaboration: {
    id: string;
    name: string;
    isActive: boolean;
  };
}

export function CollaborationActions({ collaboration }: CollaborationActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleToggleStatus = () => {
    startTransition(async () => {
      const result = await updateCollaboration(collaboration.id, {
        isActive: !collaboration.isActive,
      });

      if (result.success) {
        toast.success(
          collaboration.isActive ? "Collaboration désactivée" : "Collaboration activée"
        );
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCollaboration(collaboration.id);

      if (result.success) {
        toast.success("Collaboration supprimée");
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending}>
            •••
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleToggleStatus}>
            {collaboration.isActive ? "Désactiver" : "Activer"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la collaboration ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{collaboration.name}&quot; ?
              {collaboration.isActive &&
                " Si des factures sont liées, la collaboration sera désactivée au lieu d'être supprimée."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

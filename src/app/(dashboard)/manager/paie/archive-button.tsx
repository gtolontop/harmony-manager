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
import { archiveWeeklyInvoices } from "@/lib/actions/paie";
import { toast } from "sonner";

export function ArchiveWeekButton() {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleArchive = () => {
    startTransition(async () => {
      const result = await archiveWeeklyInvoices();

      if (result.success) {
        toast.success(`${result.count} factures archivées`);
        setOpen(false);
      } else {
        toast.error(result.error || "Erreur lors de l'archivage");
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" disabled={isPending}>
          Clôturer la semaine
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clôturer la semaine ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action va archiver toutes les factures de cette semaine.
            Les statistiques hebdomadaires seront remises à zéro et les paies
            pourront être versées. Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive} disabled={isPending}>
            {isPending ? "Archivage..." : "Confirmer la clôture"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

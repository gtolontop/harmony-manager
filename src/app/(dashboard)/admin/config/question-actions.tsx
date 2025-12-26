"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateQuestion, deleteQuestion } from "@/lib/actions/admin";
import { toast } from "sonner";

interface QuestionActionsProps {
  question: {
    id: string;
    label: string;
    isActive: boolean;
    order: number;
  };
}

export function QuestionActions({ question }: QuestionActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await updateQuestion(question.id, {
        isActive: !question.isActive,
      });

      if (result.success) {
        toast.success(question.isActive ? "Question désactivée" : "Question activée");
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Supprimer cette question ?")) return;

    startTransition(async () => {
      const result = await deleteQuestion(question.id);

      if (result.success) {
        toast.success("Question supprimée");
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          •••
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleToggle}>
          {question.isActive ? "Désactiver" : "Activer"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createQuestion } from "@/lib/actions/admin";
import { toast } from "sonner";

interface QuestionFormProps {
  existingCount: number;
}

export function QuestionForm({ existingCount }: QuestionFormProps) {
  const [label, setLabel] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!label.trim()) {
      toast.error("Veuillez entrer une question");
      return;
    }

    startTransition(async () => {
      const result = await createQuestion(label.trim(), existingCount + 1);

      if (result.success) {
        toast.success("Question ajoutée");
        setLabel("");
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        placeholder="Nouvelle question de candidature..."
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        disabled={isPending}
        className="flex-1"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Ajout..." : "Ajouter"}
      </Button>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addCandidatureNote } from "@/lib/actions/candidature";
import { toast } from "sonner";

interface AddNoteFormProps {
  candidatureId: string;
}

export function AddNoteForm({ candidatureId }: AddNoteFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Veuillez entrer une note");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("content", content.trim());
      const result = await addCandidatureNote(candidatureId, formData);
      if (result.success) {
        toast.success("Note ajoutée");
        setContent("");
      } else {
        toast.error(result.error || "Erreur lors de l'ajout");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Ajouter une note interne..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        disabled={isPending}
      />
      <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
        {isPending ? "Ajout..." : "Ajouter la note"}
      </Button>
    </form>
  );
}

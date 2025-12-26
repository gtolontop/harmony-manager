"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCollaboration } from "@/lib/actions/collaboration";
import { toast } from "sonner";

export function CollaborationForm() {
  const [name, setName] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Veuillez entrer un nom");
      return;
    }

    const percent = parseFloat(discountPercent);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      toast.error("Pourcentage invalide (0-100)");
      return;
    }

    startTransition(async () => {
      const result = await createCollaboration({
        name: name.trim(),
        discountPercent: percent,
        isActive: true,
      });

      if (result.success) {
        toast.success("Collaboration créée");
        setName("");
        setDiscountPercent("");
      } else {
        toast.error(result.error || "Erreur lors de la création");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px] space-y-2">
        <Label htmlFor="name">Nom de la collaboration</Label>
        <Input
          id="name"
          placeholder="Ex: Police, Hôpital..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="w-[150px] space-y-2">
        <Label htmlFor="discount">Réduction (%)</Label>
        <Input
          id="discount"
          type="number"
          min="0"
          max="100"
          step="1"
          placeholder="20"
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          disabled={isPending}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Ajouter"}
      </Button>
    </form>
  );
}

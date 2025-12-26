"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCollaboration } from "@/lib/actions/collaboration";
import { toast } from "sonner";

export function CollaborationForm() {
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Veuillez entrer un nom");
      return;
    }

    const value = parseFloat(discountValue);
    if (isNaN(value) || value < 0) {
      toast.error("Valeur de réduction invalide");
      return;
    }

    if (discountType === "percentage" && value > 100) {
      toast.error("Le pourcentage ne peut pas dépasser 100%");
      return;
    }

    startTransition(async () => {
      const result = await createCollaboration({
        name: name.trim(),
        discountType,
        discountValue: value,
        isActive: true,
      });

      if (result.success) {
        toast.success("Collaboration créée");
        setName("");
        setDiscountValue("");
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
        <Label>Type de réduction</Label>
        <Select
          value={discountType}
          onValueChange={(v) => setDiscountType(v as "percentage" | "fixed")}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Pourcentage</SelectItem>
            <SelectItem value="fixed">Montant fixe</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[150px] space-y-2">
        <Label htmlFor="value">
          {discountType === "percentage" ? "Pourcentage (%)" : "Montant (€)"}
        </Label>
        <Input
          id="value"
          type="number"
          min="0"
          max={discountType === "percentage" ? "100" : undefined}
          step={discountType === "percentage" ? "1" : "1000"}
          placeholder={discountType === "percentage" ? "20" : "50000"}
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          disabled={isPending}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Ajouter"}
      </Button>
    </form>
  );
}

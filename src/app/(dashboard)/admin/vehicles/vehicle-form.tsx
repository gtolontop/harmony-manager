"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVehicle } from "@/lib/actions/admin";
import { toast } from "sonner";

interface VehicleFormProps {
  existingCategories: string[];
}

export function VehicleForm({ existingCategories }: VehicleFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Veuillez entrer un nom");
      return;
    }

    startTransition(async () => {
      const result = await createVehicle({
        name: name.trim(),
        code: code.trim() || undefined,
        category: category.trim() || undefined,
      });

      if (result.success) {
        toast.success("Véhicule créé");
        setName("");
        setCode("");
        setCategory("");
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du véhicule</Label>
          <Input
            id="name"
            placeholder="Ex: BMW M4, Audi RS6..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Code (optionnel)</Label>
          <Input
            id="code"
            placeholder="Ex: m4, rs6..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <Input
            id="category"
            placeholder="Ex: Sport, SUV..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isPending}
            list="categories"
          />
          <datalist id="categories">
            {existingCategories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Ajouter le véhicule"}
      </Button>
    </form>
  );
}

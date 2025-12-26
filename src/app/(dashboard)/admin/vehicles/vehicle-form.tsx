"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVehicle } from "@/lib/actions/admin";
import { toast } from "sonner";

interface VehicleFormProps {
  existingBrands: string[];
  existingCategories: string[];
}

export function VehicleForm({ existingBrands, existingCategories }: VehicleFormProps) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !brand.trim() || !category.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) {
      toast.error("Prix invalide");
      return;
    }

    startTransition(async () => {
      const result = await createVehicle({
        name: name.trim(),
        brand: brand.trim(),
        category: category.trim(),
        basePrice: price,
      });

      if (result.success) {
        toast.success("Véhicule créé");
        setName("");
        setBrand("");
        setCategory("");
        setBasePrice("");
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Marque</Label>
          <Input
            id="brand"
            placeholder="Ex: BMW, Audi..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            disabled={isPending}
            list="brands"
          />
          <datalist id="brands">
            {existingBrands.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Modèle</Label>
          <Input
            id="name"
            placeholder="Ex: M4, RS6..."
            value={name}
            onChange={(e) => setName(e.target.value)}
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

        <div className="space-y-2">
          <Label htmlFor="price">Prix de base (€)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="10000"
            placeholder="500000"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Ajouter le véhicule"}
      </Button>
    </form>
  );
}

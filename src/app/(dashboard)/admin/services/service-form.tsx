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
import { createService } from "@/lib/actions/admin";
import { toast } from "sonner";

interface ServiceFormProps {
  categories: string[];
}

export function ServiceForm({ categories }: ServiceFormProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>("none");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Veuillez entrer un nom");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Prix invalide");
      return;
    }

    startTransition(async () => {
      const result = await createService({
        name: name.trim(),
        price: priceNum,
        category: category === "none" ? undefined : category,
      });

      if (result.success) {
        toast.success("Service créé");
        setName("");
        setPrice("");
        setCategory("none");
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px] space-y-2">
        <Label htmlFor="name">Nom du service</Label>
        <Input
          id="name"
          placeholder="Ex: Vidange, Pneus..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="w-[150px] space-y-2">
        <Label htmlFor="price">Prix (€)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="1000"
          placeholder="50000"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="w-[180px] space-y-2">
        <Label>Catégorie</Label>
        <Select value={category} onValueChange={setCategory} disabled={isPending}>
          <SelectTrigger>
            <SelectValue placeholder="Aucune" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Ajouter"}
      </Button>
    </form>
  );
}

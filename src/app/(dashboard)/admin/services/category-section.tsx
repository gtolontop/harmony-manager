"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createCategory, deleteCategory } from "@/lib/actions/admin";
import { toast } from "sonner";

interface CategorySectionProps {
  categories: {
    id: string;
    name: string;
    _count: { services: number };
  }[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  const [newCategory, setNewCategory] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory.trim()) {
      toast.error("Veuillez entrer un nom");
      return;
    }

    startTransition(async () => {
      const result = await createCategory(newCategory.trim());

      if (result.success) {
        toast.success("Catégorie créée");
        setNewCategory("");
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Supprimer la catégorie "${name}" ? Les services seront déplacés vers "Non catégorisés".`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategory(id);

      if (result.success) {
        toast.success("Catégorie supprimée");
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Catégories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleCreate} className="flex gap-2">
          <Input
            placeholder="Nouvelle catégorie..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={isPending}
            className="max-w-xs"
          />
          <Button type="submit" variant="secondary" disabled={isPending}>
            Ajouter
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted"
            >
              <span className="font-medium">{cat.name}</span>
              <Badge variant="secondary">{cat._count.services}</Badge>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                disabled={isPending}
                className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <span className="text-muted-foreground">Aucune catégorie</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

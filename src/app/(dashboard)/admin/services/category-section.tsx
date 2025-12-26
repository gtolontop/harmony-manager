"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CategorySectionProps {
  categories: string[];
  serviceCounts: Record<string, number>;
}

export function CategorySection({ categories, serviceCounts }: CategorySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Catégories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Les catégories sont définies sur chaque service. Voici les catégories existantes :
        </p>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted"
            >
              <span className="font-medium">{cat}</span>
              <Badge variant="secondary">{serviceCounts[cat] || 0}</Badge>
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

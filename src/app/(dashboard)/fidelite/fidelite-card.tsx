"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FideliteCardProps {
  fidelite: {
    userId: string;
    username: string;
    displayName: string | null;
    totalSpent: number;
    points: number;
    currentDiscountPercent: number;
    amountToNextPoint: number;
    pointsToNextBonus: number;
  };
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR").format(amount);
}

export function FideliteCard({ fidelite }: FideliteCardProps) {
  const progressToNextPoint = ((500000 - fidelite.amountToNextPoint) / 500000) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Vos points fidélité</span>
          {fidelite.currentDiscountPercent > 0 && (
            <span className="text-chart-2 text-lg">
              -{fidelite.currentDiscountPercent}% actif
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground">Total dépensé</div>
            <div className="text-2xl font-bold">{formatAmount(fidelite.totalSpent)}</div>
          </div>
          <div className="p-4 rounded-lg bg-primary/10">
            <div className="text-sm text-muted-foreground">Points actuels</div>
            <div className="text-2xl font-bold text-primary">{fidelite.points}</div>
          </div>
          <div className="p-4 rounded-lg bg-chart-2/10">
            <div className="text-sm text-muted-foreground">Réduction cumulée</div>
            <div className="text-2xl font-bold text-chart-2">
              {fidelite.currentDiscountPercent}%
            </div>
          </div>
        </div>

        {/* Progress to next point */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prochain point</span>
            <span>{formatAmount(fidelite.amountToNextPoint)} restants</span>
          </div>
          <Progress value={progressToNextPoint} className="h-2" />
        </div>

        {/* Points to next bonus */}
        <div className="p-4 rounded-lg border border-dashed">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Prochaine réduction de 20%</div>
              <div className="text-sm text-muted-foreground">
                Plus que {fidelite.pointsToNextBonus} points à accumuler
              </div>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

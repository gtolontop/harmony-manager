"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Candidature } from "@prisma/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  en_attente: { label: "En attente", variant: "secondary" },
  a_tester: { label: "À tester", variant: "default" },
  accepte: { label: "Accepté", variant: "default" },
  refuse: { label: "Refusé", variant: "destructive" },
};

interface MyCandidaturesProps {
  candidatures: Candidature[];
}

export function MyCandidatures({ candidatures }: MyCandidaturesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mes candidatures</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {candidatures.map((c) => {
            const config = statusConfig[c.status] || statusConfig.en_attente;
            return (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div>
                  <p className="font-medium">{c.pseudoRp}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(c.createdAt), "d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
                <Badge
                  variant={config.variant}
                  className={
                    c.status === "accepte"
                      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                      : undefined
                  }
                >
                  {config.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import { requireManagement } from "@/lib/rbac";
import { getCandidatures } from "@/lib/actions/candidature";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const metadata = {
  title: "Gestion des candidatures",
};

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  en_attente: { label: "En attente", variant: "secondary" },
  a_tester: { label: "À tester", variant: "default" },
  accepte: { label: "Accepté", variant: "default" },
  refuse: { label: "Refusé", variant: "destructive" },
};

export default async function ManagerRecrutementPage() {
  await requireManagement();
  const candidatures = await getCandidatures();

  const countByStatus = candidatures.reduce(
    (acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidatures</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les candidatures des futurs mécanos.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/manager">← Retour</Link>
        </Button>
      </div>

      {/* Status counts */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {Object.entries(statusConfig).map(([status, config]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {config.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{countByStatus[status] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Candidatures table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des candidatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Pseudo RP</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidatures.map((c) => {
                  const config = statusConfig[c.status];
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {c.user.displayName || c.user.username}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            @{c.user.username}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{c.pseudoRp}</TableCell>
                      <TableCell>
                        <Badge
                          variant={config.variant}
                          className={
                            c.status === "accepte"
                              ? "bg-green-500/10 text-green-500"
                              : undefined
                          }
                        >
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(c.createdAt), "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/manager/recrutement/${c.id}`}>Voir</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {candidatures.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucune candidature pour le moment
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

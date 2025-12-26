import { requireManagement } from "@/lib/rbac";
import { getInvoices } from "@/lib/actions/invoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  title: "Historique des factures",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR").format(price) + " €";
}

export default async function HistoriquePage() {
  await requireManagement();

  const [weekInvoices, allInvoices] = await Promise.all([
    getInvoices({ weekOnly: true }),
    getInvoices({ limit: 100 }),
  ]);

  // Calculate week stats
  const weekTotal = weekInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
  const weekCount = weekInvoices.length;

  // Group by mecano for week
  const weekByMecano = weekInvoices.reduce(
    (acc, inv) => {
      const key = inv.mecano.id;
      if (!acc[key]) {
        acc[key] = {
          mecano: inv.mecano,
          count: 0,
          total: 0,
        };
      }
      acc[key].count++;
      acc[key].total += inv.finalAmount;
      return acc;
    },
    {} as Record<string, { mecano: typeof weekInvoices[0]["mecano"]; count: number; total: number }>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Historique des factures</h1>
        <p className="text-muted-foreground mt-2">
          Consultez l&apos;historique complet des factures et les statistiques hebdomadaires.
        </p>
      </div>

      {/* Week stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures cette semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CA de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatPrice(weekTotal)}</div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CA par mécano (semaine)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.values(weekByMecano).map(({ mecano, count, total }) => (
                <div
                  key={mecano.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm"
                >
                  <span className="font-medium">{mecano.displayName || mecano.username}</span>
                  <span className="text-muted-foreground">
                    {count} · {formatPrice(total)}
                  </span>
                </div>
              ))}
              {Object.keys(weekByMecano).length === 0 && (
                <span className="text-muted-foreground">Aucune facture cette semaine</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice list */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des factures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Facture</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Collaboration</TableHead>
                  <TableHead>Mécano</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      {invoice.clientFirstname} {invoice.clientName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {invoice.vehicleName}
                        {invoice.isOutOfList && (
                          <Badge variant="outline" className="text-xs">
                            Hors liste
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(invoice.finalAmount)}
                    </TableCell>
                    <TableCell>
                      {invoice.collaborationName ? (
                        <Badge variant="secondary">{invoice.collaborationName}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{invoice.mecano.displayName || invoice.mecano.username}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(invoice.createdAt), "d MMM yyyy", { locale: fr })}
                    </TableCell>
                  </TableRow>
                ))}
                {allInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Aucune facture pour le moment
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

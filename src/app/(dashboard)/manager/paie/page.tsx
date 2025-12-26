import { requireManagement, isPatron, PAY_PERCENTAGES, ROLE_LABELS } from "@/lib/rbac";
import { getWeeklyPayroll, getPayrollHistory } from "@/lib/actions/paie";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { ArchiveWeekButton } from "./archive-button";

export const metadata = {
  title: "Paie & Impôts",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR").format(price) + " €";
}

export default async function PaiePage() {
  const session = await requireManagement();
  const payroll = await getWeeklyPayroll();
  const history = await getPayrollHistory(5);

  const canArchive = isPatron(session.user.role);

  if (!payroll) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Paie & Impôts</h1>
          <p className="text-muted-foreground mt-2">Erreur de chargement.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paie & Impôts</h1>
          <p className="text-muted-foreground mt-2">
            Calculez les paies hebdomadaires et les impôts.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/manager">← Retour</Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CA de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(payroll.totalCA)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total paies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              -{formatPrice(payroll.totalPay)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Impôts (6%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              -{formatPrice(payroll.taxAmount)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bénéfice net
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                payroll.netProfit >= 0 ? "text-green-500" : "text-destructive"
              }`}
            >
              {payroll.netProfit >= 0 ? "+" : ""}
              {formatPrice(payroll.netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Paies de la semaine</CardTitle>
          {canArchive && payroll.mecanos.length > 0 && <ArchiveWeekButton />}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mécano</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Factures</TableHead>
                  <TableHead className="text-right">CA</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-right">Paie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.mecanos.map((mecano) => (
                  <TableRow key={mecano.id}>
                    <TableCell className="font-medium">
                      {mecano.displayName || mecano.username}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ROLE_LABELS[mecano.role] || mecano.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{mecano.invoiceCount}</TableCell>
                    <TableCell className="text-right">{formatPrice(mecano.caWeek)}</TableCell>
                    <TableCell className="text-right">{mecano.payPercentage}%</TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatPrice(mecano.payAmount)}
                    </TableCell>
                  </TableRow>
                ))}
                {payroll.mecanos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune activité cette semaine
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pay percentage reference */}
          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-3">Barème des paies</h4>
            <div className="flex flex-wrap gap-3">
              {Object.entries(PAY_PERCENTAGES).map(([role, percentage]) => (
                <div
                  key={role}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background text-sm"
                >
                  <span>{ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}</span>
                  <span className="text-primary font-medium">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des semaines archivées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((week, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <div className="font-medium">
                      Semaine du {format(week.weekStart, "d MMMM yyyy", { locale: fr })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {week.invoiceCount} facture{week.invoiceCount > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-lg font-bold">{formatPrice(week.totalCA)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

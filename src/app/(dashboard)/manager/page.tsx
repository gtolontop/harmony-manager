import { requireManagement } from "@/lib/rbac";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Manager",
};

async function getDashboardStats() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [pendingCandidatures, weekInvoices, activeCollaborations] = await Promise.all([
    db.candidature.count({ where: { status: "en_attente" } }),
    db.invoice.aggregate({
      where: { createdAt: { gte: startOfWeek }, isWeeklyArchived: false },
      _sum: { finalAmount: true },
      _count: true,
    }),
    db.collaboration.count({ where: { isActive: true } }),
  ]);

  return {
    pendingCandidatures,
    weekCA: weekInvoices._sum.finalAmount || 0,
    weekCount: weekInvoices._count || 0,
    activeCollaborations,
  };
}

export default async function ManagerPage() {
  await requireManagement();
  const stats = await getDashboardStats();

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " €";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Manager</h1>
        <p className="text-muted-foreground mt-2">
          Tableau de bord de gestion Harmony Motors.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Candidatures en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCandidatures}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CA de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatPrice(stats.weekCA)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures (semaine)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collaborations actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCollaborations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">Recrutement</CardTitle>
            <CardDescription>Gérer les candidatures et les entretiens.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/manager/recrutement">Voir les candidatures</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">Collaborations</CardTitle>
            <CardDescription>Gérer les partenariats et réductions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/manager/collaborations">Gérer les collaborations</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="text-lg">Paie & Impôts</CardTitle>
            <CardDescription>Calculer les paies et gérer les impôts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/manager/paie">Voir la paie</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

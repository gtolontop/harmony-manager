import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireStaff, isManagement, isPatron } from "@/lib/rbac";
import { getInvoiceStats } from "@/lib/actions/invoice";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = {
  title: "Statistiques",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR").format(price) + " €";
}

async function getTeamStats() {
  const users = await db.user.findMany({
    where: {
      role: { in: ["recrue", "mecano_novice", "experimente", "chef_equipe", "patron", "superadmin"] },
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      image: true,
      role: true,
    },
  });

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = await Promise.all(
    users.map(async (user) => {
      const [week, month, total] = await Promise.all([
        db.invoice.aggregate({
          where: {
            mecanoId: user.id,
            createdAt: { gte: startOfWeek },
            isWeeklyArchived: false,
          },
          _sum: { finalAmount: true },
        }),
        db.invoice.aggregate({
          where: {
            mecanoId: user.id,
            createdAt: { gte: startOfMonth },
          },
          _sum: { finalAmount: true },
        }),
        db.invoice.aggregate({
          where: { mecanoId: user.id },
          _sum: { finalAmount: true },
        }),
      ]);

      return {
        ...user,
        caWeek: week._sum.finalAmount || 0,
        caMonth: month._sum.finalAmount || 0,
        caTotal: total._sum.finalAmount || 0,
      };
    })
  );

  return stats.sort((a, b) => b.caWeek - a.caWeek);
}

export default async function StatsPage() {
  const session = await requireStaff();

  const myStats = await getInvoiceStats();
  const showTeam = isManagement(session.user.role);
  const teamStats = showTeam ? await getTeamStats() : [];

  const weeklyObjective = 50000000;
  const objectiveReached = (myStats?.caWeek || 0) >= weeklyObjective;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mes Statistiques</h1>
        <p className="text-muted-foreground mt-2">
          Suivez vos performances et votre progression vers vos objectifs.
        </p>
      </div>

      {/* Personal stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CA Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(myStats?.caTotal || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CA du mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(myStats?.caMonth || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CA de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(myStats?.caWeek || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures créées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myStats?.invoiceCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly objective */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Objectif hebdomadaire</span>
            {objectiveReached && (
              <span className="text-chart-2 text-sm font-normal">Objectif atteint !</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>{formatPrice(myStats?.caWeek || 0)}</span>
            <span className="text-muted-foreground">{formatPrice(weeklyObjective)}</span>
          </div>
          <Progress
            value={myStats?.objectiveProgress || 0}
            className={`h-3 ${objectiveReached ? "[&>div]:bg-chart-2" : ""}`}
          />
          <p className="text-sm text-muted-foreground">
            {objectiveReached
              ? "Félicitations ! Vous avez atteint votre objectif cette semaine."
              : `Il vous reste ${formatPrice(
                  weeklyObjective - (myStats?.caWeek || 0)
                )} pour atteindre votre objectif.`}
          </p>
        </CardContent>
      </Card>

      {/* Team stats (management only) */}
      {showTeam && teamStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques de l&apos;équipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamStats.map((member) => {
                const progress = (member.caWeek / weeklyObjective) * 100;
                const reached = member.caWeek >= weeklyObjective;
                return (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          {(member.displayName || member.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">
                            {member.displayName || member.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Semaine: {formatPrice(member.caWeek)} · Mois:{" "}
                            {formatPrice(member.caMonth)}
                          </div>
                        </div>
                      </div>
                      {reached && <span className="text-chart-2 text-sm">✓</span>}
                    </div>
                    <Progress
                      value={Math.min(progress, 100)}
                      className={`h-2 ${reached ? "[&>div]:bg-chart-2" : ""}`}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

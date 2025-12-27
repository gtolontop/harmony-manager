import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyFidelite } from "@/lib/actions/fidelite";
import { isStaff } from "@/lib/rbac";
import { FideliteCard } from "./fidelite-card";
import { AddOperationForm } from "./add-operation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Programme Fidélité",
};

export default async function FidelitePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const fidelite = await getMyFidelite();
  const canAddOperation = isStaff(session.user.role);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Programme Fidélité</h1>
        <p className="text-muted-foreground mt-1">
          Cumulez des points et profitez de réductions exclusives
        </p>
      </div>

      {/* Rules reminder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-primary">1 point</div>
              <div className="text-sm text-muted-foreground">par 500 000 dépensés</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-chart-2">+20%</div>
              <div className="text-sm text-muted-foreground">de réduction à 10M</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-chart-3">Cumulable</div>
              <div className="text-sm text-muted-foreground">à chaque palier</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User fidelity stats */}
      {fidelite ? (
        <FideliteCard fidelite={fidelite} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pas encore de points</CardTitle>
            <CardDescription>
              Vous n&apos;avez pas encore de points de fidélité. Passez chez Harmony Motors pour
              commencer à en accumuler !
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Staff: Add operation form */}
      {canAddOperation && <AddOperationForm />}
    </div>
  );
}

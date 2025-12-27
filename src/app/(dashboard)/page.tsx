import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { isStaff } from "@/lib/rbac";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;
  const showStaffLinks = isStaff(user.role);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Bienvenue, {user.displayName || user.username}
        </h1>
        <p className="text-muted-foreground mt-1">
          Votre espace de gestion Harmony Motors
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Recrutement Card */}
        {user.role === "client" && (
          <Card className="group hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <CardTitle className="text-base">Rejoignez-nous</CardTitle>
              <CardDescription className="text-sm">
                Postulez pour rejoindre l&apos;équipe
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild size="sm" className="w-full">
                <Link href="/recrutement">Postuler</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Programme Fidélité Card */}
        <Card className="group hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle className="text-base">Programme Fidélité</CardTitle>
            <CardDescription className="text-sm">
              Vos points et réductions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild size="sm" variant="secondary" className="w-full">
              <Link href="/fidelite">Voir mes points</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Staff Only: Facturation */}
        {showStaffLinks && (
          <Card className="group hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <CardTitle className="text-base">Facturation</CardTitle>
              <CardDescription className="text-sm">
                Créer une nouvelle facture
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild size="sm" variant="secondary" className="w-full">
                <Link href="/compta/facture">Nouvelle facture</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Staff Only: Statistiques */}
        {showStaffLinks && (
          <Card className="group hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <CardTitle className="text-base">Mes Statistiques</CardTitle>
              <CardDescription className="text-sm">
                Performances et objectifs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button asChild size="sm" variant="secondary" className="w-full">
                <Link href="/stats">Voir mes stats</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">100+</div>
              <p className="text-sm text-muted-foreground mt-1">Services disponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <p className="text-sm text-muted-foreground mt-1">Disponibilité</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">Elite</div>
              <p className="text-sm text-muted-foreground mt-1">Qualité de service</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

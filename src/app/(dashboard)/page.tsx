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
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Bienvenue, {user.displayName || user.username}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Harmony Motors - Votre partenaire performance automobile. Expertise,
          créativité et technologies de pointe au service de votre véhicule.
        </p>
      </section>

      {/* Quick Actions */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recrutement Card */}
        {user.role === "client" && (
          <Card className="hover-lift">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <CardTitle>Rejoignez-nous</CardTitle>
              <CardDescription>
                Vous êtes passionné d&apos;automobile ? Postulez pour rejoindre l&apos;équipe Harmony Motors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/recrutement">Postuler maintenant</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Programme Fidélité Card */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle>Programme Fidélité</CardTitle>
            <CardDescription>
              Gagnez des points à chaque passage et bénéficiez de réductions exclusives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link href="/fidelite">Voir mes points</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Staff Only: Facturation */}
        {showStaffLinks && (
          <Card className="hover-lift">
            <CardHeader>
              <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <CardTitle>Facturation</CardTitle>
              <CardDescription>
                Créez et gérez les factures de customisation pour vos clients.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/compta/facture">Nouvelle facture</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Staff Only: Statistiques */}
        {showStaffLinks && (
          <Card className="hover-lift">
            <CardHeader>
              <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-chart-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <CardTitle>Mes Statistiques</CardTitle>
              <CardDescription>
                Suivez vos performances et votre progression vers vos objectifs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" className="w-full">
                <Link href="/stats">Voir mes stats</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* About Section */}
      <section className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>À propos de Harmony Motors</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p className="text-muted-foreground">
              Harmony Motors est la référence automobile du comté. Du detailing premium
              à la préparation compétition, nos équipes combinent expertise, créativité
              et technologies de pointe pour offrir des interventions sur mesure.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-6 not-prose">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-sm text-muted-foreground">Services disponibles</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Disponibilité</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold text-primary">Elite</div>
                <div className="text-sm text-muted-foreground">Qualité de service</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

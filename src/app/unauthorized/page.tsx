import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

const roleLabels: Record<string, string> = {
  client: "Client",
  recrue: "Recrue",
  mecano_novice: "Mécano Novice",
  experimente: "Expérimenté",
  chef_equipe: "Chef d'équipe",
  patron: "Patron",
  superadmin: "Super Admin",
};

export default async function UnauthorizedPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-semibold">Accès non autorisé</CardTitle>
          <CardDescription>
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center gap-3">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{session.user.displayName || session.user.username}</p>
                <p className="text-sm text-muted-foreground">@{session.user.username}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-border mt-2">
              <p className="text-sm">
                <span className="text-muted-foreground">Rôle actuel :</span>{" "}
                <span className="font-medium">{roleLabels[session.user.role] || session.user.role}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Discord ID :</span>{" "}
                <code className="text-xs bg-background px-1 py-0.5 rounded">{session.user.discordId}</code>
              </p>
            </div>
          </div>

          {/* Info box */}
          <div className="p-3 text-sm bg-blue-500/10 text-blue-700 dark:text-blue-300 rounded-md">
            <p className="font-medium mb-1">Comment obtenir un accès ?</p>
            <p className="text-xs opacity-90">
              Contactez un administrateur sur Discord pour demander une promotion de rôle.
              Votre Discord ID ci-dessus sera nécessaire.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <Link href="/compta/facture">Retour au tableau de bord</Link>
            </Button>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button type="submit" variant="ghost" className="w-full text-destructive hover:text-destructive">
                Se déconnecter
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

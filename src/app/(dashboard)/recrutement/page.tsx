import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CandidatureForm } from "./candidature-form";
import { MyCandidatures } from "./my-candidatures";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Recrutement",
};

async function getRecruitmentSettings() {
  const setting = await db.adminSetting.findUnique({
    where: { key: "recruitment" },
  });
  if (!setting) {
    return { isOpen: true, introText: "", confirmationText: "" };
  }
  return JSON.parse(setting.value);
}

async function getActiveQuestions() {
  return db.recruitmentQuestion.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

async function getUserCandidatures(userId: string) {
  return db.candidature.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export default async function RecrutementPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [settings, questions, candidatures] = await Promise.all([
    getRecruitmentSettings(),
    getActiveQuestions(),
    getUserCandidatures(session.user.id),
  ]);

  // Only clients can apply
  if (session.user.role !== "client") {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Recrutement</CardTitle>
            <CardDescription>
              Vous êtes déjà membre de l&apos;équipe Harmony Motors !
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              En tant que membre du staff, vous n&apos;avez pas accès au formulaire de candidature.
              Rendez-vous dans la section Manager pour gérer les candidatures.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if recruitment is closed
  if (!settings.isOpen) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Recrutement
              <Badge variant="destructive">Fermé</Badge>
            </CardTitle>
            <CardDescription>
              Les recrutements sont actuellement fermés.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nous ne prenons pas de nouvelles candidatures pour le moment.
              Revenez plus tard ou suivez nos annonces sur Discord.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has pending candidature
  const hasPending = candidatures.some(
    (c) => c.status === "en_attente" || c.status === "a_tester"
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Rejoindre Harmony Motors</h1>
        <p className="text-muted-foreground mt-2">
          Vous souhaitez faire partie de notre équipe ? Remplissez le formulaire ci-dessous.
        </p>
      </div>

      {settings.introText && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground whitespace-pre-wrap">{settings.introText}</p>
          </CardContent>
        </Card>
      )}

      {candidatures.length > 0 && (
        <MyCandidatures candidatures={candidatures} />
      )}

      {hasPending ? (
        <Card>
          <CardHeader>
            <CardTitle>Candidature en cours</CardTitle>
            <CardDescription>
              Vous avez déjà une candidature en attente de traitement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Veuillez patienter pendant que notre équipe examine votre dossier.
              Vous serez contacté via Discord pour la suite du processus.
            </p>
          </CardContent>
        </Card>
      ) : (
        <CandidatureForm questions={questions} />
      )}
    </div>
  );
}

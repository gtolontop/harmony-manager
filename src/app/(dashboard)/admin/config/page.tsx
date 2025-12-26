import { requirePatron } from "@/lib/rbac";
import { getQuestions } from "@/lib/actions/admin";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionForm } from "./question-form";
import { QuestionActions } from "./question-actions";

export const metadata = {
  title: "Configuration",
};

export default async function AdminConfigPage() {
  await requirePatron();
  const questions = await getQuestions();

  const activeQuestions = questions.filter((q) => q.isActive);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les questions de candidature et paramètres globaux.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">← Retour</Link>
        </Button>
      </div>

      {/* Candidature questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions de candidature</CardTitle>
          <CardDescription>
            Ces questions supplémentaires seront affichées dans le formulaire de candidature.
            Les questions de base (pseudo RP, âge, disponibilités, etc.) sont toujours présentes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <QuestionForm existingCount={questions.length} />

          {questions.length > 0 ? (
            <div className="space-y-2">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    question.isActive ? "bg-background" : "bg-muted/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {question.order}
                    </div>
                    <div>
                      <div className="font-medium">{question.label}</div>
                      {!question.isActive && (
                        <Badge variant="secondary" className="mt-1">
                          Désactivée
                        </Badge>
                      )}
                    </div>
                  </div>
                  <QuestionActions question={question} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucune question supplémentaire configurée.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Global settings info */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres globaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Objectif hebdomadaire
              </div>
              <div className="text-xl font-bold">50 000 000 €</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Taux d&apos;imposition
              </div>
              <div className="text-xl font-bold">6%</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Points fidélité
              </div>
              <div className="text-xl font-bold">1 point / 500 000 €</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Bonus fidélité
              </div>
              <div className="text-xl font-bold">+20% à 10 000 000 €</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Ces paramètres sont définis dans le code et nécessitent une modification technique pour être changés.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

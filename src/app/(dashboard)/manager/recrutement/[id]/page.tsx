import { requireManagement, PERMISSIONS } from "@/lib/rbac";
import { getCandidatureById } from "@/lib/actions/candidature";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CandidatureActions } from "./candidature-actions";
import { AddNoteForm } from "./add-note-form";

export const metadata = {
  title: "Détail candidature",
};

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  en_attente: { label: "En attente", variant: "secondary" },
  a_tester: { label: "À tester", variant: "default" },
  accepte: { label: "Accepté", variant: "default" },
  refuse: { label: "Refusé", variant: "destructive" },
};

export default async function CandidatureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireManagement();
  const { id } = await params;
  const candidature = await getCandidatureById(id);

  if (!candidature) {
    notFound();
  }

  const config = statusConfig[candidature.status];
  const canChangeStatus = PERMISSIONS.changeCandidatureStatus(
    session.user.role,
    candidature.status,
    "a_tester"
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              {candidature.user.displayName || candidature.user.username}
            </h1>
            <Badge
              variant={config.variant}
              className={
                candidature.status === "accepte"
                  ? "bg-green-500/10 text-green-500"
                  : undefined
              }
            >
              {config.label}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Candidature du{" "}
            {format(new Date(candidature.createdAt), "d MMMM yyyy à HH:mm", { locale: fr })}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/manager/recrutement">← Retour</Link>
        </Button>
      </div>

      {/* Status actions */}
      {canChangeStatus && (
        <CandidatureActions candidature={candidature} userRole={session.user.role} />
      )}

      {/* Main info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">Discord</div>
              <div className="font-medium">@{candidature.user.username}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Pseudo RP</div>
              <div className="font-medium">{candidature.pseudoRp}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Âge</div>
              <div className="font-medium">{candidature.age} ans</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Disponibilités
              </div>
              <p className="whitespace-pre-wrap">{candidature.disponibilites}</p>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Expérience RP
              </div>
              <p className="whitespace-pre-wrap">{candidature.experienceRp}</p>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Expérience Mécano
              </div>
              <p className="whitespace-pre-wrap">{candidature.experienceMecano}</p>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Motivations
              </div>
              <p className="whitespace-pre-wrap">{candidature.motivations}</p>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Vision du RP Mécano
              </div>
              <p className="whitespace-pre-wrap">{candidature.visionRp}</p>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Gestion des conflits
              </div>
              <p className="whitespace-pre-wrap">{candidature.gestionConflits}</p>
            </div>
          </div>

          {/* Dynamic answers */}
          {candidature.answers.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Questions supplémentaires</h4>
                {candidature.answers.map((answer) => (
                  <div key={answer.question.label}>
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {answer.question.label}
                    </div>
                    <p className="whitespace-pre-wrap">{answer.answerText}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes internes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddNoteForm candidatureId={candidature.id} />

          <Separator />

          {candidature.notes.length > 0 ? (
            <div className="space-y-4">
              {candidature.notes.map((note) => (
                <div key={note.id} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">
                      {note.author.displayName || note.author.username}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(note.createdAt), "d MMM yyyy à HH:mm", { locale: fr })}
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Aucune note pour le moment</p>
          )}
        </CardContent>
      </Card>

      {/* Status history */}
      {candidature.statusHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des statuts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {candidature.statusHistory.map((history) => (
                <div
                  key={history.createdAt.toString()}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{statusConfig[history.oldStatus].label}</Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant={statusConfig[history.newStatus].variant}>
                      {statusConfig[history.newStatus].label}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    par {history.author.displayName || history.author.username} ·{" "}
                    {format(new Date(history.createdAt), "d MMM à HH:mm", { locale: fr })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

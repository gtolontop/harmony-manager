"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { submitCandidature } from "@/lib/actions/candidature";

interface Question {
  id: string;
  label: string;
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
  options: string | null;
}

interface CandidatureFormProps {
  questions: Question[];
}

export function CandidatureForm({ questions }: CandidatureFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptRules, setAcceptRules] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!acceptRules) {
      toast.error("Vous devez accepter le règlement");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("acceptRules", "true");

    const result = await submitCandidature(formData);

    if (result.success) {
      toast.success("Candidature envoyée avec succès !");
      router.refresh();
    } else {
      toast.error(result.error || "Une erreur est survenue");
    }

    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulaire de candidature</CardTitle>
        <CardDescription>
          Tous les champs marqués d&apos;un * sont obligatoires
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fixed fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pseudoRp">Pseudo RP *</Label>
              <Input
                id="pseudoRp"
                name="pseudoRp"
                placeholder="Votre pseudo en jeu"
                required
                minLength={2}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Âge *</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="Votre âge"
                required
                min={16}
                max={99}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disponibilites">Disponibilités *</Label>
            <textarea
              id="disponibilites"
              name="disponibilites"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Quand êtes-vous disponible pour jouer ?"
              required
              minLength={10}
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceRp">Expérience RP *</Label>
            <textarea
              id="experienceRp"
              name="experienceRp"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Décrivez votre expérience en roleplay..."
              required
              minLength={20}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceMecano">Expérience Mécano *</Label>
            <textarea
              id="experienceMecano"
              name="experienceMecano"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Avez-vous déjà travaillé en tant que mécano sur FiveM ?"
              required
              minLength={20}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivations">Motivations *</Label>
            <textarea
              id="motivations"
              name="motivations"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Pourquoi souhaitez-vous rejoindre Harmony Motors ?"
              required
              minLength={20}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visionRp">Vision du RP Mécano *</Label>
            <textarea
              id="visionRp"
              name="visionRp"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Comment voyez-vous le RP en tant que mécano ?"
              required
              minLength={20}
              maxLength={2000}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gestionConflits">Gestion des conflits *</Label>
            <textarea
              id="gestionConflits"
              name="gestionConflits"
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Comment gérez-vous les conflits et respectez-vous les procédures ?"
              required
              minLength={20}
              maxLength={2000}
            />
          </div>

          {/* Dynamic questions */}
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <Label htmlFor={q.fieldName}>
                {q.label} {q.isRequired && "*"}
              </Label>
              {q.fieldType === "textarea" ? (
                <textarea
                  id={q.fieldName}
                  name={`dynamicAnswers.${q.fieldName}`}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required={q.isRequired}
                />
              ) : q.fieldType === "select" && q.options ? (
                <select
                  id={q.fieldName}
                  name={`dynamicAnswers.${q.fieldName}`}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required={q.isRequired}
                >
                  <option value="">Sélectionnez...</option>
                  {JSON.parse(q.options).map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={q.fieldName}
                  name={`dynamicAnswers.${q.fieldName}`}
                  type={q.fieldType === "number" ? "number" : "text"}
                  required={q.isRequired}
                />
              )}
            </div>
          ))}

          {/* Accept rules */}
          <div className="flex items-start space-x-3 pt-4 border-t">
            <Checkbox
              id="acceptRules"
              checked={acceptRules}
              onCheckedChange={(checked) => setAcceptRules(checked === true)}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="acceptRules"
                className="text-sm font-medium cursor-pointer"
              >
                J&apos;accepte le règlement Harmony Motors *
              </Label>
              <p className="text-xs text-muted-foreground">
                En cochant cette case, vous acceptez de respecter le règlement intérieur
                et les procédures de l&apos;entreprise.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Envoi en cours..." : "Envoyer ma candidature"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addFideliteOperation, getFideliteByDiscordId } from "@/lib/actions/fidelite";
import { FideliteCard } from "./fidelite-card";

export function AddOperationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [discordId, setDiscordId] = useState("");
  const [amount, setAmount] = useState("");
  const [clientFidelite, setClientFidelite] = useState<{
    userId: string;
    username: string;
    displayName: string | null;
    totalSpent: number;
    points: number;
    currentDiscountPercent: number;
    amountToNextPoint: number;
    pointsToNextBonus: number;
  } | null>(null);

  async function handleSearch() {
    if (!discordId.trim()) {
      toast.error("Veuillez entrer un ID Discord");
      return;
    }

    setIsSearching(true);
    const result = await getFideliteByDiscordId(discordId.trim());
    setIsSearching(false);

    if (result) {
      setClientFidelite(result);
    } else {
      toast.error("Client introuvable. Il doit d'abord se connecter au site.");
      setClientFidelite(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const amountNum = parseInt(amount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Montant invalide");
      return;
    }

    if (!discordId.trim()) {
      toast.error("ID Discord requis");
      return;
    }

    setIsSubmitting(true);
    const result = await addFideliteOperation(discordId.trim(), amountNum);

    if (result.success) {
      toast.success("Opération enregistrée !");
      setAmount("");
      // Refresh client fidelite
      const updated = await getFideliteByDiscordId(discordId.trim());
      setClientFidelite(updated);
      router.refresh();
    } else {
      toast.error(result.error || "Une erreur est survenue");
    }

    setIsSubmitting(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajouter une opération</CardTitle>
        <CardDescription>
          Enregistrez les dépenses d&apos;un client pour lui attribuer des points.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search client */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="discordId">ID Discord du client</Label>
              <Input
                id="discordId"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="Ex: 123456789012345678"
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? "..." : "Rechercher"}
              </Button>
            </div>
          </div>
        </div>

        {/* Client preview */}
        {clientFidelite && (
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">
                  {(clientFidelite.displayName || clientFidelite.username)
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium">
                  {clientFidelite.displayName || clientFidelite.username}
                </div>
                <div className="text-sm text-muted-foreground">
                  @{clientFidelite.username}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="p-2 rounded bg-background">
                <div className="text-muted-foreground">Points</div>
                <div className="font-bold">{clientFidelite.points}</div>
              </div>
              <div className="p-2 rounded bg-background">
                <div className="text-muted-foreground">Réduction</div>
                <div className="font-bold">{clientFidelite.currentDiscountPercent}%</div>
              </div>
              <div className="p-2 rounded bg-background">
                <div className="text-muted-foreground">Total</div>
                <div className="font-bold">
                  {new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(
                    clientFidelite.totalSpent
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add amount form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Montant dépensé</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex: 500000"
              min={1}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting || !discordId}>
            {isSubmitting ? "Enregistrement..." : "Enregistrer l'opération"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

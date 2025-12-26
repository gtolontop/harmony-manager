import { requireManagement } from "@/lib/rbac";
import { getCollaborations } from "@/lib/actions/collaboration";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CollaborationForm } from "./collaboration-form";
import { CollaborationActions } from "./collaboration-actions";

export const metadata = {
  title: "Gestion des collaborations",
};

export default async function CollaborationsPage() {
  await requireManagement();
  const collaborations = await getCollaborations();

  const activeCount = collaborations.filter((c) => c.isActive).length;
  const totalInvoices = collaborations.reduce((sum, c) => sum + c._count.invoices, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collaborations</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les partenariats et les réductions associées.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/manager">← Retour</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collaborations actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total collaborations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collaborations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Factures liées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add form */}
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle collaboration</CardTitle>
        </CardHeader>
        <CardContent>
          <CollaborationForm />
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des collaborations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Réduction</TableHead>
                  <TableHead>Factures</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborations.map((collab) => (
                  <TableRow key={collab.id}>
                    <TableCell className="font-medium">{collab.name}</TableCell>
                    <TableCell>
                      {collab.discountType === "percentage"
                        ? `${collab.discountValue}%`
                        : `${new Intl.NumberFormat("fr-FR").format(collab.discountValue)} €`}
                    </TableCell>
                    <TableCell>{collab._count.invoices}</TableCell>
                    <TableCell>
                      <Badge variant={collab.isActive ? "default" : "secondary"}>
                        {collab.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <CollaborationActions collaboration={collab} />
                    </TableCell>
                  </TableRow>
                ))}
                {collaborations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucune collaboration pour le moment
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

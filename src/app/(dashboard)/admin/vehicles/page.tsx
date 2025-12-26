import { requirePatron } from "@/lib/rbac";
import { getVehicles } from "@/lib/actions/admin";
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
import { VehicleForm } from "./vehicle-form";
import { VehicleActions } from "./vehicle-actions";

export const metadata = {
  title: "Gestion des véhicules",
};

export default async function AdminVehiclesPage() {
  await requirePatron();
  const vehicles = await getVehicles();

  // Group by category
  const categories = [...new Set(vehicles.map((v) => v.category).filter(Boolean))].sort() as string[];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Véhicules</h1>
          <p className="text-muted-foreground mt-2">
            Gérez le catalogue des véhicules.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">← Retour</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total véhicules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Catégories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add form */}
      <Card>
        <CardHeader>
          <CardTitle>Nouveau véhicule</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm existingCategories={categories} />
        </CardContent>
      </Card>

      {/* Vehicles table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des véhicules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>
                      {vehicle.code && <Badge variant="outline">{vehicle.code}</Badge>}
                    </TableCell>
                    <TableCell>{vehicle.category || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.isActive ? "default" : "secondary"}>
                        {vehicle.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <VehicleActions
                        vehicle={vehicle}
                        existingCategories={categories}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {vehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucun véhicule pour le moment
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

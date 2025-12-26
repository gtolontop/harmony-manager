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

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR").format(price) + " €";
}

export default async function AdminVehiclesPage() {
  await requirePatron();
  const vehicles = await getVehicles();

  // Group by brand
  const brands = [...new Set(vehicles.map((v) => v.brand))].sort();
  const categories = [...new Set(vehicles.map((v) => v.category))].sort();

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
      <div className="grid gap-4 md:grid-cols-3">
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
              Marques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.length}</div>
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
          <VehicleForm existingBrands={brands} existingCategories={categories} />
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
                  <TableHead>Marque</TableHead>
                  <TableHead>Modèle</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Prix de base</TableHead>
                  <TableHead className="text-right">Customs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      <Badge variant="outline">{vehicle.brand}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>{vehicle.category}</TableCell>
                    <TableCell className="text-right">
                      {formatPrice(vehicle.basePrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {vehicle._count.customisations}
                    </TableCell>
                    <TableCell className="text-right">
                      <VehicleActions
                        vehicle={vehicle}
                        existingBrands={brands}
                        existingCategories={categories}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {vehicles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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

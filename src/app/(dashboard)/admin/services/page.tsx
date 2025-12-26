import { requirePatron } from "@/lib/rbac";
import { getServices, getServiceCategories } from "@/lib/actions/admin";
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
import { ServiceForm } from "./service-form";
import { ServiceActions } from "./service-actions";
import { CategorySection } from "./category-section";

export const metadata = {
  title: "Gestion des services",
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR").format(price) + " €";
}

export default async function AdminServicesPage() {
  await requirePatron();

  const [services, categories] = await Promise.all([
    getServices(),
    getServiceCategories(),
  ]);

  // Group services by category
  const uncategorized = services.filter((s) => !s.categoryId);
  const categorizedServices = categories.map((cat) => ({
    ...cat,
    services: services.filter((s) => s.categoryId === cat.id),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les prestations et leurs tarifs.
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
              Total services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Non catégorisés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uncategorized.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories management */}
      <CategorySection categories={categories} />

      {/* Add service form */}
      <Card>
        <CardHeader>
          <CardTitle>Nouveau service</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm categories={categories} />
        </CardContent>
      </Card>

      {/* Services by category */}
      {categorizedServices.map((cat) => (
        <Card key={cat.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {cat.name}
              <Badge variant="secondary">{cat.services.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">Prix</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cat.services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(service.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ServiceActions service={service} categories={categories} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {cat.services.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                        Aucun service dans cette catégorie
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Uncategorized services */}
      {uncategorized.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Non catégorisés
              <Badge variant="outline">{uncategorized.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead className="text-right">Prix</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uncategorized.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-right">
                        {formatPrice(service.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ServiceActions service={service} categories={categories} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

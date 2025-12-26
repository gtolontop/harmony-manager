import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/rbac";
import { getServices, getVehicles, getCollaborations } from "@/lib/actions/invoice";
import { InvoiceForm } from "./invoice-form";

export const metadata = {
  title: "Nouvelle Facture",
};

export default async function FacturePage() {
  await requireStaff();

  const [services, vehicles, collaborations] = await Promise.all([
    getServices(),
    getVehicles(),
    getCollaborations(),
  ]);

  // Group services by category
  const servicesByCategory = services.reduce(
    (acc, service) => {
      const category = service.category || "Autres";
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    },
    {} as Record<string, typeof services>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Nouvelle Facture</h1>
        <p className="text-muted-foreground mt-2">
          Créez une facture pour un client en sélectionnant les services effectués.
        </p>
      </div>

      <InvoiceForm
        servicesByCategory={servicesByCategory}
        vehicles={vehicles}
        collaborations={collaborations}
      />
    </div>
  );
}

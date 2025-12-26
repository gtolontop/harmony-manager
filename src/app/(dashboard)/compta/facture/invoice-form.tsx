"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvoice } from "@/lib/actions/invoice";

interface Service {
  id: string;
  name: string;
  price: number;
  hasQuantity: boolean;
  category: string | null;
}

interface Vehicle {
  id: string;
  name: string;
  category: string | null;
  imagePath: string | null;
}

interface Collaboration {
  id: string;
  name: string;
  advantageType: string | null;
  discountPercent: number;
}

interface InvoiceFormProps {
  servicesByCategory: Record<string, Service[]>;
  vehicles: Vehicle[];
  collaborations: Collaboration[];
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR").format(price) + " €";
}

export function InvoiceForm({
  servicesByCategory,
  vehicles,
  collaborations,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client info
  const [clientFirstname, setClientFirstname] = useState("");
  const [clientName, setClientName] = useState("");

  // Vehicle info
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [vehicleName, setVehicleName] = useState("");
  const [isOutOfList, setIsOutOfList] = useState(false);
  const [vehicleSearch, setVehicleSearch] = useState("");

  // Services
  const [selectedServices, setSelectedServices] = useState<
    Map<string, { service: Service; quantity: number }>
  >(new Map());

  // Collaboration
  const [selectedCollaboration, setSelectedCollaboration] = useState<string>("");

  // Dialogs
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);

  // Calculate totals
  const baseAmount = Array.from(selectedServices.values()).reduce(
    (sum, { service, quantity }) => sum + service.price * quantity,
    0
  );

  const collaboration = collaborations.find((c) => c.id === selectedCollaboration);
  const discountPercent = collaboration?.discountPercent || 0;
  const discountAmount = Math.round(baseAmount * (discountPercent / 100));
  const finalAmount = baseAmount - discountAmount;

  function toggleService(service: Service) {
    const newMap = new Map(selectedServices);
    if (newMap.has(service.id)) {
      newMap.delete(service.id);
    } else {
      newMap.set(service.id, { service, quantity: 1 });
    }
    setSelectedServices(newMap);
  }

  function updateQuantity(serviceId: string, quantity: number) {
    const newMap = new Map(selectedServices);
    const item = newMap.get(serviceId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      setSelectedServices(newMap);
    }
  }

  function handleVehicleSelect(vehicle: Vehicle) {
    setSelectedVehicle(vehicle.id);
    setVehicleName(vehicle.name);
    setIsOutOfList(false);
    setVehicleDialogOpen(false);
  }

  function resetForm() {
    setClientFirstname("");
    setClientName("");
    setSelectedVehicle("");
    setVehicleName("");
    setIsOutOfList(false);
    setSelectedServices(new Map());
    setSelectedCollaboration("");
  }

  async function handleSubmit() {
    if (!clientFirstname || !clientName) {
      toast.error("Veuillez renseigner les informations client");
      return;
    }
    if (!vehicleName) {
      toast.error("Veuillez sélectionner un véhicule");
      return;
    }
    if (selectedServices.size === 0) {
      toast.error("Veuillez sélectionner au moins un service");
      return;
    }

    setIsSubmitting(true);

    const result = await createInvoice({
      client: {
        firstname: clientFirstname,
        name: clientName,
      },
      vehicle: {
        vehicleId: selectedVehicle || undefined,
        vehicleName,
        isOutOfList,
      },
      services: Array.from(selectedServices.values()).map(({ service, quantity }) => ({
        serviceId: service.id,
        quantity,
      })),
      collaborationId: selectedCollaboration || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Facture créée avec succès !");
      resetForm();
      router.push("/compta/historique");
    } else {
      toast.error(result.error || "Erreur lors de la création");
    }
  }

  const filteredVehicles = vehicles.filter((v) =>
    v.name.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Step 1 & 2: Client and Vehicle info */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Client Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Infos Client</CardTitle>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                Étape 1
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {clientFirstname && clientName
                    ? `${clientFirstname} ${clientName}`
                    : "Renseigner le client..."}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Informations client</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstname">Prénom</Label>
                    <Input
                      id="firstname"
                      value={clientFirstname}
                      onChange={(e) => setClientFirstname(e.target.value)}
                      placeholder="Prénom du client"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input
                      id="name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Nom du client"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => setClientDialogOpen(false)}
                    disabled={!clientFirstname || !clientName}
                  >
                    Valider
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Infos Véhicule</CardTitle>
              <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                Étape 2
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {vehicleName ? vehicleName : "Sélectionner un véhicule..."}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Sélectionner un véhicule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4 overflow-hidden flex flex-col">
                  <Input
                    placeholder="Rechercher un véhicule..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[40vh] pr-2">
                    {filteredVehicles.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => handleVehicleSelect(vehicle)}
                        className={`p-3 rounded-lg border text-left hover:bg-accent transition-colors ${
                          selectedVehicle === vehicle.id
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        <div className="font-medium text-sm truncate">{vehicle.name}</div>
                        {vehicle.category && (
                          <div className="text-xs text-muted-foreground">{vehicle.category}</div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 pt-2 border-t">
                    <Checkbox
                      id="outOfList"
                      checked={isOutOfList}
                      onCheckedChange={(checked) => {
                        setIsOutOfList(checked === true);
                        if (checked) {
                          setSelectedVehicle("");
                        }
                      }}
                    />
                    <Label htmlFor="outOfList" className="text-sm">
                      Véhicule non présent dans la liste
                    </Label>
                  </div>
                  {isOutOfList && (
                    <Input
                      placeholder="Nom du véhicule..."
                      value={vehicleName}
                      onChange={(e) => setVehicleName(e.target.value)}
                    />
                  )}
                  {isOutOfList && vehicleName && (
                    <Button onClick={() => setVehicleDialogOpen(false)}>Valider</Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Step 3: Services */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Services de customisation</CardTitle>
            <span className="text-sm text-muted-foreground">
              {selectedServices.size} sélectionné{selectedServices.size > 1 ? "s" : ""}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(servicesByCategory).map(([category, services]) => (
              <div key={category}>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">{category}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {services.map((service) => {
                    const isSelected = selectedServices.has(service.id);
                    const item = selectedServices.get(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-sm font-medium leading-tight">
                            {service.name}
                          </span>
                          {isSelected && (
                            <span className="text-primary text-xs">✓</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatPrice(service.price)}
                        </div>
                        {isSelected && service.hasQuantity && (
                          <div
                            className="mt-2 flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="w-6 h-6 rounded bg-muted flex items-center justify-center"
                              onClick={() =>
                                updateQuantity(service.id, (item?.quantity || 1) - 1)
                              }
                            >
                              -
                            </button>
                            <span className="text-sm">{item?.quantity || 1}</span>
                            <button
                              className="w-6 h-6 rounded bg-muted flex items-center justify-center"
                              onClick={() =>
                                updateQuantity(service.id, (item?.quantity || 1) + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground">Services</div>
              <div className="text-xl font-bold">{selectedServices.size}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground">Total HT</div>
              <div className="text-xl font-bold">{formatPrice(baseAmount)}</div>
            </div>
            {discountAmount > 0 && (
              <div className="p-3 rounded-lg bg-chart-2/10">
                <div className="text-sm text-muted-foreground">Réduction</div>
                <div className="text-xl font-bold text-chart-2">-{formatPrice(discountAmount)}</div>
              </div>
            )}
            <div className="p-3 rounded-lg bg-primary/10">
              <div className="text-sm text-muted-foreground">Total TTC</div>
              <div className="text-xl font-bold text-primary">{formatPrice(finalAmount)}</div>
            </div>
          </div>

          {/* Collaboration select */}
          <div className="space-y-2">
            <Label>Collaboration (optionnel)</Label>
            <Select value={selectedCollaboration} onValueChange={setSelectedCollaboration}>
              <SelectTrigger>
                <SelectValue placeholder="Aucune collaboration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucune</SelectItem>
                {collaborations.map((collab) => (
                  <SelectItem key={collab.id} value={collab.id}>
                    {collab.name} (-{collab.discountPercent}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={resetForm} className="flex-1">
              Réinitialiser
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Création..." : "Créer la facture"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

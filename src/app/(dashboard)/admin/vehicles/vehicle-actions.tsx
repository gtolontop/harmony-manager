"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { updateVehicle, deleteVehicle } from "@/lib/actions/admin";
import { toast } from "sonner";

interface VehicleActionsProps {
  vehicle: {
    id: string;
    name: string;
    brand: string;
    category: string;
    basePrice: number;
  };
  existingBrands: string[];
  existingCategories: string[];
}

export function VehicleActions({
  vehicle,
  existingBrands,
  existingCategories,
}: VehicleActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState(vehicle.name);
  const [editBrand, setEditBrand] = useState(vehicle.brand);
  const [editCategory, setEditCategory] = useState(vehicle.category);
  const [editPrice, setEditPrice] = useState(vehicle.basePrice.toString());

  const handleEdit = () => {
    const price = parseFloat(editPrice);
    if (!editName.trim() || !editBrand.trim() || !editCategory.trim() || isNaN(price)) {
      toast.error("Données invalides");
      return;
    }

    startTransition(async () => {
      const result = await updateVehicle(vehicle.id, {
        name: editName.trim(),
        brand: editBrand.trim(),
        category: editCategory.trim(),
        basePrice: price,
      });

      if (result.success) {
        toast.success("Véhicule mis à jour");
        setShowEditDialog(false);
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Supprimer ce véhicule ?")) return;

    startTransition(async () => {
      const result = await deleteVehicle(vehicle.id);

      if (result.success) {
        toast.success("Véhicule supprimé");
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending}>
            •••
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le véhicule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-brand">Marque</Label>
              <Input
                id="edit-brand"
                value={editBrand}
                onChange={(e) => setEditBrand(e.target.value)}
                disabled={isPending}
                list="edit-brands"
              />
              <datalist id="edit-brands">
                {existingBrands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Modèle</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Catégorie</Label>
              <Input
                id="edit-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                disabled={isPending}
                list="edit-categories"
              />
              <datalist id="edit-categories">
                {existingCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Prix de base (€)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="10000"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={isPending}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={isPending}>
              {isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

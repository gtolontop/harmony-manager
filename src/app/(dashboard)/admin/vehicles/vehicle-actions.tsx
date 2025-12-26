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
    code: string | null;
    category: string | null;
  };
  existingCategories: string[];
}

export function VehicleActions({
  vehicle,
  existingCategories,
}: VehicleActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState(vehicle.name);
  const [editCode, setEditCode] = useState(vehicle.code || "");
  const [editCategory, setEditCategory] = useState(vehicle.category || "");

  const handleEdit = () => {
    if (!editName.trim()) {
      toast.error("Données invalides");
      return;
    }

    startTransition(async () => {
      const result = await updateVehicle(vehicle.id, {
        name: editName.trim(),
        code: editCode.trim() || undefined,
        category: editCategory.trim() || undefined,
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
              <Label htmlFor="edit-name">Nom</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Code</Label>
              <Input
                id="edit-code"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
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

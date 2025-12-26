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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { updateService, deleteService } from "@/lib/actions/admin";
import { toast } from "sonner";

interface ServiceActionsProps {
  service: {
    id: string;
    name: string;
    price: number;
    category: string | null;
  };
  categories: string[];
}

export function ServiceActions({ service, categories }: ServiceActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState(service.name);
  const [editPrice, setEditPrice] = useState(service.price.toString());
  const [editCategory, setEditCategory] = useState(service.category || "none");

  const handleEdit = () => {
    const priceNum = parseFloat(editPrice);
    if (!editName.trim() || isNaN(priceNum)) {
      toast.error("Données invalides");
      return;
    }

    startTransition(async () => {
      const result = await updateService(service.id, {
        name: editName.trim(),
        price: priceNum,
        category: editCategory === "none" ? undefined : editCategory,
      });

      if (result.success) {
        toast.success("Service mis à jour");
        setShowEditDialog(false);
      } else {
        toast.error(result.error || "Erreur");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Supprimer ce service ?")) return;

    startTransition(async () => {
      const result = await deleteService(service.id);

      if (result.success) {
        toast.success("Service supprimé");
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
            <DialogTitle>Modifier le service</DialogTitle>
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
              <Label htmlFor="edit-price">Prix (€)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="1000"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select value={editCategory} onValueChange={setEditCategory} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

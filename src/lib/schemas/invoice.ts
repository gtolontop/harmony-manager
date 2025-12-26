import { z } from "zod";

export const clientInfoSchema = z.object({
  firstname: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Prénom trop long"),
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Nom trop long"),
  cniPath: z.string().optional(),
});

export const vehicleInfoSchema = z.object({
  vehicleId: z.string().optional(),
  vehicleName: z.string().min(1, "Veuillez sélectionner ou saisir un véhicule"),
  platePath: z.string().optional(),
  isOutOfList: z.boolean().default(false),
});

export const invoiceServiceSchema = z.object({
  serviceId: z.string(),
  quantity: z.number().min(1).default(1),
});

export const invoiceSchema = z.object({
  client: clientInfoSchema,
  vehicle: vehicleInfoSchema,
  services: z.array(invoiceServiceSchema).min(1, "Sélectionnez au moins un service"),
  collaborationId: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

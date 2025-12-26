import { z } from "zod";

export const candidatureSchema = z.object({
  pseudoRp: z
    .string()
    .min(2, "Le pseudo RP doit contenir au moins 2 caractères")
    .max(50, "Le pseudo RP ne peut pas dépasser 50 caractères"),
  age: z
    .number()
    .min(16, "Vous devez avoir au moins 16 ans")
    .max(99, "Âge invalide"),
  disponibilites: z
    .string()
    .min(10, "Veuillez détailler vos disponibilités")
    .max(1000, "Texte trop long"),
  experienceRp: z
    .string()
    .min(20, "Veuillez détailler votre expérience RP")
    .max(2000, "Texte trop long"),
  experienceMecano: z
    .string()
    .min(20, "Veuillez détailler votre expérience mécano")
    .max(2000, "Texte trop long"),
  motivations: z
    .string()
    .min(20, "Veuillez détailler vos motivations")
    .max(2000, "Texte trop long"),
  visionRp: z
    .string()
    .min(20, "Veuillez détailler votre vision du RP mécano")
    .max(2000, "Texte trop long"),
  gestionConflits: z
    .string()
    .min(20, "Veuillez détailler votre gestion des conflits")
    .max(2000, "Texte trop long"),
  acceptRules: z
    .boolean()
    .refine((val) => val === true, "Vous devez accepter le règlement"),
  dynamicAnswers: z.record(z.string(), z.unknown()).optional(),
});

export type CandidatureFormData = z.infer<typeof candidatureSchema>;

export const candidatureNoteSchema = z.object({
  content: z
    .string()
    .min(1, "La note ne peut pas être vide")
    .max(2000, "Note trop longue"),
});

export const candidatureStatusSchema = z.object({
  status: z.enum(["en_attente", "a_tester", "accepte", "refuse"]),
});

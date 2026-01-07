import { z } from "zod";

/* ---------------- PERSONAL INFO ---------------- */
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  nationality: z.string().min(2, "Nationality is required"),
});

/* ---------------- PROOF OF ADDRESS ---------------- */
export const proofOfAddressSchema = z.object({
  city: z.string().min(2, "City is required"),
  district: z.string().min(2, "District is required"),
  fullAddress: z.string().min(5, "Full address is required"),
});

/* ---------------- UPLOADED DOCUMENTS ---------------- */
export const uploadDocumentSchema = z.object({
  driversId: z.any().refine((f) => f, "Driver’s license must be uploaded"),
  passport: z.any().refine((f) => f, "Passport must be uploaded"),
  nationalId: z.any().refine((f) => f, "National ID must be uploaded"),
});

import { z } from "zod";

export const claimSupplierSchema = z.object({
  supplierId: z.string().min(1, "Supplier ID is required"),
});

export const updateSupplierProfileSchema = z.object({
  tradingName: z.string().max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional(),
  billingAddress: z.string().max(500).optional(),
});

// src/schemas/splitSchemas.js
import { z } from 'zod';

export const SplitFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  category: z.string().min(1, 'Please select a category'),
  split_method: z.enum(['SpecificAmounts', 'CustomAmounts', 'Percentage']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  location: z.string().min(3, 'Location is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  max_participants: z.number().min(1, 'At least 1 participant required'),
  visibility_radius: z.number().min(0).max(10),
  rules: z.string().optional(),
  description: z.string().optional(),
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"],
});

export const JoinSplitSchema = z.object({
  user_id: z.number().positive('Valid user ID is required'),
  payment_method: z.enum(['wallet', 'card', 'transfer']).default('wallet'),
});
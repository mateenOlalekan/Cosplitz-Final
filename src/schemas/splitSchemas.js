import { z } from 'zod';

export const SplitFormSchema = z.object({
  title: z.string().min(1, 'Split title is required').max(100, 'Title is too long'),
  category: z.string().min(1, 'Category is required'),
  split_method: z.enum(['SpecificAmounts', 'CustomAmounts', 'Percentage']).default('SpecificAmounts'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  location: z.string().min(1, 'Location is required').max(200, 'Location is too long'),
  amount: z.number().min(1, 'Amount must be at least $1').max(10000, 'Amount cannot exceed $10,000'),
  max_participants: z.number().min(1, 'At least 1 participant is required').max(100, 'Maximum 100 participants allowed'),
  visibility_radius: z.number().min(0, 'Visibility radius cannot be negative').max(10, 'Maximum visibility radius is 10km'),
  rules: z.string().max(500, 'Rules are too long').optional().nullable(),
  description: z.string().max(1000, 'Description is too long').optional().nullable(),
  image: z.any().optional().nullable(),
});

export const JoinSplitSchema = z.object({
  user_id: z.number().positive('Valid user ID is required'),
  payment_method: z.enum(['wallet', 'card', 'transfer']).default('wallet'),
});
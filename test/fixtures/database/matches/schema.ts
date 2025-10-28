import z from "zod";
import { firestoreRef } from "../../../../src/references";

export const schema = z.object({
  available_seats: z.number().int().nonnegative(),
  booked_seats: z.number().int().nonnegative(),
  booked_users: z.array(z.any()).default([]),

  centerRef: firestoreRef("centers"),
  center_images: z.array(z.string()).default([]),
  center_name: z.string(),
  city: z.string(),

  created_time: z.date(),
  day: z.date(),
  end_timestamp: z.date(),

  eventImage: z.string().optional(),
  eventStructure: z.string().optional(),

  field_type: z.string(),
  from: z.string(),

  id: z.string(),
  impressions: z.number().int().nonnegative().optional(),
  isEvent: z.boolean(),

  match_leaders: z.array(z.any()).optional().default([]),
  match_type: z.string(),

  numMen: z.number().int().nonnegative().optional(),
  numNeutral: z.number().int().nonnegative().optional(),
  numWoman: z.number().int().nonnegative().optional(),

  number_fields: z.number().int().positive(),
  price: z.number(),
  queue: z.array(z.any()).optional(),

  start_timestamp: z.date(),
  status: z.string(),
  to: z.string(),
  updatedAt: z.date().optional(),

  cancelMotivation: z.string().optional(),
  available_list: z.array(z.string()).optional(),
  feedback_image: z.string().optional(),
  feedback_sent: z.array(z.any()).optional(),
})
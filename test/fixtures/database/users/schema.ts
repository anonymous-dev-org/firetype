import { z } from "zod";

export const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
  createdAt: z.date(),
  metadata: z.object({
    lastLogin: z.date().optional(),
    isVerified: z.boolean(),
  }),
});

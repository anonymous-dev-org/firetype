import { z } from "zod"

export const schema = z.object({
  name: z.string(),
  address: z.string(),
  city: z.string(),
  images: z.array(z.string()).default([]),
  createdAt: z.date(),
})

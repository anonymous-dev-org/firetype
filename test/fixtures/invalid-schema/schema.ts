import { z } from "zod"

// Missing export const
const invalidSchema = z.object({
  name: z.string(),
})

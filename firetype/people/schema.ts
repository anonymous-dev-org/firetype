import { z } from "zod"

export const peopleSchema = z.object({
  name: z.string(),
  lastName: z.string(),
})

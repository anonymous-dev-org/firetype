import { z } from "zod"

export const settingsSchema = z.object({
  config: z.string(),
})

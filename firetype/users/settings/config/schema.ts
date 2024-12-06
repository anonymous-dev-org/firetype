import { z } from "zod"

export const schema = z.object({
  config: z.string(),
})

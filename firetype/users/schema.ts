import { z } from "zod"

export const usersSchema = z.object({
  userId: z.string(),
})

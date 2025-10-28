import { z } from "zod"

export const schema = z.object({
  postId: z.string(),
  content: z.string(),
  authorId: z.string(),
  createdAt: z.date(),
  likes: z.number().default(0),
})

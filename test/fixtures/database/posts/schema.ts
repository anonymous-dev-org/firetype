import { z } from "zod"

export const schema = z.object({
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  publishedAt: z.date(),
  tags: z.array(z.string()),
  isPublished: z.boolean().default(false),
})

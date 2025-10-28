import { z } from "zod"
import { collectionPath, firestoreRef } from "../../../../src/references"

export const schema = z.object({
  title: z.string(),
  content: z.string(),
  authorId: z.string(),
  authorRef: firestoreRef("users"),
  collaboratorRefs: firestoreRef("users").array(),
  userCommentRef: firestoreRef("users/comments"), // Reference to comments in users subcollection
  dynamicPathRef: firestoreRef("users/:userId/posts"), // Path with dynamic segment (for documentation)
  brandedPathRef: firestoreRef(collectionPath("centers")), // Using branded path
  publishedAt: z.date(),
  tags: z.array(z.string()),
  isPublished: z.boolean().default(false),
})
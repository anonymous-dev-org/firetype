
/**
 * Creates a Zod schema for a Firestore document reference.
 * This should be used in your schema definitions to type Firestore references.
 *
 * @param collectionPath - The path to the referenced collection. Use paths that correspond to your schema structure (e.g., "users", "users/posts")
 * @returns A Zod schema that validates Firestore document references
 *
 * @example
 * ```typescript
 * import { z } from "zod";
 * import { firestoreRef } from "@anonymous-dev/firetype";
 *
 * export const schema = z.object({
 *   authorRef: firestoreRef("users"),
 *   postRefs: firestoreRef("posts").array(),
 *   userPostRef: firestoreRef("users/posts"), // Reference to posts in users subcollection
 * });
 * ```
 *
 * @note The generated types will include a union type of all valid collection paths for better type safety.
 */
export function firestoreRef(collectionPath: string) {
  // This is a placeholder that will be replaced by the generator
  // The generator will replace firestoreRef("path") with the appropriate DocumentReference type
  return `FIRESTORE_REF_PLACEHOLDER_${collectionPath}`;
}

/**
 * Helper function to create a collection path string.
 * This provides better documentation and type hints for collection paths.
 *
 * @param path - The collection path
 * @returns The collection path string
 *
 * @example
 * ```typescript
 * const userPath = collectionPath("users");
 * const postPath = collectionPath("users/posts");
 * ```
 */
export function collectionPath(path: string): string {
  return path;
}

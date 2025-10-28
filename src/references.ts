
import { z } from "zod";

// Default, augmentable typing hook. The generated file will augment this
// interface to narrow `CollectionPath` to the literal union of valid paths.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface FiretypeGenerated {
    CollectionPath: string
  }
}

/**
 * Creates a Zod schema for a Firestore document reference.
 * This should be used in your schema definitions to type Firestore references.
 *
 * @param collectionPath - OPTIONAL path to the referenced collection. Use paths that correspond to your schema structure (e.g., "users", "users/posts"). When omitted, a generic reference schema will be returned.
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
 *   anyRef: firestoreRef(),
 *   anyRefs: z.array(firestoreRef()),
 *   userPostRef: firestoreRef("users/posts"), // Reference to posts in users subcollection
 * });
 * ```
 *
 * @note The generated types will include a union type of all valid collection paths for better type safety.
 */
export function firestoreRef(
  collectionPath: FiretypeGenerated["CollectionPath"]
): z.ZodTypeAny
export function firestoreRef(): z.ZodTypeAny
export function firestoreRef(collectionPath?: unknown) {
  // At authoring time we return a permissive Zod schema so this can be composed
  // freely (e.g. z.array(firestoreRef())). During code generation, calls with a
  // concrete collection path are replaced with strongly-typed schemas.
  return z.any()
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
export function collectionPath<T extends FiretypeGenerated["CollectionPath"]>(
  path: T
): T {
  return path;
}

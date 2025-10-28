import { describe, expect, it } from 'vitest'
import { collectionPath, firestoreRef } from '../src/references'

describe('References', () => {
  describe('firestoreRef', () => {
    it('should return a placeholder string with the collection path', () => {
      const result = firestoreRef('users')
      expect(result).toBe('FIRESTORE_REF_PLACEHOLDER_users')
    })

    it('should handle nested collection paths', () => {
      const result = firestoreRef('users/posts')
      expect(result).toBe('FIRESTORE_REF_PLACEHOLDER_users/posts')
    })

    it('should handle simple collection names', () => {
      const result = firestoreRef('posts')
      expect(result).toBe('FIRESTORE_REF_PLACEHOLDER_posts')
    })

    it('should handle paths with dynamic segments', () => {
      const result = firestoreRef('users/:userId/posts')
      expect(result).toBe('FIRESTORE_REF_PLACEHOLDER_users/:userId/posts')
    })

    it('should handle collectionPath branded strings', () => {
      const path = collectionPath('users/posts')
      const result = firestoreRef(path)
      expect(result).toBe('FIRESTORE_REF_PLACEHOLDER_users/posts')
    })
  })

  describe('collectionPath', () => {
    it('should return a collection path string', () => {
      const result = collectionPath('users')
      expect(result).toBe('users')
      expect(typeof result).toBe('string')
    })

    it('should handle nested paths', () => {
      const result = collectionPath('users/posts/comments')
      expect(result).toBe('users/posts/comments')
    })

    it('should handle paths with dynamic segments', () => {
      const result = collectionPath('users/:userId/posts')
      expect(result).toBe('users/:userId/posts')
    })
  })
})

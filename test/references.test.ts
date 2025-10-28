import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { collectionPath, firestoreRef } from '../src/references'

describe('References', () => {
  describe('firestoreRef', () => {
    it('should return a Zod string schema when given a collection path', () => {
      const schema = firestoreRef('users')
      expect(typeof (schema as any).parse).toBe('function')
      expect(() => z.array(schema).parse(['id1', 'id2'])).not.toThrow()
      expect(() => z.array(schema).parse([1, 'a', null])).toThrow()
    })

    it('should return a Zod string schema for nested collection paths', () => {
      const schema = firestoreRef('users/posts')
      expect(typeof (schema as any).parse).toBe('function')
      expect(() => schema.parse('docId')).not.toThrow()
      expect(() => schema.parse({})).toThrow()
    })

    it('should return a Zod string schema for simple collection names', () => {
      const schema = firestoreRef('posts')
      expect(() => z.array(schema).parse(['a', 'b'])).not.toThrow()
      expect(() => z.array(schema).parse([{}, 123])).toThrow()
    })

    it('should return a Zod schema for paths with dynamic segments', () => {
      const schema = firestoreRef('users/:userId/posts')
      expect(() => schema.parse('anything')).not.toThrow()
    })

    it('should handle collectionPath branded strings', () => {
      const path = collectionPath('users/posts')
      const schema = firestoreRef(path)
      expect(() => schema.parse('docId')).not.toThrow()
      expect(() => schema.parse(undefined)).toThrow()
    })

    it('should support no-arg usage for generic references', () => {
      const schema = firestoreRef()
      expect(() => z.array(schema).parse(['a', 'x'])).not.toThrow()
      expect(() => z.array(schema).parse([null, 1, 'x'])).toThrow()
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

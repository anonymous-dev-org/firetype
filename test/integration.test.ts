import * as fs from 'fs'
import * as path from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { generateFiretypeFile } from '../src/generator'

describe('Integration Tests', () => {
  const fixturesPath = path.join(__dirname, 'fixtures')
  const validDatabasePath = path.join(fixturesPath, 'database')
  const outputDir = path.join(__dirname, 'output')

  beforeAll(() => {
    // Create output directory for integration tests
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
  })

  afterAll(() => {
    // Clean up output directory
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir)
      files.forEach(file => {
        fs.unlinkSync(path.join(outputDir, file))
      })
      fs.rmdirSync(outputDir)
    }
  })

  describe('End-to-End Generation', () => {
    it('should generate valid TypeScript for admin SDK', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      // Write to file for inspection
      const outputFile = path.join(outputDir, 'admin-types.ts')
      fs.writeFileSync(outputFile, result)

      // Verify file was created
      expect(fs.existsSync(outputFile)).toBe(true)

      // Basic validation of generated content
      expect(result).toContain('import { z } from "zod"')
      expect(result).toContain('firebase-admin/firestore')
      expect(result).toContain('export function createFireTypeAdmin')
      expect(result).toContain('AdminFirestore')

      // Check for schema definitions
      expect(result).toContain('name: z.string()')
      expect(result).toContain('email: z.string().email()')
      expect(result).toContain('age: z.number().optional()')

      // Check for nested collections
      expect(result).toContain('comments')
      expect(result).toContain('postId: z.string()')
    })

    it('should generate valid TypeScript for client SDK', () => {
      const result = generateFiretypeFile(validDatabasePath, ['client'])

      const outputFile = path.join(outputDir, 'client-types.ts')
      fs.writeFileSync(outputFile, result)

      expect(fs.existsSync(outputFile)).toBe(true)

      expect(result).toContain('import { z } from "zod"')
      expect(result).toContain('firebase/firestore')
      expect(result).toContain('export function createFireTypeClient')
      expect(result).toContain('ClientFirestore')

      // Check for client-specific imports
      expect(result).toContain('clientCollection')
      expect(result).toContain('clientDocument')
      expect(result).toContain('clientCollectionGroup')
    })

    it('should generate valid TypeScript for both SDKs', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin', 'client'])

      const outputFile = path.join(outputDir, 'both-types.ts')
      fs.writeFileSync(outputFile, result)

      expect(fs.existsSync(outputFile)).toBe(true)

      expect(result).toContain('firebase-admin/firestore')
      expect(result).toContain('firebase/firestore')
      expect(result).toContain('export function createFireTypeAdmin')
      expect(result).toContain('export function createFireTypeClient')
    })

    it('should generate compilable TypeScript', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      // Basic syntax validation - ensure no obvious syntax errors
      expect(() => {
        // Try to parse as TypeScript (basic check)
        const lines = result.split('\n')
        let braceCount = 0
        let parenCount = 0

        for (const line of lines) {
          braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length
          parenCount += (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length
        }

        // Basic check that braces and parentheses are balanced
        expect(braceCount).toBe(0)
        expect(parenCount).toBe(0)
      }).not.toThrow()
    })

    it('should include proper type annotations', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      // Check for proper TypeScript typing
      expect(result).toContain('AdminDocumentReference<')
      expect(result).toContain('AdminCollectionReference<')
      expect(result).toContain('AdminCollectionGroup<')

      // Check for proper Zod inference types
      expect(result).toContain('z.infer<typeof')
    })

    it('should handle complex nested schemas', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      // Check for users with nested metadata
      expect(result).toContain('metadata:')
      expect(result).toContain('lastLogin: z.date().optional()')
      expect(result).toContain('isVerified: z.boolean()')

      // Check for posts with arrays
      expect(result).toContain('tags: z.array(z.string())')
      expect(result).toContain('isPublished: z.boolean().default(false)')

      // Check for nested comments collection
      expect(result).toContain('likes: z.number().default(0)')
    })
  })

  describe('Generated Code Functionality', () => {
    it('should export the expected functions', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin', 'client'])

      expect(result).toContain('export function createFireTypeAdmin')
      expect(result).toContain('export function createFireTypeClient')
    })

    it('should include proper collection references', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      expect(result).toContain('getDocumentRef')
      expect(result).toContain('getCollectionRef')
      expect(result).toContain('getCollectionGroupRef')
    })

    it('should include converters for validation', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      expect(result).toContain('_adminConverter')
      expect(result).toContain('validate: boolean = false')
      expect(result).toContain('toFirestore')
      expect(result).toContain('fromFirestore')
    })

    it('should handle path parameters for nested collections', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      // Comments are nested under users, so should have usersId parameter
      expect(result).toContain('usersId: string')
      expect(result).toContain('${args.usersId}')
    })
  })

  describe('File Structure Validation', () => {
    it('should create proper schema tree structure', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      // Should have main collections
      expect(result).toContain('"users":')
      expect(result).toContain('"posts":')

      // Should have nested collections
      expect(result).toContain('"comments":')

      // Should have schema definitions
      expect(result).toContain('_schema:')
    })

    it('should create proper converter tree structure', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      expect(result).toContain('const databaseConverters = {')
      expect(result).toContain('"users":')
      expect(result).toContain('"posts":')
      expect(result).toContain('_adminConverter')
    })
  })
})

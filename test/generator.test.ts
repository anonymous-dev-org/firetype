import * as path from 'path'
import { describe, expect, it } from 'vitest'
import { generateFiretypeFile } from '../src/generator'

describe('Generator', () => {
  const fixturesPath = path.join(__dirname, 'fixtures')
  const validDatabasePath = path.join(fixturesPath, 'database')

  describe('generateFiretypeFile', () => {
    it('should generate admin-only types', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      expect(result).toContain('import { z } from "zod"')
      expect(result).toContain('firebase-admin/firestore')
      expect(result).not.toContain('firebase/firestore')

      expect(result).toContain('const databaseSchema = {')
      expect(result).toContain('const databaseConverters = {')

      expect(result).toContain('export function createFireTypeAdmin')
      expect(result).not.toContain('export function createFireTypeClient')

      // Check for schema content
      expect(result).toContain('name: z.string()')
      expect(result).toContain('email: z.string().email()')

      // Check for converter structure
      expect(result).toContain('_adminConverter')
      expect(result).not.toContain('_clientConverter')
    })

    it('should generate client-only types', () => {
      const result = generateFiretypeFile(validDatabasePath, ['client'])

      expect(result).toContain('import { z } from "zod"')
      expect(result).toContain('firebase/firestore')
      expect(result).not.toContain('firebase-admin/firestore')

      expect(result).toContain('const databaseSchema = {')
      expect(result).toContain('const databaseConverters = {')

      expect(result).toContain('export function createFireTypeClient')
      expect(result).not.toContain('export function createFireTypeAdmin')

      // Check for converter structure
      expect(result).toContain('_clientConverter')
      expect(result).not.toContain('_adminConverter')
    })

    it('should generate both admin and client types', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin', 'client'])

      expect(result).toContain('import { z } from "zod"')
      expect(result).toContain('firebase-admin/firestore')
      expect(result).toContain('firebase/firestore')

      expect(result).toContain('const databaseSchema = {')
      expect(result).toContain('const databaseConverters = {')

      expect(result).toContain('export function createFireTypeAdmin')
      expect(result).toContain('export function createFireTypeClient')

      // Check for both converter types
      expect(result).toContain('_adminConverter')
      expect(result).toContain('_clientConverter')
    })

    it('should include nested collection schemas', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      // Check for users schema
      expect(result).toContain('"users":')
      expect(result).toContain('name: z.string()')
      expect(result).toContain('email: z.string().email()')

      // Check for nested comments schema
      expect(result).toContain('"comments":')
      expect(result).toContain('content: z.string()')

      // Check for posts schema
      expect(result).toContain('"posts":')
      expect(result).toContain('title: z.string()')
      expect(result).toContain('publishedAt: z.date()')
    })

    it('should generate valid TypeScript code', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      // Basic TypeScript validation - should contain proper syntax
      expect(result).toContain('import {')
      expect(result).toContain('} from')
      expect(result).toContain('export function')
      expect(result).toContain('const ')
      expect(result).toContain(': {')
      expect(result).toContain('}')

      // Should not contain obvious syntax errors
      expect(result).not.toContain('undefined')
      expect(result).not.toContain('null')
    })

    it('should handle empty directory', () => {
      const emptyDir = path.join(fixturesPath, 'empty-dir')
      require('fs').mkdirSync(emptyDir, { recursive: true })

      // The function should not throw, but should return generated code
      // (though it might be minimal due to no schemas found)
      const result = generateFiretypeFile(emptyDir, ['admin'])
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)

      require('fs').rmdirSync(emptyDir)
    })

    it('should use directory name as schema prefix', () => {
      const result = generateFiretypeFile(validDatabasePath, ['admin'])

      // Should use 'database' as the prefix for schema and converters
      expect(result).toContain('const databaseSchema = {')
      expect(result).toContain('const databaseConverters = {')
    })
  })
})

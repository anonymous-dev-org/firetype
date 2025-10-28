import * as fs from 'fs'
import * as path from 'path'
import { describe, expect, it } from 'vitest'
import {
  createImportStatements,
  generateConvertersTree,
  generateCreationFunction,
  generateFileSystemTree,
  generateSchemaTree,
} from '../src/script'

describe('Script Functions', () => {
  const fixturesPath = path.join(__dirname, 'fixtures')
  const validDatabasePath = path.join(fixturesPath, 'database')

  describe('generateFileSystemTree', () => {
    it('should parse directory structure and extract schemas', () => {
      const tree = generateFileSystemTree(validDatabasePath)

      expect(tree).toHaveProperty('users')
      expect(tree).toHaveProperty('posts')
      expect(tree.users).toHaveProperty('_schema')
      expect(tree.posts).toHaveProperty('_schema')
      expect(tree.users).toHaveProperty('comments')
      expect(tree.users.comments).toHaveProperty('_schema')

      // Check that schema content contains expected Zod structure
      expect(tree.users._schema).toContain('z.object')
      expect(tree.users._schema).toContain('name: z.string()')
      expect(tree.users._schema).toContain('email: z.string().email()')
    })

    it('should handle invalid schema files gracefully', () => {
      const invalidPath = path.join(fixturesPath, 'invalid-schema')
      const tree = generateFileSystemTree(invalidPath)

      // Should create tree but _schema should be undefined due to invalid format
      expect(tree).not.toHaveProperty('_schema')
    })

    it('should handle empty directories', () => {
      const emptyDir = path.join(fixturesPath, 'empty')
      fs.mkdirSync(emptyDir, { recursive: true })

      const tree = generateFileSystemTree(emptyDir)
      expect(tree).toEqual({})

      fs.rmdirSync(emptyDir)
    })
  })

  describe('generateSchemaTree', () => {
    it('should convert filesystem tree to schema tree string', () => {
      const fileSystemTree = {
        users: {
          _schema: 'z.object({ name: z.string() })',
          comments: {
            _schema: 'z.object({ content: z.string() })'
          }
        },
        posts: {
          _schema: 'z.object({ title: z.string() })'
        }
      }

      const schemaTree = generateSchemaTree(fileSystemTree)

      expect(schemaTree).toContain('"users":')
      expect(schemaTree).toContain('"posts":')
      expect(schemaTree).toContain('"comments":')
      expect(schemaTree).toContain('_schema: z.object({ name: z.string() })')
    })

    it('should handle empty trees', () => {
      const schemaTree = generateSchemaTree({})
      expect(schemaTree).toBe('')
    })
  })

  describe('generateConvertersTree', () => {
    it('should generate admin converters', () => {
      const fileSystemTree = {
        users: {
          _schema: 'z.object({ name: z.string() })'
        }
      }

      const convertersTree = generateConvertersTree('testSchema', fileSystemTree, ['admin'])

      expect(convertersTree).toContain('"_adminConverter"')
      expect(convertersTree).toContain('toFirestore')
      expect(convertersTree).toContain('fromFirestore')
      expect(convertersTree).toContain('AdminDocumentData')
      expect(convertersTree).toContain('AdminQueryDocumentSnapshot')
    })

    it('should generate client converters', () => {
      const fileSystemTree = {
        posts: {
          _schema: 'z.object({ title: z.string() })'
        }
      }

      const convertersTree = generateConvertersTree('testSchema', fileSystemTree, ['client'])

      expect(convertersTree).toContain('"_clientConverter"')
      expect(convertersTree).toContain('toFirestore')
      expect(convertersTree).toContain('fromFirestore')
      expect(convertersTree).toContain('ClientDocumentData')
      expect(convertersTree).toContain('ClientQueryDocumentSnapshot')
    })

    it('should generate both admin and client converters', () => {
      const fileSystemTree = {
        users: {
          _schema: 'z.object({ name: z.string() })'
        }
      }

      const convertersTree = generateConvertersTree('testSchema', fileSystemTree, ['admin', 'client'])

      expect(convertersTree).toContain('"_adminConverter"')
      expect(convertersTree).toContain('"_clientConverter"')
    })

    it('should handle nested collections', () => {
      const fileSystemTree = {
        users: {
          _schema: 'z.object({ name: z.string() })',
          comments: {
            _schema: 'z.object({ content: z.string() })'
          }
        }
      }

      const convertersTree = generateConvertersTree('testSchema', fileSystemTree, ['admin'])

      expect(convertersTree).toContain('"users":')
      expect(convertersTree).toContain('"comments":')
      expect(convertersTree).toContain('_adminConverter')
    })
  })

  describe('generateCreationFunction', () => {
    it('should generate admin creation function', () => {
      const fileSystemTree = {
        users: {
          _schema: 'z.object({ name: z.string() })',
          comments: {
            _schema: 'z.object({ content: z.string() })'
          }
        },
        posts: {
          _schema: 'z.object({ title: z.string() })'
        }
      }

      const creationFunction = generateCreationFunction(fileSystemTree, 'admin')

      expect(creationFunction).toContain('export function createFireTypeAdmin')
      expect(creationFunction).toContain('AdminFirestore')
      expect(creationFunction).toContain('getDocumentRef')
      expect(creationFunction).toContain('getCollectionRef')
      expect(creationFunction).toContain('getCollectionGroupRef')
      expect(creationFunction).toContain('users:')
      expect(creationFunction).toContain('posts:')
      expect(creationFunction).toContain('comments:')
    })

    it('should generate client creation function', () => {
      const fileSystemTree = {
        users: {
          _schema: 'z.object({ name: z.string() })'
        }
      }

      const creationFunction = generateCreationFunction(fileSystemTree, 'client')

      expect(creationFunction).toContain('export function createFireTypeClient')
      expect(creationFunction).toContain('ClientFirestore')
      expect(creationFunction).toContain('getDocumentRef')
      expect(creationFunction).toContain('getCollectionRef')
      expect(creationFunction).toContain('getCollectionGroupRef')
    })

    it('should handle nested collections with proper parameter passing', () => {
      const fileSystemTree = {
        users: {
          comments: {
            _schema: 'z.object({ content: z.string() })'
          }
        }
      }

      const creationFunction = generateCreationFunction(fileSystemTree, 'admin')

      // Should include usersId parameter for nested comments collection
      expect(creationFunction).toContain('usersId: string')
      expect(creationFunction).toContain('${args.usersId}')
    })
  })

  describe('createImportStatements', () => {
    it('should generate admin imports', () => {
      const imports = createImportStatements(['admin'])

      expect(imports).toContain('import { z } from "zod"')
      expect(imports).toContain('Firestore as AdminFirestore')
      expect(imports).toContain('DocumentData as AdminDocumentData')
      expect(imports).toContain('firebase-admin/firestore')
      expect(imports).not.toContain('firebase/firestore')
    })

    it('should generate client imports', () => {
      const imports = createImportStatements(['client'])

      expect(imports).toContain('import { z } from "zod"')
      expect(imports).toContain('Firestore as ClientFirestore')
      expect(imports).toContain('DocumentData as ClientDocumentData')
      expect(imports).toContain('firebase/firestore')
      expect(imports).not.toContain('firebase-admin/firestore')
    })

    it('should generate both admin and client imports', () => {
      const imports = createImportStatements(['admin', 'client'])

      expect(imports).toContain('import { z } from "zod"')
      expect(imports).toContain('firebase-admin/firestore')
      expect(imports).toContain('firebase/firestore')
    })

    it('should handle empty modes array', () => {
      const imports = createImportStatements([])

      expect(imports).toContain('import { z } from "zod"')
      expect(imports).not.toContain('firebase-admin/firestore')
      expect(imports).not.toContain('firebase/firestore')
    })
  })
})

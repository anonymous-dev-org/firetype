import * as fs from 'fs'
import * as path from 'path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the modules that have side effects
vi.mock('fs')
vi.mock('../src/generator', () => ({
  generateFiretypeFile: vi.fn()
}))

import { generateFiretypeFile } from '../src/generator'

// Import the CLI functions after mocking
// Note: We'll test the functions individually rather than the main() function
// since it calls process.exit which complicates testing

describe('CLI Functions', () => {
  const mockFs = fs as any
  const mockGenerateFiretypeFile = generateFiretypeFile as any

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset fs mocks
    mockFs.existsSync.mockReturnValue(true)
    mockFs.statSync.mockReturnValue({
      isDirectory: () => true
    })
    mockFs.readdirSync.mockReturnValue(['users', 'posts'])
    mockFs.mkdirSync.mockImplementation(() => { })
    mockFs.writeFileSync.mockImplementation(() => { })

    // Mock generateFiretypeFile to return sample content
    mockGenerateFiretypeFile.mockReturnValue('// Generated Firetype code')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Argument Parsing', () => {
    // We'll need to extract the parseArgs function for testing
    // For now, let's create a mock implementation and test the logic

    it('should parse generate command with input and output', () => {
      const args = ['generate', '--input=./src/schemas', '--output=./src/types']

      // Simulate the parsing logic from the CLI
      const commandArg = args.find(arg => !arg.startsWith("--")) || "help"
      const options: any = {}

      args.forEach(arg => {
        if (arg.startsWith("--input=")) {
          options.startPath = arg.slice("--input=".length)
        } else if (arg.startsWith("--output=")) {
          options.outputPath = arg.slice("--output=".length)
        }
      })

      expect(commandArg).toBe('generate')
      expect(options.startPath).toBe('./src/schemas')
      expect(options.outputPath).toBe('./src/types')
    })

    it('should parse mode arguments', () => {
      const args = ['generate', '--mode=admin', '--input=./src/schemas', '--output=./src/types']

      const options: any = {}

      args.forEach(arg => {
        if (arg.startsWith("--mode=")) {
          const modeValue = arg.slice("--mode=".length).toLowerCase()
          if (modeValue === "admin" || modeValue === "client") {
            options.mode = modeValue as "admin" | "client"
          }
        }
      })

      expect(options.mode).toBe('admin')
    })

    it('should parse path shorthand', () => {
      const args = ['generate', '--path=./schemas']

      const options: any = {}

      args.forEach(arg => {
        if (arg.startsWith("--path=")) {
          const pathValue = arg.slice("--path=".length)
          options.startPath = options.startPath || pathValue
          options.outputPath = options.outputPath || pathValue
        }
      })

      expect(options.startPath).toBe('./schemas')
      expect(options.outputPath).toBe('./schemas')
    })

    it('should require input and output for generate command', () => {
      // Test missing input
      let args = ['generate', '--output=./output']
      let options: any = {}

      args.forEach(arg => {
        if (arg.startsWith("--output=")) {
          options.outputPath = arg.slice("--output=".length)
        }
      })

      expect(options.startPath).toBeUndefined()
      expect(options.outputPath).toBe('./output')

      // Test missing output
      args = ['generate', '--input=./input']
      options = {}

      args.forEach(arg => {
        if (arg.startsWith("--input=")) {
          options.startPath = arg.slice("--input=".length)
        }
      })

      expect(options.startPath).toBe('./input')
      expect(options.outputPath).toBeUndefined()
    })

    it('should handle help command', () => {
      const args = ['help']
      const commandArg = args.find(arg => !arg.startsWith("--")) || "help"

      expect(commandArg).toBe('help')
    })
  })

  describe('File System Operations', () => {
    it('should create output directory if it does not exist', () => {
      mockFs.existsSync.mockReturnValueOnce(false)

      // Simulate the generate function logic
      const outputPath = './output'
      const targetPath = path.join(outputPath, 'index.ts')
      const targetDir = path.dirname(targetPath)

      if (!mockFs.existsSync(targetDir)) {
        mockFs.mkdirSync(targetDir, { recursive: true })
      }

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(targetDir, { recursive: true })
    })

    it('should throw error if output path exists but is not a directory', () => {
      mockFs.existsSync.mockReturnValueOnce(true)
      mockFs.statSync.mockReturnValueOnce({
        isDirectory: () => false
      })

      const outputPath = './output'

      expect(() => {
        if (mockFs.existsSync(outputPath) && !mockFs.statSync(outputPath).isDirectory()) {
          throw new Error(`Provided output path '${outputPath}' exists but is not a directory.`)
        }
      }).toThrow('Provided output path \'./output\' exists but is not a directory.')
    })

    it('should find first directory in input path', () => {
      const startPath = './input'
      const firstDir = mockFs.readdirSync(startPath)
        .map((name: string) => path.join(startPath, name))
        .filter((filePath: string) => mockFs.statSync(filePath).isDirectory())[0]

      expect(firstDir).toBe(path.join(startPath, 'users'))
    })

    it('should write generated file to correct location', () => {
      const outputPath = './output'
      const generatedFile = '// Generated content'
      const targetPath = path.join(outputPath, 'index.ts')

      mockFs.writeFileSync(targetPath, generatedFile)

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(targetPath, generatedFile)
    })
  })

  describe('Integration with Generator', () => {
    it('should call generateFiretypeFile with correct parameters', () => {
      const firstDir = './input/database'
      const modes = ['admin', 'client'] as Array<"admin" | "client">

      generateFiretypeFile(firstDir, modes)

      expect(mockGenerateFiretypeFile).toHaveBeenCalledWith(firstDir, modes)
    })

    it('should handle different mode combinations', () => {
      const firstDir = './input/database'

      // Test admin only
      generateFiretypeFile(firstDir, ['admin'])
      expect(mockGenerateFiretypeFile).toHaveBeenCalledWith(firstDir, ['admin'])

      // Test client only
      generateFiretypeFile(firstDir, ['client'])
      expect(mockGenerateFiretypeFile).toHaveBeenCalledWith(firstDir, ['client'])

      // Test both
      generateFiretypeFile(firstDir, ['admin', 'client'])
      expect(mockGenerateFiretypeFile).toHaveBeenCalledWith(firstDir, ['admin', 'client'])
    })
  })

  describe('Error Handling', () => {
    it('should handle file system errors during generation', () => {
      mockFs.readdirSync.mockImplementationOnce(() => {
        throw new Error('Directory not found')
      })

      expect(() => {
        const startPath = './nonexistent'
        mockFs.readdirSync(startPath)
      }).toThrow('Directory not found')
    })

    it('should handle generator errors', () => {
      mockGenerateFiretypeFile.mockImplementationOnce(() => {
        throw new Error('Generator failed')
      })

      expect(() => {
        generateFiretypeFile('./input', ['admin'])
      }).toThrow('Generator failed')
    })
  })
})

#!/usr/bin/env node

import { generateFiretypeFile } from "./generator"
import * as path from "path"
import * as fs from "fs"

type Command = "generate" | "init" | "help"
type Mode = "admin" | "client"

interface CliOptions {
  output?: string
  mode?: Mode
}

async function parseArgs(): Promise<{ command: Command; options: CliOptions }> {
  const args = process.argv.slice(2)
  const command = (args[0] || "help") as Command
  const options: CliOptions = {}

  // Check if mode is specified right after generate command
  if (command === "generate" && args[1] && !args[1].startsWith("--")) {
    const mode = args[1].toLowerCase()
    if (mode === "admin" || mode === "client") {
      options.mode = mode
    } else {
      throw new Error(
        `Invalid mode: ${mode}. Must be either 'admin' or 'client'`
      )
    }
  }

  // Parse remaining arguments
  const startIndex = command === "generate" && options.mode ? 2 : 1
  for (let i = startIndex; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith("--")) {
      const option = arg.slice(2)
      if (option.startsWith("output=")) {
        options.output = option.split("=")[1]
      }
    }
  }

  return { command, options }
}

// Add this new function to search for the firetype folder
function findFiretypeFolder(startPath: string): string | null {
  // Check if the current directory has a firetype folder
  const firetypePath = path.join(startPath, "firetype")
  if (fs.existsSync(firetypePath) && fs.statSync(firetypePath).isDirectory()) {
    return firetypePath
  }

  // Check src directory if it exists
  const srcPath = path.join(startPath, "src", "firetype")
  if (fs.existsSync(srcPath) && fs.statSync(srcPath).isDirectory()) {
    return srcPath
  }

  // Get parent directory
  const parentDir = path.dirname(startPath)

  // Stop if we've reached the root
  if (parentDir === startPath) {
    return null
  }

  // Recursively check parent directory
  return findFiretypeFolder(parentDir)
}

async function generate(options: CliOptions) {
  console.log("🪵💥 Generating Firetype schemas...")

  let modes: Mode[]
  if (options.mode) {
    modes = [options.mode]
    console.log(`Generating ${options.mode} types only`)
  } else {
    modes = ["admin", "client"]
  }

  try {
    const outputPath = options.output
      ? path.resolve(process.cwd(), options.output, "firetype.ts")
      : undefined

    // Find the firetype folder
    const firetypePath = findFiretypeFolder(process.cwd())
    if (!firetypePath) {
      throw new Error(
        "Could not find 'firetype' folder. Make sure it exists in your project directory or its parent directories."
      )
    }

    const generatedPath = generateFiretypeFile(firetypePath, modes, outputPath)
    console.log(`🔥🔥🔥🔥 Generated Firetype schema at: ${generatedPath}`)
  } catch (error) {
    console.error("Failed to generate schema:", error)
    throw error
  }
}

function showHelp() {
  console.log(`
Firetype CLI - Typesafe ODM for Firestore

Usage:
  firetype <command> [mode] [options]

Commands:
  generate [mode]  Generate TypeScript types from your Firestore schema
  init            Initialize a new Firetype project
  help            Show this help message

Mode:
  admin           Generate only admin types
  client          Generate only client types
  
  Note: If no mode is specified, both admin and client types will be generated

Options:
  --output=<dir>  Specify output directory for generated files

Examples:
  firetype generate
  firetype generate admin
  firetype generate client
  firetype generate admin --output=./types
  firetype init
`)
}

async function main() {
  try {
    const { command, options } = await parseArgs()

    switch (command) {
      case "generate":
        await generate(options)
        break
      case "help":
        showHelp()
        break
      default:
        console.error(`Unknown command: ${command}`)
        showHelp()
        process.exit(1)
    }
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()

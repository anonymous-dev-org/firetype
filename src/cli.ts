#!/usr/bin/env node

import { generateFiretypeFile } from "./generator"
import * as path from "path"
import * as fs from "fs"

type Command = "generate" | "init" | "help"
type Mode = "admin" | "client"

interface CliOptions {
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

  return { command, options }
}

function findFiretypeFolder(startPath: string): string | null {
  const firetypePath = path.join(startPath, "firetype")
  if (fs.existsSync(firetypePath) && fs.statSync(firetypePath).isDirectory()) {
    return firetypePath
  }

  const srcPath = path.join(startPath, "src", "firetype")
  if (fs.existsSync(srcPath) && fs.statSync(srcPath).isDirectory()) {
    return srcPath
  }

  const parentDir = path.dirname(startPath)

  if (parentDir === startPath) {
    return null
  }

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
    const outputPath = path.join(__dirname, "firetype.ts")

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
  firetype <command> [mode]

Commands:
  generate [mode]  Generate TypeScript types from your Firestore schema
  init             Initialize a new Firetype project
  help             Show this help message

Mode:
  admin            Generate only admin types
  client           Generate only client types
  
  Note: If no mode is specified, both admin and client types will be generated

Examples:
  firetype generate
  firetype generate admin
  firetype generate client
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

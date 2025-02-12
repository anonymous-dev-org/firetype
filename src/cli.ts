#!/usr/bin/env node

import { generateFiretypeFile } from "./generator"
import * as path from "path"
import * as fs from "fs"

type Command = "generate" | "help"
type Mode = "admin" | "client"

interface CliOptions {
  mode?: Mode
  startPath?: string
  outputPath?: string
}

const MODE_ARG = "--mode="
const INPUT_ARG = "--input="
const OUTPUT_ARG = "--output="

async function parseArgs(): Promise<{ command: Command; options: CliOptions }> {
  const args = process.argv.slice(2)
  const options: CliOptions = {}

  const commandArg = args.find(arg => !arg.startsWith("--")) || "help"

  args.forEach(arg => {
    if (arg.startsWith(MODE_ARG)) {
      const modeValue = arg.slice(MODE_ARG.length).toLowerCase()
      if (modeValue === "admin" || modeValue === "client") {
        options.mode = modeValue as Mode
      }
    } else if (arg.startsWith(INPUT_ARG)) {
      options.startPath = arg.slice(INPUT_ARG.length)
    } else if (arg.startsWith(OUTPUT_ARG)) {
      options.outputPath = arg.slice(OUTPUT_ARG.length)
    }
  })

  return { command: commandArg as Command, options }
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
  console.log(
    "💥 Generating Firetype schemas..." +
      (options.startPath ? ` from ${options.startPath}` : "")
  )

  let modes: Mode[]
  if (options.mode) {
    modes = [options.mode]
  } else {
    modes = ["admin", "client"]
  }

  const startPath = options.startPath
    ? path.resolve(process.cwd(), options.startPath)
    : process.cwd()

  try {
    let outputPath: string
    if (options.outputPath) {
      if (!fs.existsSync(options.outputPath)) {
        fs.mkdirSync(options.outputPath, { recursive: true })
      } else if (!fs.statSync(options.outputPath).isDirectory()) {
        throw new Error(
          `Provided output path '${options.outputPath}' exists but is not a directory.`
        )
      }
      outputPath = options.outputPath
    } else {
      // Use process.env.INIT_CWD if available to start from where the command was run
      const foundPath = findFiretypeFolder(startPath)
      if (!foundPath) {
        throw new Error(
          "Could not find 'firetype' folder. Make sure it exists in your project directory or its parent directories."
        )
      }
      outputPath = foundPath
    }

    const firstDir = fs
      .readdirSync(startPath)
      .map(name => path.join(startPath, name))
      .filter(filePath => fs.statSync(filePath).isDirectory())[0]

    if (!firstDir) {
      throw new Error(
        `No directories found in the firetype folder: ${startPath}`
      )
    }

    const generatedFile = generateFiretypeFile(firstDir, modes)
    const targetPath = outputPath || path.join(startPath, "index.ts")
    const targetDir = path.dirname(targetPath)

    // Ensure the output directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    let filePath = targetPath
    if (fs.existsSync(targetPath) && fs.lstatSync(targetPath).isDirectory()) {
      filePath = path.join(targetPath, "index.ts")
    }
    fs.writeFileSync(filePath, generatedFile)
    console.log(
      `🔥🔥🔥🔥 Generated Firetype schema` +
        (options.outputPath ? ` at ${filePath}` : "")
    )
  } catch (error) {
    console.error("Failed to generate schema:", error)
    throw error
  }
}

function showHelp() {
  console.log(`
Firetype CLI - Typesafe ODM for Firestore

Usage:
  firetype <command> [options]

Commands:
  generate    Generate TypeScript types from your Firestore schema
  help        Show this help message

Options:
  --mode=<admin|client>   Generate only admin or client types. Defaults to generating both if not provided.
  --input=<path>          Optional start directory to search for the firetype folder. Defaults to the current working directory.
  --output=<path>         Optional output directory for the generated file. Defaults to the found firetype folder if not provided.

Examples:
  firetype generate
  firetype generate --mode=admin
  firetype generate --mode=client --input=/my/start/path
  firetype generate --mode=admin --input=/my/start/path --output=/my/output/path
`)
}

async function main() {
  try {
    const { command, options } = await parseArgs()

    console.log("main", command, options)
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

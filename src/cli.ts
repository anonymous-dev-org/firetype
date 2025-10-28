#!/usr/bin/env node

import * as fs from "fs"
import * as path from "path"
import { generateFiretypeFile } from "./generator"

type Command = "generate" | "help"
type Mode = "admin" | "client"

interface CliOptions {
  mode?: Mode
  startPath: string
}

const MODE_ARG = "--mode="
const INPUT_ARG = "--input="

const YELLOW = "\x1b[33m"
const ORANGE = "\x1b[38;2;255;165;0m" // Custom RGB for ORANGE
const RED = "\x1b[31m"
const RESET = "\x1b[0m"

async function parseArgs(): Promise<{ command: Command; options: CliOptions }> {
  const args = process.argv.slice(2)
  const options: Partial<CliOptions> = {}

  const commandArg = args.find(arg => !arg.startsWith("--")) || "help"

  args.forEach(arg => {
    if (arg.startsWith(MODE_ARG)) {
      const modeValue = arg.slice(MODE_ARG.length).toLowerCase()
      if (modeValue === "admin" || modeValue === "client") {
        options.mode = modeValue as Mode
      }
    } else if (arg.startsWith(INPUT_ARG)) {
      options.startPath = arg.slice(INPUT_ARG.length)
    }
  })

  // For the generate command, input path is required; output is the same path
  if (commandArg === "generate") {
    if (!options.startPath) {
      console.error(
        "Error: --input parameter is required for the generate command"
      )
      showHelp()
      process.exit(1)
    }
  }

  return {
    command: commandArg as Command,
    options: options as CliOptions,
  }
}

async function generate(options: CliOptions) {
  console.log(
    `
                      ${YELLOW}-${RESET}
                      ${YELLOW}----${RESET}
                       ${YELLOW}-----${RESET}
                       ${YELLOW}-------${RESET}
                       ${YELLOW}--------${RESET}
                      ${YELLOW}+---------${RESET}
                      ${YELLOW}-----------${RESET}
                     ${YELLOW}+------------${RESET}
                    ${YELLOW}++------------${RESET}
                   ${YELLOW}-++------------${RESET}
                  ${YELLOW}-+++------------${RESET}
                ${YELLOW}---+++------------${RESET}   ${YELLOW}-${RESET}
               ${YELLOW}----++++----------${RESET}    ${YELLOW}---${RESET}
             ${YELLOW}++----++++---------${RESET}    ${YELLOW}-----${RESET}
            ${YELLOW}++-----++++--------${RESET}    ${YELLOW}--------${RESET}
          ${ORANGE}#${YELLOW}+++-----+++++------${RESET}    ${YELLOW}----------${RESET}
         ${ORANGE}##${YELLOW}+++-----+++++++--${RESET}    ${YELLOW}++------------${RESET}
        ${ORANGE}##${YELLOW}++++${ORANGE}#${YELLOW}---+++++++++${RESET}    ${YELLOW}++++++----------${RESET}
      ${ORANGE}####${YELLOW}+++++---+++++++++++++++++++++++-------${RESET}
      ${ORANGE}####${YELLOW}++++++-++++++++++++++++++++++++--------${RESET}
     ${ORANGE}######${YELLOW}+++++${ORANGE}##${YELLOW}+++++++++++++++++++++++---------${RESET}
     ${ORANGE}######${YELLOW}++++++${ORANGE}##${YELLOW}+++++++++++++++++++++----------${RESET}
    ${ORANGE}########${YELLOW}+++++${ORANGE}####${YELLOW}+++++++++${ORANGE}#####${YELLOW}++++-----------${RESET}
    ${ORANGE}#########${YELLOW}+++++${ORANGE}#####${YELLOW}++++${ORANGE}#########${YELLOW}+--------------${RESET}
    ${ORANGE}###########${YELLOW}+++${ORANGE}#######${YELLOW}+${ORANGE}#########${YELLOW}+++-------------${RESET}
    ${RED}#############${YELLOW}++${ORANGE}#######${YELLOW}+${ORANGE}#######${YELLOW}+++++------------${RESET}
    ${RED}##############${YELLOW}+${RED}#############${YELLOW}-+++++++----------${RESET}
     ${RED}#########################${YELLOW}-+++++++++-++++++---${RESET}
     ${RED}#######################${YELLOW}--+++++++++++++++++++${RESET}
      ${RED}#####################${YELLOW}-++++++++++++++++++++-${RESET}
       ${RED}###################${YELLOW}#++++++++++++++++++++++${RESET}
        ${RED}###################${YELLOW}++++++++++++++++++++${RESET}
         ${RED}####################${YELLOW}++++++++++++++++${RESET}
           ${RED}##########${YELLOW}+${RED}#########${YELLOW}+++++++++++++${RESET}
             ${RED}#######${YELLOW}+++${RED}#########${YELLOW}++++++#++${RESET}
                ${RED}####${YELLOW}+++${RED}##########${YELLOW}++###${RESET}
                     ${RED}#############${RESET}
`
  )

  let modes: Mode[]
  if (options.mode) {
    modes = [options.mode]
  } else {
    modes = ["admin", "client"]
  }

  const startPath = path.resolve(process.cwd(), options.startPath)
  const outputPath = startPath

  try {
    // Check if startPath exists and is a directory
    if (!fs.existsSync(startPath)) {
      throw new Error(`Input path does not exist: ${startPath}`)
    }

    if (!fs.statSync(startPath).isDirectory()) {
      throw new Error(`Input path is not a directory: ${startPath}`)
    }

    const generatedFile = generateFiretypeFile(startPath, modes)
    const targetPath = path.join(outputPath, "index.ts")
    const targetDir = path.dirname(targetPath)

    // Ensure the directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    fs.writeFileSync(targetPath, generatedFile)
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
  --input=<path>          Input directory containing the Firestore schema structure. Output will be placed here.

Examples:
  firetype help
  firetype generate --input=/path/to/schema
  firetype generate --mode=admin --input=/path/to/schema
`)
}

async function main() {
  try {
    const { command, options } = await parseArgs()

    switch (command) {
      case "generate":
        await generate(options)

        const startPath = path.resolve(process.cwd(), options.startPath)
        console.log(
          `${ORANGE}Generated Firetype schema at ${RESET}${startPath}`
        )
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

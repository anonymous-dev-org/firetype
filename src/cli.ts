#!/usr/bin/env node

import { generateFiretypeFile } from "./generator"
import * as path from "path"
import * as fs from "fs"

type Command = "generate" | "help"
type Mode = "admin" | "client"

interface CliOptions {
  mode?: Mode
  path?: string
  startPath: string
  outputPath: string
}

const MODE_ARG = "--mode="
const INPUT_ARG = "--input="
const OUTPUT_ARG = "--output="
const PATH_ARG = "--path="

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
    } else if (arg.startsWith(PATH_ARG)) {
      options.path = arg.slice(PATH_ARG.length)
    } else if (arg.startsWith(INPUT_ARG)) {
      options.startPath = arg.slice(INPUT_ARG.length)
    } else if (arg.startsWith(OUTPUT_ARG)) {
      options.outputPath = arg.slice(OUTPUT_ARG.length)
    }
  })

  // For the generate command, both input and output paths are requiRED
  if (commandArg === "generate") {
    // If path is provided, use it for both startPath and outputPath
    if (options.path) {
      options.startPath = options.startPath || options.path
      options.outputPath = options.outputPath || options.path
    }

    if (!options.startPath) {
      console.error(
        "Error: Either --input or --path parameter is requiRED for the generate command"
      )
      showHelp()
      process.exit(1)
    }
    if (!options.outputPath) {
      console.error(
        "Error: Either --output or --path parameter is requiRED for the generate command"
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
  const outputPath = path.resolve(process.cwd(), options.outputPath)

  try {
    // Ensure the output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true })
    } else if (!fs.statSync(outputPath).isDirectory()) {
      throw new Error(
        `Provided output path '${options.outputPath}' exists but is not a directory.`
      )
    }

    const firstDir = fs
      .readdirSync(startPath)
      .map(name => path.join(startPath, name))
      .filter(filePath => fs.statSync(filePath).isDirectory())[0]

    if (!firstDir) {
      throw new Error(`No directories found in the input folder: ${startPath}`)
    }

    const generatedFile = generateFiretypeFile(firstDir, modes)
    const targetPath = path.join(outputPath, "index.ts")
    const targetDir = path.dirname(targetPath)

    // Ensure the output directory exists
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
  --path=<path>           Shorthand to set both input and output paths to the same directory.
  --input=<path>          Input directory containing the Firestore schema structure. RequiRED if --path is not provided.
  --output=<path>         Output directory for the generated TypeScript file. RequiRED if --path is not provided.

Examples:
  firetype help
  firetype generate --input=/path/to/schema --output=/path/to/output
  firetype generate --path=/path/to/dir
  firetype generate --mode=admin --input=/path/to/schema --output=/path/to/output
  firetype generate --mode=client --path=/path/to/dir
`)
}

async function main() {
  try {
    const { command, options } = await parseArgs()

    switch (command) {
      case "generate":
        await generate(options)

        let outputLocation = ""
        if (options.path) {
          outputLocation = options.path
        } else {
          if (options.startPath)
            outputLocation += `input: ${options.startPath} `
          if (options.outputPath)
            outputLocation += `output: ${options.outputPath}`
        }

        console.log(
          `${ORANGE}Generated Firetype schema at ${RESET}${outputLocation}`
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

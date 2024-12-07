import * as fs from "fs"
import * as path from "path"
import {
  createImportStatements,
  generateCreationFunction,
  generateConvertersTree,
  generateFileSystemTree,
  generateSchemaTree,
} from "./script"

export function generateFiretypeFile(
  firetypePath: string,
  modes: Array<"admin" | "client">,
  outputPath?: string
) {
  let generatedFile = ""
  // Read the first directory in the firetype folder
  const firstDir = fs
    .readdirSync(firetypePath)
    .map(name => path.join(firetypePath, name))
    .filter(filePath => fs.statSync(filePath).isDirectory())[0]

  if (!firstDir) {
    throw new Error("No directories found in the firetype folder")
  }

  generatedFile += createImportStatements(modes)

  const firstDirName = path.basename(firstDir)

  const tree = generateFileSystemTree(firstDir)
  // Generate tree starting from the first directory
  const treeSchema = generateSchemaTree(tree)
  const schemaName = `${firstDirName}Schema`
  const treeSchemaString = `const ${schemaName} = ${treeSchema}`

  generatedFile += treeSchemaString

  const convertersTree = generateConvertersTree(schemaName, tree, modes)

  const converterName = `${firstDirName}Converters`

  generatedFile += `\n\nconst ${converterName} = ${convertersTree}`

  if (modes.includes("admin")) {
    generatedFile += `\n\n${generateCreationFunction(tree, "admin")}`
  }

  if (modes.includes("client")) {
    generatedFile += `\n\n${generateCreationFunction(tree, "client")}`
  }

  // Use the firetype directory as the target location if no outputPath is provided
  const targetPath = outputPath || path.join(firetypePath, "firetype.ts")
  const targetDir = path.dirname(targetPath)

  // Ensure the output directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  fs.writeFileSync(targetPath, generatedFile)
  return targetPath
}

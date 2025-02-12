import * as path from "path"
import {
  createImportStatements,
  generateCreationFunction,
  generateConvertersTree,
  generateFileSystemTree,
  generateSchemaTree,
} from "./script"

export function generateFiretypeFile(
  firstDir: string,
  modes: Array<"admin" | "client">
) {
  let generatedFile = ""

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

  return generatedFile
}

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

  const fileSystemTree = generateFileSystemTree(firstDir)

  const schemaTree = generateSchemaTree(fileSystemTree)

  const schemaName = `${firstDirName}Schema`
  const treeSchemaString = `const ${schemaName} = {${schemaTree}}`

  generatedFile += treeSchemaString

  const convertersTree = generateConvertersTree(
    schemaName,
    fileSystemTree,
    modes
  )

  const converterName = `${firstDirName}Converters`

  generatedFile += `\n\nconst ${converterName} = ${convertersTree}`

  if (modes.includes("admin")) {
    generatedFile += `\n\n${generateCreationFunction(fileSystemTree, "admin")}`
  }

  if (modes.includes("client")) {
    generatedFile += `\n\n${generateCreationFunction(fileSystemTree, "client")}`
  }

  return generatedFile
}

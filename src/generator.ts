import * as path from "path"
import {
  createImportStatements,
  generateCollectionPathsType,
  generateConvertersTree,
  generateCreationFunction,
  generateFileSystemTree,
  generateSchemaTree,
  processSchemaReferences,
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
  const processedSchemaTree = processSchemaReferences(schemaTree, modes)
  const treeSchemaString = `const ${schemaName} = {${processedSchemaTree}}`

  generatedFile += treeSchemaString

  // Generate collection paths type for type safety
  const collectionPaths = generateCollectionPathsType(fileSystemTree)
  const pathsUnion = collectionPaths.length > 0
    ? collectionPaths.map(path => `"${path}"`).join(" | ")
    : '""'
  generatedFile += `\n\nexport type ${firstDirName}CollectionPaths = ${pathsUnion};`

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

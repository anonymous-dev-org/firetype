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
  inputDir: string,
  modes: Array<"admin" | "client">
) {
  let generatedFile = ""

  generatedFile += createImportStatements(modes)

  // Discover first-level databases inside inputDir
  // Special rule: a database folder named "defualt" is hoisted (no prefix in paths)
  const dbTrees: Record<string, any> = {}
  const entries = require("fs").readdirSync(inputDir)
  for (const name of entries) {
    const fullPath = require("path").join(inputDir, name)
    const stat = require("fs").statSync(fullPath)
    if (stat.isDirectory()) {
      const tree = generateFileSystemTree(fullPath)
      if (name === "defualt") {
        // Hoist collections to root level
        Object.assign(dbTrees, tree)
      } else {
        dbTrees[name] = tree
      }
    }
  }

  const combinedTree = dbTrees

  const schemaTree = generateSchemaTree(combinedTree)

  const schemaName = `databaseSchema`
  const processedSchemaTree = processSchemaReferences(schemaTree, modes)
  const treeSchemaString = `const ${schemaName} = {${processedSchemaTree}}`

  generatedFile += treeSchemaString

  // Generate collection paths type for type safety across all databases
  const collectionPaths = generateCollectionPathsType(combinedTree)
  const pathsUnion = collectionPaths.length > 0
    ? collectionPaths.map(path => `"${path}"`).join(" | ")
    : '""'
  generatedFile += `\n\nexport type DatabaseCollectionPaths = ${pathsUnion};`
  // Stable alias so consumers can import a generic name
  generatedFile += `\nexport type CollectionPath = DatabaseCollectionPaths;`

  // Global typing hook for the library helpers to consume generated paths without direct imports
  generatedFile += `\n\ndeclare global { interface FiretypeGenerated { CollectionPath: DatabaseCollectionPaths } }\nexport {}`

  const convertersTree = generateConvertersTree(
    schemaName,
    combinedTree,
    modes
  )

  const converterName = `databaseConverters`

  generatedFile += `\n\nconst ${converterName} = ${convertersTree}`

  if (modes.includes("admin")) {
    generatedFile += `\n\n${generateCreationFunction(combinedTree, "admin")}`
  }

  if (modes.includes("client")) {
    generatedFile += `\n\n${generateCreationFunction(combinedTree, "client")}`
  }

  return generatedFile
}

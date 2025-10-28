import fs from "fs"
import path from "path"
import {
  createImportStatements,
  generateCollectionPathsType,
  generateConvertersTree,
  generateCreationFunction,
  generateFileSystemTree,
  processSchemaReferences
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
  const entries = fs.readdirSync(inputDir)
  for (const name of entries) {
    const fullPath = path.join(inputDir, name)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      const tree = generateFileSystemTree(fullPath)
      if (name === "default") {
        // Hoist collections to root level
        Object.assign(dbTrees, tree)
      } else {
        dbTrees[name] = tree
      }
    }
  }

  const combinedTree = dbTrees

  // Build per-collection schema constants to avoid self-referential types
  type ColEntry = { id: string; key: string; path: string[]; schemaCode: string }
  const entriesList: ColEntry[] = []

  function walkCollect(tree: Record<string, any>, segs: string[] = []) {
    for (const [key, value] of Object.entries(tree)) {
      if (key === "_schema") continue
      if (value && typeof value === "object") {
        const hasSchema = Boolean(value._schema)
        const newSegs = [...segs, key]
        if (hasSchema) {
          const id = newSegs.join("_")
          entriesList.push({ id, key, path: newSegs, schemaCode: value._schema })
        }
        walkCollect(value, newSegs)
      }
    }
  }
  walkCollect(combinedTree)

  // Emit constants
  for (const e of entriesList) {
    generatedFile += `\nconst schema_${e.id} = ${e.schemaCode}`
  }

  // Build databaseSchema object referencing constants
  function buildSchemaObject(tree: Record<string, any>, segs: string[] = []): string {
    let out = ""
    for (const [key, value] of Object.entries(tree)) {
      if (key === "_schema") continue
      if (value && typeof value === "object") {
        const newSegs = [...segs, key]
        const id = newSegs.join("_")
        const hasSchema = Boolean(value._schema)
        const nested = buildSchemaObject(value, newSegs)
        out += `${JSON.stringify(key)}: {${hasSchema ? ` _schema: schema_${id},` : ""}${nested}},`
      }
    }
    return out
  }

  const schemaName = `databaseSchema`
  const schemaTreeForRefs = buildSchemaObject(combinedTree)
  const processedSchemaTree = processSchemaReferences(schemaTreeForRefs, modes)
  generatedFile += `\n\nconst ${schemaName} = {${processedSchemaTree}}`

  // CollectionPath must be declared after databaseSchema so keyof works
  generatedFile += `\n\nexport type CollectionPath = keyof typeof ${schemaName};`
  // Single global typing hook for helpers (use marker property to avoid conflicts)
  generatedFile += `\n\ndeclare global { interface FiretypeGenerated { __CollectionPath: DatabaseCollectionPaths } }\nexport {}`

  // Utility: Map collection paths to their inferred schema types
  function generateCollectionToSchemaMap(
    tree: Record<string, any>,
    segs: string[] = []
  ): string {
    let out = "{"
    for (const [key, value] of Object.entries(tree)) {
      if (key === "_schema") continue
      if (value && typeof value === "object") {
        const newSegs = [...segs, key]
        const pathString = newSegs.join("/")
        const schemaPath = newSegs.map(s => `.${s}`).join("")
        if (value._schema) {
          out += `\n  ${JSON.stringify(pathString)}: z.infer<typeof ${schemaName}${schemaPath}._schema>,`
        }
        out += generateCollectionToSchemaMap(value, newSegs)
      }
    }
    out += "\n}"
    return out
  }

  const mapBody = generateCollectionToSchemaMap(combinedTree)
  generatedFile += `\n\nexport type CollectionToSchemaMap = ${mapBody}`
  generatedFile += `\nexport type SchemaOf<P extends DatabaseCollectionPaths> = CollectionToSchemaMap[P]`
  generatedFile += `\nexport type AnyCollectionSchema = CollectionToSchemaMap[DatabaseCollectionPaths]`

  // Generate collection paths type for type safety across all databases
  const collectionPaths = generateCollectionPathsType(combinedTree)
  const pathsUnion = collectionPaths.length > 0
    ? collectionPaths.map(path => `"${path}"`).join(" | ")
    : '""'
  generatedFile += `\n\nexport type DatabaseCollectionPaths = ${pathsUnion};`

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

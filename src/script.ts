import * as fs from "fs"
import * as path from "path"

export function createImportStatements(modes: Array<"admin" | "client">) {
  let importStatements = `import { z } from "zod";\n`

  // Add imports based on mode
  if (modes.includes("admin")) {
    importStatements += `import {
  Firestore as AdminFirestore,
  DocumentData as AdminDocumentData,
  QueryDocumentSnapshot as AdminQueryDocumentSnapshot,
  CollectionReference as AdminCollectionReference,
  CollectionGroup as AdminCollectionGroup,
  DocumentReference as AdminDocumentReference,
} from "firebase-admin/firestore";\n`
  }

  if (modes.includes("client")) {
    importStatements += `import {
  Firestore as ClientFirestore,
  SnapshotOptions as ClientSnapshotOptions,
  QueryDocumentSnapshot as ClientQueryDocumentSnapshot,
  DocumentData as ClientDocumentData,
  collectionGroup as clientCollectionGroup,
  Query as ClientQuery,
  CollectionReference as ClientCollectionReference,
  DocumentReference as ClientDocumentReference,
  collection as clientCollection,
  doc as clientDocument,
} from "firebase/firestore";\n\n`
  }

  return importStatements
}

export function generateFileSystemTree(
  dirPath: string,
  parents: Array<string> = []
) {
  const tree: Record<string, any> = {}
  const items = fs.readdirSync(dirPath)

  for (const item of items) {
    const fullPath = path.join(dirPath, item)
    const stats = fs.statSync(fullPath)

    if (stats.isDirectory()) {
      tree[item] = generateFileSystemTree(fullPath, [...parents, item])
    } else if (stats.isFile() && item === "schema.ts") {
      try {
        const content = fs.readFileSync(fullPath, "utf-8")
        const schemaMatch = content.match(/z\.object\(\{([^}]+)\}\)/)
        if (schemaMatch) {
          tree._schema = schemaMatch[1]
        }
      } catch (error) {
        console.warn(`Failed to read schema from ${fullPath}:`, error)
      }
    }
  }

  return tree
}

export function generateSchemaTree(systemTree: Record<string, any>): string {
  let schemaStr = "{"

  for (const [key, value] of Object.entries(systemTree)) {
    if (key === "_schema") {
      schemaStr += `_schema: z.object({${value}}),`
    } else {
      schemaStr += `${JSON.stringify(key)}: ${generateSchemaTree(value)},`
    }
  }

  schemaStr += "}"
  return schemaStr
}
export function generateConvertersTree(
  schemaName: string,
  tree: Record<string, any>,
  modes: Array<"admin" | "client">,
  parents: Array<string> = []
): string {
  let convertersStr = "{"

  for (const [key, value] of Object.entries(tree)) {
    if (key === "_schema") {
      const schemaPath = parents.join(".")
      if (modes.includes("admin")) {
        convertersStr += `"_adminConverter": (validate: boolean = false) => ({
          toFirestore(
            data: z.infer<typeof ${schemaName}${
          schemaPath ? "." + schemaPath : ""
        }._schema>
          ): AdminDocumentData {
            const parsed = validate
              ? ${schemaName}${
          schemaPath ? "." + schemaPath : ""
        }._schema.parse(data)
              : data
            return parsed as AdminDocumentData
          },
          fromFirestore(
            snapshot: AdminQueryDocumentSnapshot
          ): z.infer<typeof ${schemaName}${
          schemaPath ? "." + schemaPath : ""
        }._schema> {
            const data = snapshot.data()!
            const parsed = validate
              ? ${schemaName}${
          schemaPath ? "." + schemaPath : ""
        }._schema.parse(data)
              : data
            return parsed as z.infer<typeof ${schemaName}${
          schemaPath ? "." + schemaPath : ""
        }._schema>
          },
        }),`
      }
      if (modes.includes("client")) {
        convertersStr += `"_clientConverter": (validate: boolean = false) => ({
          toFirestore(
            data: z.infer<typeof ${schemaName}${
          schemaPath ? "." + schemaPath : ""
        }._schema>
          ): ClientDocumentData {
            const parsed = validate
              ? ${schemaName}${
          schemaPath ? "." + schemaPath : ""
        }._schema.parse(data)
              : data
            return parsed as ClientDocumentData
          },
          fromFirestore(
            snapshot: ClientQueryDocumentSnapshot,
            options: ClientSnapshotOptions
          ): z.infer<typeof ${schemaName}${
          schemaPath ? "." + schemaPath : ""
        }._schema> {
            const data = snapshot.data(options)!
            const parsed = validate
              ? ${schemaName}${
          schemaPath ? "." + schemaPath : ""
        }._schema.parse(data)
              : data
            return parsed as z.infer<typeof ${schemaName}${
          schemaPath ? "." + schemaPath : ""
        }._schema>
          },
        }),`
      }
    } else if (typeof value === "object") {
      convertersStr += `${JSON.stringify(key)}: ${generateConvertersTree(
        schemaName,
        value,
        modes,
        [...parents, key]
      )},`
    }
  }

  convertersStr += "}"
  return convertersStr
}

export function generateCreationFunction(
  tree: Record<string, any>,
  mode: "admin" | "client"
) {
  let creationFunction = `export function createFireType${
    mode === "admin" ? "Admin" : "Client"
  }(firestoreInstance: ${
    mode === "admin" ? "AdminFirestore" : "ClientFirestore"
  }) {
  return {`

  function processNode(
    node: Record<string, any>,
    currentPath: string[] = [],
    parentArgs: { [key: string]: string } = {}
  ): string {
    let result = ""

    for (const [key, value] of Object.entries(node)) {
      if (key === "_schema") continue

      const newPath = [...currentPath, key]
      const pathString = newPath.join("/")

      // Create args object for the current level
      const currentArgs = { ...parentArgs }
      if (currentPath.length > 0) {
        const parentKey = currentPath[currentPath.length - 1]
        currentArgs[`${parentKey}Id`] = ""
      }

      // Check if the folder has a schema file (i.e. _schema exists)
      if (value && typeof value === "object" && value._schema) {
        result += `
    ${key}: {${generateGetDocumentRef(pathString, mode, currentArgs)}
      ${generateGetCollectionRef(pathString, mode, currentArgs)}
      ${generateGetCollectionGroupRef(pathString, mode, currentArgs)}`

        // Recursively process subcollections if any
        result += processNode(value, newPath, currentArgs)

        result += `
    },`
      } else {
        // No schema file in this folder; return an empty object for this key.
        result += `
    ${key}: {},`
      }
    }

    return result
  }

  creationFunction += processNode(tree)
  creationFunction += `
  }
}`

  return creationFunction
}

function generateGetDocumentRef(
  path: string,
  mode: "admin" | "client",
  args?: { [key: string]: string }
): string {
  const argsString =
    args && Object.keys(args).length > 0
      ? `args: { ${Object.keys(args).join(": string; ")}: string }, `
      : ""

  // Split path into segments and insert args after each collection
  const pathSegments = path.split("/")
  const pathWithArgs = pathSegments
    .map((segment, i) => {
      if (i === 0) return segment // First segment is just the collection name
      const prevSegment = pathSegments[i - 1]
      return `\${args.${prevSegment}Id}/${segment}` // Insert arg after each collection
    })
    .join("/")

  if (mode === "admin") {
    return `
      getDocumentRef: (
        ${argsString}documentId: string,
        validate: boolean = false
      ): AdminDocumentReference<
        z.infer<typeof databaseSchema${getSchemaPath(path)}._schema>
      > => {
        const path = \`${pathWithArgs}\`
        const collectionRef = firestoreInstance
          .collection(path)
          .withConverter(databaseConverters${getSchemaPath(
            path
          )}._adminConverter(validate))
        return collectionRef.doc(documentId)
      },`
  } else {
    return `
      getDocumentRef: (
        ${argsString}documentId: string,
        validate: boolean = false
      ): ClientDocumentReference<
        z.infer<typeof databaseSchema${getSchemaPath(path)}._schema>
      > => {
        const path = \`${pathWithArgs}\`
        const collectionRef = clientCollection(
          firestoreInstance,
          path
        ).withConverter(databaseConverters${getSchemaPath(
          path
        )}._clientConverter(validate))
        return clientDocument(collectionRef, documentId)
      },`
  }
}

function generateGetCollectionRef(
  path: string,
  mode: "admin" | "client",
  args?: { [key: string]: string }
): string {
  const argsString =
    args && Object.keys(args).length > 0
      ? `args: { ${Object.keys(args).join(": string; ")}: string }, `
      : ""

  // Split path into segments and insert args after each collection
  const pathSegments = path.split("/")
  const pathWithArgs = pathSegments
    .map((segment, i) => {
      if (i === 0) return segment // First segment is just the collection name
      const prevSegment = pathSegments[i - 1]
      return `\${args.${prevSegment}Id}/${segment}` // Insert arg after each collection
    })
    .join("/")

  if (mode === "admin") {
    return `
      getCollectionRef: (
        ${argsString}validate: boolean = false
      ): AdminCollectionReference<
        z.infer<typeof databaseSchema${getSchemaPath(path)}._schema>
      > => {
        const path = \`${pathWithArgs}\`
        return firestoreInstance
          .collection(path)
          .withConverter(databaseConverters${getSchemaPath(
            path
          )}._adminConverter(validate))
      },`
  } else {
    return `
      getCollectionRef: (
        ${argsString}validate: boolean = false
      ): ClientCollectionReference<z.infer<typeof databaseSchema${getSchemaPath(
        path
      )}._schema>> => {
        const path = \`${pathWithArgs}\`
        return clientCollection(firestoreInstance, path).withConverter(
          databaseConverters${getSchemaPath(path)}._clientConverter(validate)
        )
      },`
  }
}

function generateGetCollectionGroupRef(
  path: string,
  mode: "admin" | "client",
  args?: { [key: string]: string }
): string {
  // Get the last segment of the path since collection group queries operate on the last collection
  const lastSegment = path.split("/").pop()

  if (mode === "admin") {
    return `
      getCollectionGroupRef: (
        validate: boolean = false
      ): AdminCollectionGroup<
        z.infer<typeof databaseSchema${getSchemaPath(path)}._schema>
      > => {
        const path = \`${lastSegment}\`
        return firestoreInstance
          .collectionGroup(path)
          .withConverter(databaseConverters${getSchemaPath(
            path
          )}._adminConverter(validate))
      },`
  } else {
    return `
      getCollectionGroupRef: (
        validate: boolean = false
      ): ClientQuery<z.infer<typeof databaseSchema${getSchemaPath(
        path
      )}._schema>> => {
        const path = \`${lastSegment}\`
        return clientCollectionGroup(firestoreInstance, path).withConverter(
          databaseConverters${getSchemaPath(path)}._clientConverter(validate)
        )
      },`
  }
}

function getSchemaPath(path: string): string {
  return path
    .split("/")
    .filter(segment => !segment.includes("${"))
    .map(segment => `.${segment}`)
    .join("")
}

import * as fs from "fs"
import * as path from "path"


export function createImportStatements(modes: Array<"admin" | "client">) {
  let importStatements = `import { z } from "zod";
import { firestoreRef } from "./references.js";\n`

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

        const match = content.match(
          /export\s+const\s+\w+\s*=\s*([\s\S]*)$/
        )
        if (match && match[1]) {
          tree["_schema"] = match[1].trim()
        } else {
          console.warn(`Could not find exported constant in ${fullPath}`)
        }
      } catch (error) {
        console.warn(`Failed to read schema from ${fullPath}:`, error)
      }
    }
  }

  return tree
}

/**
 * Converts a collection path to a schema path, handling dynamic segments.
 * Examples:
 * - "users" -> ".users"
 * - "users/posts" -> ".users.posts"
 * - "users/:userId/posts" -> ".users.posts" (strips dynamic segments)
 */
function convertCollectionPathToSchemaPath(collectionPath: string): string {
  // Split by '/' and filter out dynamic segments (starting with ':')
  const segments = collectionPath
    .split('/')
    .filter(segment => !segment.startsWith(':') && segment.length > 0);

  return segments.length > 0 ? '.' + segments.join('.') : '';
}

export function processSchemaReferences(
  schemaStr: string,
  modes: Array<"admin" | "client">
): string {
  // Replace firestoreRef("collectionPath") with appropriate DocumentReference type
  const refRegex = /firestoreRef\("([^"]+)"\)/g;
  const arrayRefRegex = /firestoreRef\("([^"]+)"\)\.array\(\)/g;

  // First handle array references
  schemaStr = schemaStr.replace(arrayRefRegex, (match, collectionPath) => {
    // Convert collection path to schema path, handling dynamic segments
    const schemaPath = convertCollectionPathToSchemaPath(collectionPath);

    if (modes.length === 1) {
      if (modes.includes("admin")) {
        return `z.array(z.custom<AdminDocumentReference<z.infer<typeof databaseSchema${schemaPath}._schema>>>())`;
      } else {
        return `z.array(z.custom<ClientDocumentReference<z.infer<typeof databaseSchema${schemaPath}._schema>>>())`;
      }
    } else {
      // When both modes are enabled, use a union type or fallback to any
      // This is a complex case - for now, use any since the converters handle the typing
      return `z.array(z.any())`;
    }
  });

  // Then handle single references
  schemaStr = schemaStr.replace(refRegex, (match, collectionPath) => {
    // Convert collection path to schema path, handling dynamic segments
    const schemaPath = convertCollectionPathToSchemaPath(collectionPath);

    if (modes.length === 1) {
      if (modes.includes("admin")) {
        return `z.custom<AdminDocumentReference<z.infer<typeof databaseSchema${schemaPath}._schema>>>()`;
      } else {
        return `z.custom<ClientDocumentReference<z.infer<typeof databaseSchema${schemaPath}._schema>>>()`;
      }
    } else {
      // When both modes are enabled, use a union type or fallback to any
      // This is a complex case - for now, use any since the converters handle the typing
      return `z.any()`;
    }
  });

  return schemaStr;
}

export function generateSchemaTree(systemTree: Record<string, any>): string {
  let schemaStr = ""

  for (const [key, value] of Object.entries(systemTree)) {
    if (key === "_schema") {
      schemaStr += `_schema: ${value},`
    } else {
      schemaStr += `${JSON.stringify(key)}: {${generateSchemaTree(value)}},`
    }
  }
  return schemaStr
}

export function generateCollectionPathsType(tree: Record<string, any>, parents: Array<string> = []): string[] {
  const paths: string[] = [];

  for (const [key, value] of Object.entries(tree)) {
    if (key === "_schema") {
      // This is a collection with a schema
      paths.push(parents.join("/"));
    } else if (typeof value === "object" && value !== null) {
      // This is a nested collection
      paths.push(...generateCollectionPathsType(value, [...parents, key]));
    }
  }

  return paths;
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
            data: z.infer<typeof ${schemaName}${schemaPath ? "." + schemaPath : ""
          }._schema>
          ): AdminDocumentData {
            const parsed = validate
              ? ${schemaName}${schemaPath ? "." + schemaPath : ""
          }._schema.parse(data)
              : data
            return parsed as AdminDocumentData
          },
          fromFirestore(
            snapshot: AdminQueryDocumentSnapshot
          ): z.infer<typeof ${schemaName}${schemaPath ? "." + schemaPath : ""
          }._schema> {
            const data = snapshot.data()!
            const parsed = validate
              ? ${schemaName}${schemaPath ? "." + schemaPath : ""
          }._schema.parse(data)
              : data
            return parsed as z.infer<typeof ${schemaName}${schemaPath ? "." + schemaPath : ""
          }._schema>
          },
        }),`
      }
      if (modes.includes("client")) {
        convertersStr += `"_clientConverter": (validate: boolean = false) => ({
          toFirestore(
            data: z.infer<typeof ${schemaName}${schemaPath ? "." + schemaPath : ""
          }._schema>
          ): ClientDocumentData {
            const parsed = validate
              ? ${schemaName}${schemaPath ? "." + schemaPath : ""
          }._schema.parse(data)
              : data
            return parsed as ClientDocumentData
          },
          fromFirestore(
            snapshot: ClientQueryDocumentSnapshot,
            options: ClientSnapshotOptions
          ): z.infer<typeof ${schemaName}${schemaPath ? "." + schemaPath : ""
          }._schema> {
            const data = snapshot.data(options)!
            const parsed = validate
              ? ${schemaName}${schemaPath ? "." + schemaPath : ""
          }._schema.parse(data)
              : data
            return parsed as z.infer<typeof ${schemaName}${schemaPath ? "." + schemaPath : ""
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
  let creationFunction = `export function createFireType${mode === "admin" ? "Admin" : "Client"
    }(firestoreInstance: ${mode === "admin" ? "AdminFirestore" : "ClientFirestore"
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

      if (value && typeof value === "object") {
        let nodeContent = ""
        if (value._schema) {
          nodeContent += `
      ${generateGetDocumentRef(pathString, mode, currentArgs)}
      ${generateGetCollectionRef(pathString, mode, currentArgs)}
      ${generateGetCollectionGroupRef(pathString, mode, currentArgs)}`
        }
        // Always check for subcollections even if there's no schema
        const subcollections = processNode(value, newPath, currentArgs)
        if (subcollections.trim()) {
          nodeContent += subcollections
        }
        result += `
    ${key}: {${nodeContent ? "\n" + nodeContent : ""}\n    },`
      } else {
        // For non-object values, simply return an empty object.
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

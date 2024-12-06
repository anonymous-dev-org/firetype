import * as fs from "fs"
import * as path from "path"

function generateDirectoryTree(dirPath: string, parents: Array<string> = []) {
  const tree: any = {}

  const items = fs.readdirSync(dirPath)

  for (const item of items) {
    if (item === "schema.ts") continue

    const fullPath = path.join(dirPath, item)
    const stats = fs.statSync(fullPath)

    if (stats.isDirectory()) {
      tree[item] = {}

      if (parents.length > 0) {
        tree[item]["_parents"] = parents
      }

      tree[item] = {
        ...tree[item],
        ...generateDirectoryTree(fullPath, [...parents, item]),
      }

      const schemaPathTS = path.join(fullPath, "schema.ts")

      if (fs.existsSync(schemaPathTS)) {
        try {
          const content = fs.readFileSync(schemaPathTS, "utf-8")
          const schemaMatch = content.match(/z\.object\(\{([^}]+)\}\)/)
          if (schemaMatch && tree[item] && typeof tree[item] === "object") {
            tree[item]["_doc"] = `z.object({${schemaMatch[1]}})`
          }
        } catch (error) {
          console.warn(`Failed to read schema from ${schemaPathTS}:`, error)
        }
      }
    } else {
      tree[item] = null
    }
  }

  return tree
}

function createGetCollectionRef(
  parents: Array<string>,
  indent: string,
  isAdmin: boolean
) {
  const argsPath = parents.slice(0, -1)
  const args = argsPath.map(p => `${p}Id: string`).join(", ")

  const pathParts = []
  for (let i = 0; i < argsPath.length; i++) {
    pathParts.push(parents[i])
    pathParts.push(`\${args.${argsPath[i]}Id}`)
  }
  pathParts.push(parents[parents.length - 1])
  const path = pathParts.join("/")

  return isAdmin
    ? `${indent}  getCollectionRef: (${
        argsPath.length > 0
          ? `args: {${args}}, validate: boolean`
          : "validate: boolean"
      }): AdminCollectionReference<z.infer<typeof this._doc>> => {
    const path = \`${path}\`
    return firestoreInstance.collection(path).withConverter(this._converter(validate))
  },`
    : `${indent}  getCollectionRef: (${
        argsPath.length > 0
          ? `args: {${args}}, validate: boolean`
          : "validate: boolean"
      }): ClientCollectionReference<z.infer<typeof this._doc>> => {
    const path = \`${path}\`
    return clientCollection(firestoreInstance, path).withConverter(this._converter(validate))
  },`
}

function generateConverter(indent: string, isAdmin: boolean) {
  return isAdmin
    ? `${indent}  _converter: (validate: boolean) => ({
    toFirestore(data: z.infer<typeof this._doc>): AdminDocumentData {
      const parsed = validate ? this._doc.parse(data) : data
      return parsed as AdminDocumentData
    },
    fromFirestore(
      snapshot: AdminQueryDocumentSnapshot
    ): z.infer<typeof this._doc> {
      const data = snapshot.data()!
      const parsed = validate ? this._doc.parse(data) : data
      return parsed as z.infer<typeof this._doc>
    },
  }),`
    : `${indent}  _converter: (validate: boolean) => ({
    toFirestore(data: z.infer<typeof this._doc>): ClientDocumentData {
      const parsed = validate ? this._doc.parse(data) : data
      return parsed as ClientDocumentData
    },
    fromFirestore(
      snapshot: ClientQueryDocumentSnapshot,
      options: ClientSnapshotOptions
    ): z.infer<typeof this._doc> {
      const data = snapshot.data(options)!
      const parsed = validate ? this._doc.parse(data) : data
      return parsed as z.infer<typeof this._doc>
    },
  }),`
}

function generateTypeScriptObject(
  tree: any,
  indent: string = "",
  parents: Array<string> = [],
  isAdmin: boolean = true
): string {
  const lines: string[] = ["{"]

  if (
    parents.length > 0 &&
    !parents.includes("_doc") &&
    !parents.includes("_parents") &&
    !parents.includes("_converter")
  ) {
    lines.push(createGetCollectionRef(parents, indent, isAdmin))
  }

  if (tree._doc) {
    lines.push(generateConverter(indent, isAdmin))
  }

  for (const [key, value] of Object.entries(tree)) {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`

    if (value === null) {
      lines.push(`${indent}  ${safeKey}: null,`)
    } else if (key === "_doc") {
      lines.push(`${indent}  ${safeKey}: ${value},`)
    } else if (key === "_parents") {
      lines.push(`${indent}  ${safeKey}: ${JSON.stringify(value)},`)
    } else if (key === "_converter") {
      continue
    } else {
      lines.push(
        `${indent}  ${safeKey}: ${generateTypeScriptObject(
          value,
          indent + "  ",
          [...parents, safeKey],
          isAdmin
        )}`
      )
    }
  }

  lines.push(`${indent}}${indent === "" ? "" : ","}`)
  return lines.join("\n")
}

// Example usage:
const tree = generateDirectoryTree("./firetype")
const tsObject = `import { z } from "zod";
import { 
  Firestore as AdminFirestore, 
  DocumentData as AdminDocumentData, 
  QueryDocumentSnapshot as AdminQueryDocumentSnapshot,
  CollectionReference as AdminCollectionReference 
} from "firebase-admin/firestore";
import { 
  Firestore as ClientFirestore, 
  SnapshotOptions as ClientSnapshotOptions, 
  QueryDocumentSnapshot as ClientQueryDocumentSnapshot, 
  DocumentData as ClientDocumentData,
  CollectionReference as ClientCollectionReference,
  collection as clientCollection 
} from "firebase/firestore";

export function createFireTypeAdmin(firestoreInstance: AdminFirestore) {
  return ${generateTypeScriptObject(tree, "", [], true)}
}

export function createFireTypeClient(firestoreInstance: ClientFirestore) {
  return ${generateTypeScriptObject(tree, "", [], false)}
}`

fs.writeFileSync("firetype.ts", tsObject)

generateDirectoryTree(path.join(process.cwd(), "firetype"))

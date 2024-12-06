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

function createGetCollectionRef(parents: Array<string>, indent: string) {
  const argsPath = parents.slice(0, -1)
  const args = argsPath.map(p => `${p}Id: string`).join(", ")

  const pathParts = []
  for (let i = 0; i < argsPath.length; i++) {
    pathParts.push(parents[i])
    pathParts.push(`\${args.${argsPath[i]}Id}`)
  }
  pathParts.push(parents[parents.length - 1])
  const path = pathParts.join("/")

  return `${indent}  getCollectionRef: (${
    argsPath.length > 0 ? `args: {${args}}` : ""
  }) => {
    const path = \`${path}\`
    return path
  },`
}

function generateTypeScriptObject(
  tree: any,
  indent: string = "",
  parents: Array<string> = []
): string {
  const lines: string[] = ["{"]

  if (
    parents.length > 0 &&
    !parents.includes("_doc") &&
    !parents.includes("_parents")
  ) {
    lines.push(createGetCollectionRef(parents, indent))
  }

  for (const [key, value] of Object.entries(tree)) {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`

    if (value === null) {
      lines.push(`${indent}  ${safeKey}: null,`)
    } else if (key === "_doc") {
      lines.push(`${indent}  ${safeKey}: ${value},`)
    } else if (key === "_parents") {
      lines.push(`${indent}  ${safeKey}: ${JSON.stringify(value)},`)
    } else {
      lines.push(
        `${indent}  ${safeKey}: ${generateTypeScriptObject(
          value,
          indent + "  ",
          [...parents, safeKey]
        )}`
      )
    }
  }

  lines.push(`${indent}}${indent === "" ? "" : ","}`)
  return lines.join("\n")
}

// Example usage:
const tree = generateDirectoryTree("./firetype")
const tsObject = `import { z } from "zod";\n\nconst firetype = ${generateTypeScriptObject(
  tree
)} as const;\n\nexport { firetype }`
fs.writeFileSync("firetype.ts", tsObject)

export { generateDirectoryTree }

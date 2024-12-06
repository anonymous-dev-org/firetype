import * as fs from "fs"
import * as path from "path"

interface DirectoryTree {
  [key: string]: DirectoryTree | null
}

function generateDirectoryTree(dirPath: string): DirectoryTree {
  const tree: DirectoryTree = {}

  const items = fs.readdirSync(dirPath)

  for (const item of items) {
    const fullPath = path.join(dirPath, item)
    const stats = fs.statSync(fullPath)

    if (stats.isDirectory()) {
      tree[item] = generateDirectoryTree(fullPath)
    } else {
      tree[item] = null
    }
  }

  return tree
}

function generateTypeScriptObject(
  tree: DirectoryTree,
  indent: string = "",
  parentPath: string[] = []
): string {
  const lines: string[] = ["{"]

  if (parentPath.length > 0) {
    const argsPath = parentPath.slice(0, -1)
    const args = argsPath.map(p => `${p}: string`).join(", ")
    lines.push(
      `${indent}  getCollectionRef: (${
        argsPath.length > 0 ? `args: {${args}}` : ""
      }) => string,`
    )
  }

  for (const [key, value] of Object.entries(tree)) {
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`

    if (value === null) {
      lines.push(`${indent}  ${safeKey}: null,`)
    } else {
      lines.push(
        `${indent}  ${safeKey}: ${generateTypeScriptObject(
          value,
          indent + "  ",
          [...parentPath, safeKey]
        )}`
      )
    }
  }

  lines.push(`${indent}}${indent === "" ? "" : ","}`)
  return lines.join("\n")
}

// Example usage:
const tree = generateDirectoryTree("./firetype")
const tsObject = `const firetype = ${generateTypeScriptObject(
  tree
)} as const;\n\nexport { firetype }`
fs.writeFileSync("firetype.ts", tsObject)

export { generateDirectoryTree, DirectoryTree }

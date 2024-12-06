import * as fs from "fs"
import * as path from "path"
import { generateDirectoryTree, generateTypeScriptObject } from "./script"

export function generateFiretypeFile(
  firetypePath: string,
  outputPath?: string,
  mode?: "admin" | "client"
): string {
  // Read the first directory in the firetype folder
  const firstDir = fs
    .readdirSync(firetypePath)
    .map(name => path.join(firetypePath, name))
    .filter(filePath => fs.statSync(filePath).isDirectory())[0]

  if (!firstDir) {
    throw new Error("No directories found in the firetype folder")
  }

  // Generate tree starting from the first directory
  const tree = generateDirectoryTree(firstDir)

  let tsObject = `import { z } from "zod";\n`

  // Add imports based on mode
  if (!mode || mode === "admin") {
    tsObject += `import { 
  Firestore as AdminFirestore, 
  DocumentData as AdminDocumentData, 
  QueryDocumentSnapshot as AdminQueryDocumentSnapshot,
  CollectionReference as AdminCollectionReference,
  CollectionGroup as AdminCollectionGroup,
  DocumentReference as AdminDocumentReference,
} from "firebase-admin/firestore";\n`
  }

  if (!mode || mode === "client") {
    tsObject += `import { 
  Firestore as ClientFirestore, 
  SnapshotOptions as ClientSnapshotOptions, 
  QueryDocumentSnapshot as ClientQueryDocumentSnapshot, 
  DocumentData as ClientDocumentData,
  collectionGroup as clientCollectionGroup,
  Query as ClientQuery,
  DocumentReference as ClientDocumentReference,
  collection as clientCollection,
  doc as clientDocument,
} from "firebase/firestore";\n\n`
  }

  // Add type definitions based on mode
  if (!mode || mode === "admin") {
    tsObject += `export function createFireTypeAdmin(firestoreInstance: AdminFirestore) {
  return ${generateTypeScriptObject(tree, "", [], true)}
}\n\n`
  }

  if (!mode || mode === "client") {
    tsObject += `export function createFireTypeClient(firestoreInstance: ClientFirestore) {
  return ${generateTypeScriptObject(tree, "", [], false)}
}`
  }

  // Use the firetype directory as the target location if no outputPath is provided
  const targetPath = outputPath || path.join(firetypePath, "firetype.ts")
  const targetDir = path.dirname(targetPath)

  // Ensure the output directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  fs.writeFileSync(targetPath, tsObject)
  return targetPath
}

# 🔥 Firetype

Firetype is a lightweight wrapper around the Firestore SDK that adds type safety and schema validation to your Firestore database operations in TypeScript. It extends the existing Firestore SDK functionality while maintaining all its native features and requiring the original SDK to be installed.

## Features

- 🎯 **Type-Safe SDK Extension**: Adds TypeScript type inference to your existing Firestore SDK operations
- 🔄 **Schema Validation**: Integrates Zod for optional runtime data validation
- 🛠️ **CLI Tool**: Generates type definitions from your schema definitions
- ⚡ **SDK Compatibility**: Seamlessly works with both `firebase-admin` and `firebase/firestore` SDKs
- 📁 **Collection Structure Support**: Maintains support for nested collections

> ⚠️ **Note**: Firetype extends the Firestore SDK and is not a replacement. You'll still need to install and use either `firebase-admin` or `firebase/firestore` as your primary SDK. Firetype simply adds type safety and schema validation on top of these SDKs.

## Installation

```bash
npm install firetype
# or
yarn add firetype
```

## Quick Start

1. Create a `firetype` directory in your project:

```bash
mkdir -p firetype
```

2. Create a folder for each database you have (or just one folder if you huse only the default one)

```bash
mkdir -p firetype/database
```

3. Define your schema using Zod (e.g., `firetype/users/schema.ts`):

```typescript
import { z } from "zod"
export const schema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
  createdAt: z.date(),
})
```

4. Generate the type definitions:

```bash
firetype generate
```

5. Use the generated types in your code:

```typescript
// Admin SDK usage
import { createFireTypeAdmin } from "./firetype/firetype"
import { getFirestore } from "firebase-admin/firestore"

const db = getFirestore()
const firetype = createFireTypeAdmin(db)

// Type-safe operations
const user = await firetype.users.getCollection()
const allUsers = await user.get()

// Client SDK usage
import { createFireTypeClient } from "./firetype/firetype"
import { getFirestore, getDoc } from "firebase/firestore"

const db = getFirestore()
const firetype = createFireTypeClient(db)

// Type-safe operations
const userRef = firetype.users.getDocumentRef("user123")
const snapshot = await getDoc(userRef)
```

## CLI Commands

```bash
# Generate types for both admin and client
firetype generate

# Generate types only for admin SDK
firetype generate admin

# Generate types only for client SDK
firetype generate client

# Specify custom output directory
firetype generate --output=./types

# Show help
firetype help
```

## Schema Definition

Firetype uses Zod schemas to define your collection structure. Here's how to organize your schemas:

### Basic Collection

```typescript
// firetype/users/schema.ts
import { z } from "zod"
export const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  metadata: z.object({
    lastLogin: z.date().optional(),
    isVerified: z.boolean(),
  }),
})
```

### Nested Collections

```typescript
// firetype/users/posts/schema.ts
export const schema = z.object({
  title: z.string(),
  content: z.string(),
  publishedAt: z.date(),
  tags: z.array(z.string()),
})

// firetype/users/settings/schema.ts
export const schema = z.object({
  theme: z.enum(["light", "dark"]),
  notifications: z.boolean(),
  preferences: z.record(z.string()),
})
```

## Type Safety Features

Firetype provides complete type safety for:

- 📝 Document data validation and typing
- 🔍 Query operations with type-checked fields
- 🎯 Field references with autocomplete
- 📚 Collection references
- 📄 Document references
- 🔎 Collection group queries

## Error Handling

Firetype includes runtime validation of your data, which means:

- Invalid data will be caught before it reaches Firestore
- Type errors are caught during development
- Runtime errors provide clear, actionable messages

## Best Practices

1. Keep your schema files in the `firetype` directory
2. Use descriptive names for your collections
3. Generate types before building your application
4. Commit generated types to version control
5. Use separate schemas for nested collections

## Requirements

- Node.js 14 or later
- TypeScript 4.5 or later
- Firebase 9.x or later / Firebase Admin 10.x or later

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Support

If you find a bug or want to request a new feature, please open an issue on GitHub.

---

Made with ❤️ by the Firetype team

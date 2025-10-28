# 🔥 Firetype

[![npm version](https://badge.fury.io/js/%40anonymous-dev%2Ffiretype.svg)](https://badge.fury.io/js/%40anonymous-dev%2Ffiretype)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Typesafe ODM for Firestore** - A lightweight wrapper that adds type safety and schema validation to your Firestore database operations in TypeScript.

Firetype extends the existing Firestore SDK functionality while maintaining all its native features and requiring the original SDK to be installed. It provides a folder-based schema definition system that automatically generates fully type-safe APIs for your Firestore collections and documents.

## ✨ Features

- 🎯 **Full Type Safety**: Complete TypeScript type inference for all Firestore operations with zero runtime overhead
- 📁 **Folder-Based Schema**: Organize your database structure naturally in directories, including nested collections
- 🔄 **Runtime Validation**: Optional Zod-powered schema validation with detailed error messages
- 🛠️ **Powerful CLI**: Generate type definitions with flexible configuration options
- ⚡ **SDK Agnostic**: Works seamlessly with both `firebase-admin` and `firebase/firestore` SDKs
- 🔗 **Nested Collections**: Full support for subcollections with automatic path generation
- 📊 **Collection Groups**: Type-safe collection group queries across all subcollections
- 🎨 **Zero Config**: Just define your schemas and let Firetype handle the rest

> ⚠️ **Important**: Firetype extends the Firestore SDK and is not a replacement. You'll still need to install and use either `firebase-admin` or `firebase/firestore` as your primary SDK.

## 📦 Installation

Install Firetype using your preferred package manager:

```bash
# npm
npm install @anonymous-dev/firetype

# yarn
yarn add @anonymous-dev/firetype

# pnpm
pnpm add @anonymous-dev/firetype

# bun
bun add @anonymous-dev/firetype
```

### Peer Dependencies

Firetype requires one of the following Firestore SDKs (choose based on your environment):

```bash
# For server-side applications (Node.js, Cloud Functions, etc.)
npm install firebase-admin

# For client-side applications (browsers, React Native, etc.)
npm install firebase
```

> 💡 **Tip**: Firetype works with both SDKs simultaneously if you need to support both client and server environments.

## 🚀 Quick Start

Get started with Firetype in 5 minutes. This guide shows you how to set up type-safe Firestore operations.

### 1. Set up your schema directory

Create a directory structure for your Firestore database schemas:

```bash
mkdir -p schemas/database
```

### 2. Define your first collection schema

Create `schemas/database/users/schema.ts`:

```typescript
import { z } from "zod"

export const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  age: z.number().int().positive().optional(),
  createdAt: z.date(),
  metadata: z.object({
    lastLogin: z.date().optional(),
    isVerified: z.boolean().default(false),
    preferences: z.record(z.string()).optional(),
  }),
})
```

### 3. Generate type definitions

Use the Firetype CLI to generate your types:

```bash
# Generate types for both admin and client SDKs
npx @anonymous-dev/firetype generate --input=./schemas/database --output=./types

# Or specify a single SDK
npx @anonymous-dev/firetype generate --mode=admin --input=./schemas --output=./types
```

This creates a `types/index.ts` file with your fully typed Firestore API.

### 4. Use in your application

#### Server-side (Admin SDK)

```typescript
import { createFireTypeAdmin } from "./types"
import { getFirestore } from "firebase-admin/firestore"

const db = getFirestore()
const firetype = createFireTypeAdmin(db)

// Type-safe collection operations
const usersCollection = firetype.users.getCollectionRef()
const allUsers = await usersCollection.get()

// Type-safe document operations
const userDoc = firetype.users.getDocumentRef("user123")
const userSnapshot = await userDoc.get()
const userData = userSnapshot.data() // Fully typed!

// Add new user with validation
await usersCollection.add({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  createdAt: new Date(),
  metadata: {
    isVerified: false,
    preferences: { theme: "dark" },
  },
})
```

#### Client-side (Web SDK)

```typescript
import { createFireTypeClient } from "./types"
import { getFirestore, getDocs } from "firebase/firestore"

const db = getFirestore()
const firetype = createFireTypeClient(db)

// Type-safe operations
const usersRef = firetype.users.getCollectionRef()
const usersSnapshot = await getDocs(usersRef)

usersSnapshot.forEach(doc => {
  const user = doc.data() // Fully typed user object
  console.log(`${user.name}: ${user.email}`)
})
```

### 5. Add subcollections (Optional)

Create nested collections by adding subdirectories. For user comments:

`schemas/database/users/comments/schema.ts`:

```typescript
import { z } from "zod"

export const schema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  authorId: z.string(),
  createdAt: z.date(),
  likes: z.number().default(0),
})
```

Now you can access nested collections:

```typescript
// Get comments for a specific user
const userComments = firetype.users.comments.getCollectionRef({
  usersId: "user123",
})

const comments = await userComments.get()
```

## 🛠️ CLI Reference

Firetype provides a powerful CLI tool for generating type definitions from your schema files.

### Generate Command

Generate TypeScript types from your Firestore schema definitions.

```bash
npx @anonymous-dev/firetype generate [options]
```

#### Options

| Option            | Description                                             | Required | Default |
| ----------------- | ------------------------------------------------------- | -------- | ------- |
| `--input=<path>`  | Directory containing your schema definitions            | Yes      | -       |
| `--output=<path>` | Directory where generated types will be saved           | Yes      | -       |
| `--mode=<mode>`   | SDK mode: `admin`, `client`, or omit for both           | No       | both    |
| `--path=<path>`   | Shorthand to set both input and output to the same path | No       | -       |

#### Examples

```bash
# Generate types for both SDKs
npx @anonymous-dev/firetype generate --input=./schemas --output=./types

# Generate only admin SDK types
npx @anonymous-dev/firetype generate --mode=admin --input=./schemas --output=./types

# Generate only client SDK types
npx @anonymous-dev/firetype generate --mode=client --input=./src/database --output=./lib/types

# Use shorthand for same input/output directory
npx @anonymous-dev/firetype generate --path=./firestore

# Organize schemas in subdirectories
npx @anonymous-dev/firetype generate --input=./src/schemas/firestore --output=./src/types
```

### Help Command

Display help information for all available commands.

```bash
npx @anonymous-dev/firetype help
```

### Generated Files

The CLI generates an `index.ts` file in your output directory containing:

- **Schema definitions**: Zod schemas compiled from your directory structure
- **Converters**: Type-safe Firestore converters with optional validation
- **API functions**: `createFireTypeAdmin()` and/or `createFireTypeClient()` functions

#### File Structure Example

```
types/
└── index.ts          # Generated types and API functions
```

> 📝 **Note**: Always regenerate types after modifying your schemas. The generated file includes import statements for the required Firestore SDKs based on your `--mode` selection.

## 📋 Schema Definition

Firetype uses Zod schemas to define your Firestore collection and document structures. Organize your schemas in a directory structure that mirrors your Firestore database hierarchy.

### Directory Structure

```
schemas/
└── database/
    ├── users/
    │   ├── schema.ts          # /users collection
    │   └── posts/
    │       └── schema.ts      # /users/{userId}/posts subcollection
    ├── posts/
    │   └── schema.ts          # /posts collection
    └── comments/
        └── schema.ts          # /comments collection
```

### Basic Collection Schema

Each schema file must export a `schema` constant using Zod:

```typescript
// schemas/database/users/schema.ts
import { z } from "zod"

export const schema = z.object({
  // Required fields
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),

  // Optional fields
  age: z.number().int().positive().optional(),
  bio: z.string().max(500).optional(),

  // Nested objects
  metadata: z.object({
    lastLogin: z.date().optional(),
    isVerified: z.boolean().default(false),
    role: z.enum(["user", "admin", "moderator"]).default("user"),
  }),

  // Arrays
  interests: z.array(z.string()).default([]),

  // Complex types
  preferences: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .optional(),

  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
})
```

### Subcollection Schema

Define subcollections by creating nested directories:

```typescript
// schemas/database/users/posts/schema.ts
import { z } from "zod"

export const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(200).optional(),
  published: z.boolean().default(false),
  publishedAt: z.date().optional(),
  tags: z.array(z.string()).default([]),
  likes: z.number().int().default(0),
  authorId: z.string(), // Reference to parent document
  createdAt: z.date(),
  updatedAt: z.date(),
})
```

### Advanced Schema Patterns

#### Union Types (Polymorphism)

```typescript
// schemas/database/notifications/schema.ts
import { z } from "zod"

const baseNotification = z.object({
  id: z.string(),
  userId: z.string(),
  read: z.boolean().default(false),
  createdAt: z.date(),
})

export const schema = z.discriminatedUnion("type", [
  baseNotification.extend({
    type: z.literal("friend_request"),
    fromUserId: z.string(),
    message: z.string(),
  }),
  baseNotification.extend({
    type: z.literal("post_like"),
    postId: z.string(),
    likerId: z.string(),
  }),
  baseNotification.extend({
    type: z.literal("comment_reply"),
    commentId: z.string(),
    postId: z.string(),
    replierId: z.string(),
  }),
])
```

#### Complex Validation

```typescript
// schemas/database/products/schema.ts
import { z } from "zod"

export const schema = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000),
    price: z.number().positive(),
    currency: z.enum(["USD", "EUR", "GBP"]).default("USD"),

    // Conditional validation
    salePrice: z.number().positive().optional(),
    onSale: z.boolean().default(false),

    // Custom validation
    inventory: z.object({
      quantity: z.number().int().min(0),
      lowStockThreshold: z.number().int().min(1).default(10),
      sku: z.string().regex(/^[A-Z0-9]{8,12}$/, "Invalid SKU format"),
    }),

    // Geopoint (use object for Firestore GeoPoint)
    location: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .optional(),

    categories: z.array(z.string()).min(1, "At least one category required"),
    tags: z.array(z.string()).default([]),

    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine(
    data => !data.onSale || (data.salePrice && data.salePrice < data.price),
    {
      message: "Sale price must be less than regular price when on sale",
      path: ["salePrice"],
    }
  )
```

### Schema Best Practices

- **Use descriptive names**: Choose clear, descriptive names for your collections and fields
- **Add validation**: Leverage Zod's validation features to ensure data integrity
- **Use enums**: For fields with a fixed set of values, use `z.enum()` instead of strings
- **Default values**: Provide sensible defaults for optional fields
- **Type references**: Use TypeScript types when referencing other document IDs
- **Custom validation**: Add business logic validation using Zod's `.refine()` method
- **Keep it DRY**: Extract common schema parts into reusable constants

> 💡 **Pro Tip**: Your Zod schemas serve as both runtime validators and TypeScript type generators. Well-crafted schemas provide excellent developer experience and data integrity.

## 🔧 API Reference

Firetype generates fully typed APIs that mirror your Firestore database structure. Here's a comprehensive reference of the generated functions and types.

### Generated Functions

#### `createFireTypeAdmin(firestoreInstance)`

Creates a type-safe Firestore API for server-side operations using the Firebase Admin SDK.

**Parameters:**

- `firestoreInstance`: Firebase Admin Firestore instance

**Returns:** Type-safe API object matching your schema structure

#### `createFireTypeClient(firestoreInstance)`

Creates a type-safe Firestore API for client-side operations using the Firebase Web SDK.

**Parameters:**

- `firestoreInstance`: Firebase Client Firestore instance

**Returns:** Type-safe API object matching your schema structure

### API Structure

The generated API mirrors your directory structure. For this schema structure:

```
schemas/database/
├── users/
│   ├── schema.ts
│   └── posts/
│       └── schema.ts
└── posts/
    └── schema.ts
```

You get this typed API:

```typescript
const firetype = createFireTypeAdmin(db)

firetype.users // /users collection API
firetype.users.posts // /users/{userId}/posts subcollection API
firetype.posts // /posts collection API
```

### Collection API Methods

#### `getCollectionRef(validate?: boolean)`

Returns a typed Firestore collection reference.

**Parameters:**

- `validate` (boolean, optional): Enable runtime validation (default: false)

**Returns:**

- Admin: `AdminCollectionReference<T>`
- Client: `ClientCollectionReference<T>`

**Example:**

```typescript
const usersRef = firetype.users.getCollectionRef(true) // With validation
const usersRef = firetype.users.getCollectionRef() // Without validation
```

#### `getDocumentRef(documentId, validate?: boolean)`

Returns a typed Firestore document reference.

**Parameters:**

- `documentId` (string): The document ID
- `validate` (boolean, optional): Enable runtime validation (default: false)

**Returns:**

- Admin: `AdminDocumentReference<T>`
- Client: `ClientDocumentReference<T>`

**Example:**

```typescript
const userDoc = firetype.users.getDocumentRef("user123", true)
```

#### `getCollectionGroupRef(validate?: boolean)`

Returns a typed collection group reference for querying across all subcollections.

**Parameters:**

- `validate` (boolean, optional): Enable runtime validation (default: false)

**Returns:**

- Admin: `AdminCollectionGroup<T>`
- Client: `ClientQuery<T>`

**Example:**

```typescript
// Query all posts across all users
const allPosts = firetype.users.posts.getCollectionGroupRef()
const recentPosts = await allPosts
  .where("published", "==", true)
  .orderBy("createdAt", "desc")
  .limit(10)
  .get()
```

### Subcollection API Methods

For subcollections, the API methods require parent document IDs:

#### `getCollectionRef(args, validate?: boolean)`

**Parameters:**

- `args`: Object containing parent document IDs (e.g., `{ usersId: "user123" }`)
- `validate` (boolean, optional): Enable runtime validation (default: false)

**Example:**

```typescript
// Get posts for a specific user
const userPostsRef = firetype.users.posts.getCollectionRef({
  usersId: "user123",
})
```

#### `getDocumentRef(args, documentId, validate?: boolean)`

**Parameters:**

- `args`: Object containing parent document IDs
- `documentId` (string): The document ID
- `validate` (boolean, optional): Enable runtime validation (default: false)

**Example:**

```typescript
// Get a specific post from a user
const userPostDoc = firetype.users.posts.getDocumentRef(
  { usersId: "user123" },
  "post456"
)
```

### Validation

Firetype supports optional runtime validation using your Zod schemas:

```typescript
// Enable validation for all operations
const firetype = createFireTypeAdmin(db)

// Collection operations with validation
const usersRef = firetype.users.getCollectionRef(true)

// Document operations with validation
const userDoc = firetype.users.getDocumentRef("user123", true)

// Invalid data will throw Zod validation errors
await usersRef.add({
  name: "", // ❌ Fails validation (empty string)
  email: "invalid", // ❌ Fails validation (not email)
  createdAt: new Date(),
})
```

### Type Safety

All generated APIs are fully type-safe:

```typescript
// TypeScript knows the exact shape of your data
const user = await userDoc.get()
const userData = user.data()
// userData is typed as your User schema type

// Autocomplete and type checking for all fields
userData.name // string
userData.email // string
userData.age // number | undefined
userData.metadata // { lastLogin?: Date; isVerified: boolean; ... }
```

### Error Handling

Firetype throws descriptive errors for common issues:

- **Validation errors**: Zod validation errors when validation is enabled
- **Schema errors**: Issues with your schema definitions
- **Firestore errors**: Standard Firestore SDK errors are passed through

```typescript
try {
  await usersRef.add(invalidUserData)
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log("Validation failed:", error.errors)
  } else {
    console.log("Firestore error:", error)
  }
}
```

## ⚡ Requirements

### Runtime Requirements

- **Node.js**: 18.0.0 or later
- **TypeScript**: 5.0.0 or later
- **Zod**: 3.x (automatically installed as dependency)

### Firebase SDK Compatibility

Choose one or both based on your environment:

- **Firebase Admin SDK**: 13.5.0 or later (for server-side operations)
- **Firebase Client SDK**: 12.4.0 or later (for client-side operations)

### Development Requirements

- **Node.js**: 18.0.0 or later (for building and CLI)
- **TypeScript**: 5.7.0 or later (for type checking)

### Package Manager Support

Firetype works with all major package managers:

- **npm**: 7.0.0 or later
- **yarn**: 1.22.0 or later
- **pnpm**: 6.0.0 or later
- **bun**: 1.0.0 or later

## 🔍 Troubleshooting

### Common Issues

#### "Cannot find module" errors

**Problem**: TypeScript can't find the generated types.

**Solution**: Make sure you've generated types before importing them:

```bash
npx @anonymous-dev/firetype generate --input=./schemas --output=./types
```

#### Schema validation errors

**Problem**: Your schema files aren't being recognized.

**Solutions**:

- Ensure schema files export a `schema` constant: `export const schema = z.object({...})`
- Check that schema files are named exactly `schema.ts`
- Verify the directory structure matches your Firestore collections

#### CLI not found

**Problem**: `firetype` command not recognized.

**Solutions**:

- Use `npx @anonymous-dev/firetype` instead of `firetype`
- Check that the package is installed: `npm list @anonymous-dev/firetype`
- For local installation, ensure your `PATH` includes node_modules/.bin

#### Type errors in generated code

**Problem**: TypeScript errors in the generated index.ts file.

**Solutions**:

- Update to the latest version: `npm update @anonymous-dev/firetype`
- Regenerate types after schema changes
- Check that your Zod schemas are valid

#### Validation not working

**Problem**: Runtime validation isn't catching invalid data.

**Solution**: Enable validation explicitly:

```typescript
// Enable validation
const collectionRef = firetype.users.getCollectionRef(true)
const documentRef = firetype.users.getDocumentRef("id", true)
```

#### Import errors

**Problem**: Can't import from the generated types.

**Solutions**:

- Check the output path in your generation command
- Ensure the generated file exists: `ls types/index.ts`
- Use correct relative imports: `import { createFireTypeAdmin } from "../types"`

### Getting Help

If you encounter issues not covered here:

1. **Check the GitHub Issues**: Search for similar problems
2. **Create a minimal reproduction**: Isolate the issue in a small project
3. **Include your environment**: Node version, TypeScript version, package manager
4. **Share your schema structure**: Anonymized directory structure and schema examples

### Debug Mode

Enable verbose logging by setting the environment variable:

```bash
DEBUG=firetype npx @anonymous-dev/firetype generate --input=./schemas --output=./types
```

## 📈 Changelog

### [1.0.1] - 2025-01-XX

#### Added

- Comprehensive test suite with 48 tests covering all functionality
- CLI help command for better developer experience
- Improved error messages and validation feedback

#### Fixed

- CLI argument parsing edge cases
- Type generation for complex nested schemas
- Import statement generation for different SDK modes

### [1.0.0] - 2025-01-XX

#### Added

- Initial release of Firetype
- Full TypeScript type safety for Firestore operations
- Folder-based schema definition system
- CLI tool for type generation
- Support for both Firebase Admin and Client SDKs
- Runtime validation with Zod integration
- Nested collections support
- Collection group queries
- Comprehensive API reference

#### Features

- Zero-runtime overhead type safety
- Automatic path generation for nested collections
- Optional runtime data validation
- Compatible with existing Firestore codebases

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/firetype.git
   cd firetype
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Start development**

   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   npm run test:coverage
   ```

### Contributing Guidelines

1. **Code Style**: Follow the existing TypeScript and ESLint configuration
2. **Testing**: Add tests for new features and bug fixes
3. **Documentation**: Update README and API docs for changes
4. **Commits**: Use conventional commit messages (see below)

### Commit Convention

This project follows [Conventional Commits](https://conventionalcommits.org/):

```bash
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:

```bash
feat: add support for union types in schemas
fix(cli): handle missing input directory gracefully
docs: update API reference for collection group queries
```

## 📄 License

**MIT License**

Copyright (c) 2025 Anonymous Dev

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## 💬 Support & Community

### Getting Help

- **📖 Documentation**: Check this README and the API reference
- **🐛 Bug Reports**: [Open an issue](https://github.com/anonymous-dev/firetype/issues) on GitHub
- **💡 Feature Requests**: [Start a discussion](https://github.com/anonymous-dev/firetype/discussions) on GitHub
- **💬 Questions**: Use GitHub Discussions for general questions

### Issue Guidelines

When reporting bugs, please include:

- **Version**: Firetype version and relevant dependency versions
- **Environment**: Node.js version, TypeScript version, OS
- **Steps to reproduce**: Minimal code example that reproduces the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened

### Security

If you discover a security vulnerability, please email security@anonymous.dev instead of creating a public issue.

## 🙏 Acknowledgments

- **Firebase**: For providing the excellent Firestore database
- **Zod**: For the powerful schema validation library
- **TypeScript**: For bringing type safety to JavaScript
- **The Open Source Community**: For inspiration and contributions

---

<p align="center">
  <strong>Made with ❤️ by the Firetype team</strong><br>
  <a href="https://github.com/anonymous-dev/firetype">GitHub</a> •
  <a href="https://www.npmjs.com/package/@anonymous-dev/firetype">npm</a> •
  <a href="https://github.com/anonymous-dev/firetype/discussions">Discussions</a>
</p>

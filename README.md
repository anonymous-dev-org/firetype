# 🔥 Firetype

Full documentation: [Firetype docs](https://docs.anonymous.dev/packages/firetype)

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

## 📚 Documentation

- Visit the full documentation at [docs.anonymous.dev/packages/firetype](https://docs.anonymous.dev/packages/firetype)

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
  <a href="https://docs.anonymous.dev/packages/firetype">Docs</a> •
  <a href="https://github.com/anonymous-dev/firetype/discussions">Discussions</a>
</p>

import { z } from "zod"
import {
  Firestore as AdminFirestore,
  DocumentData as AdminDocumentData,
  QueryDocumentSnapshot as AdminQueryDocumentSnapshot,
  CollectionReference as AdminCollectionReference,
  CollectionGroup as AdminCollectionGroup,
  DocumentReference as AdminDocumentReference,
} from "firebase-admin/firestore"
import {
  Firestore as ClientFirestore,
  SnapshotOptions as ClientSnapshotOptions,
  QueryDocumentSnapshot as ClientQueryDocumentSnapshot,
  DocumentData as ClientDocumentData,
  collectionGroup as clientCollectionGroup,
  Query as ClientQuery,
  DocumentReference as ClientDocumentReference,
  collection as clientCollection,
  doc as clientDocument,
} from "firebase/firestore"

export function createFireTypeAdmin(firestoreInstance: AdminFirestore) {
  return {
    people: {
      getCollectionRef: (
        validate: boolean = false
      ): AdminCollectionReference<z.infer<typeof this._doc>> => {
        const path = `people`
        return firestoreInstance
          .collection(path)
          .withConverter(this._converter(validate))
      },
      getCollectionGroupRef: (
        validate: boolean = false
      ): AdminCollectionGroup<z.infer<typeof this._doc>> => {
        const path = `people`
        return firestoreInstance
          .collectionGroup(path)
          .withConverter(this._converter(validate))
      },
      getDocumentRef: (
        documentId: string,
        validate: boolean = false
      ): AdminDocumentReference<z.infer<typeof this._doc>> => {
        const collectionRef = this.getCollectionRef(validate)
        return collectionRef.doc(documentId)
      },
      _converter: (validate: boolean) => ({
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
      }),
      _doc: z.object({
        name: z.string(),
        lastName: z.string(),
      }),
    },
    users: {
      getCollectionRef: (
        validate: boolean = false
      ): AdminCollectionReference<z.infer<typeof this._doc>> => {
        const path = `users`
        return firestoreInstance
          .collection(path)
          .withConverter(this._converter(validate))
      },
      getCollectionGroupRef: (
        validate: boolean = false
      ): AdminCollectionGroup<z.infer<typeof this._doc>> => {
        const path = `users`
        return firestoreInstance
          .collectionGroup(path)
          .withConverter(this._converter(validate))
      },
      getDocumentRef: (
        documentId: string,
        validate: boolean = false
      ): AdminDocumentReference<z.infer<typeof this._doc>> => {
        const collectionRef = this.getCollectionRef(validate)
        return collectionRef.doc(documentId)
      },
      _converter: (validate: boolean) => ({
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
      }),
      settings: {
        getCollectionRef: (
          args: { usersId: string },
          validate: boolean = false
        ): AdminCollectionReference<z.infer<typeof this._doc>> => {
          const path = `users/${args.usersId}/settings`
          return firestoreInstance
            .collection(path)
            .withConverter(this._converter(validate))
        },
        getCollectionGroupRef: (
          validate: boolean = false
        ): AdminCollectionGroup<z.infer<typeof this._doc>> => {
          const path = `settings`
          return firestoreInstance
            .collectionGroup(path)
            .withConverter(this._converter(validate))
        },
        getDocumentRef: (
          args: { usersId: string },
          documentId: string,
          validate: boolean = false
        ): AdminDocumentReference<z.infer<typeof this._doc>> => {
          const collectionRef = this.getCollectionRef(args, validate)
          return collectionRef.doc(documentId)
        },
        _converter: (validate: boolean) => ({
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
        }),
        _parents: ["users"],
        config: {
          getCollectionRef: (
            args: { usersId: string; settingsId: string },
            validate: boolean = false
          ): AdminCollectionReference<z.infer<typeof this._doc>> => {
            const path = `users/${args.usersId}/settings/${args.settingsId}/config`
            return firestoreInstance
              .collection(path)
              .withConverter(this._converter(validate))
          },
          getCollectionGroupRef: (
            validate: boolean = false
          ): AdminCollectionGroup<z.infer<typeof this._doc>> => {
            const path = `config`
            return firestoreInstance
              .collectionGroup(path)
              .withConverter(this._converter(validate))
          },
          getDocumentRef: (
            args: { usersId: string; settingsId: string },
            documentId: string,
            validate: boolean = false
          ): AdminDocumentReference<z.infer<typeof this._doc>> => {
            const collectionRef = this.getCollectionRef(args, validate)
            return collectionRef.doc(documentId)
          },
          _converter: (validate: boolean) => ({
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
          }),
          _parents: ["users", "settings"],
          _doc: z.object({
            config: z.string(),
          }),
        },
        _doc: z.object({
          config: z.string(),
        }),
      },
      _doc: z.object({
        userId: z.string(),
      }),
    },
  }
}

export function createFireTypeClient(firestoreInstance: ClientFirestore) {
  return {
    people: {
      getCollectionRef: (
        validate: boolean = false
      ): ClientQuery<z.infer<typeof this._doc>> => {
        const path = `people`
        return clientCollection(firestoreInstance, path).withConverter(
          this._converter(validate)
        )
      },
      getCollectionGroupRef: (
        validate: boolean = false
      ): ClientQuery<z.infer<typeof this._doc>> => {
        const path = `people`
        return clientCollectionGroup(firestoreInstance, path).withConverter(
          this._converter(validate)
        )
      },
      getDocumentRef: (
        documentId: string,
        validate: boolean = false
      ): ClientDocumentReference<z.infer<typeof this._doc>> => {
        const collectionRef = this.getCollectionRef(validate)
        return clientDocument(collectionRef, documentId)
      },
      _converter: (validate: boolean) => ({
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
      }),
      _doc: z.object({
        name: z.string(),
        lastName: z.string(),
      }),
    },
    users: {
      getCollectionRef: (
        validate: boolean = false
      ): ClientQuery<z.infer<typeof this._doc>> => {
        const path = `users`
        return clientCollection(firestoreInstance, path).withConverter(
          this._converter(validate)
        )
      },
      getCollectionGroupRef: (
        validate: boolean = false
      ): ClientQuery<z.infer<typeof this._doc>> => {
        const path = `users`
        return clientCollectionGroup(firestoreInstance, path).withConverter(
          this._converter(validate)
        )
      },
      getDocumentRef: (
        documentId: string,
        validate: boolean = false
      ): ClientDocumentReference<z.infer<typeof this._doc>> => {
        const collectionRef = this.getCollectionRef(validate)
        return clientDocument(collectionRef, documentId)
      },
      _converter: (validate: boolean) => ({
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
      }),
      settings: {
        getCollectionRef: (
          args: { usersId: string },
          validate: boolean = false
        ): ClientQuery<z.infer<typeof this._doc>> => {
          const path = `users/${args.usersId}/settings`
          return clientCollection(firestoreInstance, path).withConverter(
            this._converter(validate)
          )
        },
        getCollectionGroupRef: (
          validate: boolean = false
        ): ClientQuery<z.infer<typeof this._doc>> => {
          const path = `settings`
          return clientCollectionGroup(firestoreInstance, path).withConverter(
            this._converter(validate)
          )
        },
        getDocumentRef: (
          args: { usersId: string },
          documentId: string,
          validate: boolean = false
        ): ClientDocumentReference<z.infer<typeof this._doc>> => {
          const collectionRef = this.getCollectionRef(args, validate)
          return clientDocument(collectionRef, documentId)
        },
        _converter: (validate: boolean) => ({
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
        }),
        _parents: ["users"],
        config: {
          getCollectionRef: (
            args: { usersId: string; settingsId: string },
            validate: boolean = false
          ): ClientQuery<z.infer<typeof this._doc>> => {
            const path = `users/${args.usersId}/settings/${args.settingsId}/config`
            return clientCollection(firestoreInstance, path).withConverter(
              this._converter(validate)
            )
          },
          getCollectionGroupRef: (
            validate: boolean = false
          ): ClientQuery<z.infer<typeof this._doc>> => {
            const path = `config`
            return clientCollectionGroup(firestoreInstance, path).withConverter(
              this._converter(validate)
            )
          },
          getDocumentRef: (
            args: { usersId: string; settingsId: string },
            documentId: string,
            validate: boolean = false
          ): ClientDocumentReference<z.infer<typeof this._doc>> => {
            const collectionRef = this.getCollectionRef(args, validate)
            return clientDocument(collectionRef, documentId)
          },
          _converter: (validate: boolean) => ({
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
          }),
          _parents: ["users", "settings"],
          _doc: z.object({
            config: z.string(),
          }),
        },
        _doc: z.object({
          config: z.string(),
        }),
      },
      _doc: z.object({
        userId: z.string(),
      }),
    },
  }
}

import { z } from "zod"
import {
  Firestore as AdminFirestore,
  DocumentData as AdminDocumentData,
  QueryDocumentSnapshot as AdminQueryDocumentSnapshot,
  CollectionReference as AdminCollectionReference,
} from "firebase-admin/firestore"
import {
  Firestore as ClientFirestore,
  SnapshotOptions as ClientSnapshotOptions,
  QueryDocumentSnapshot as ClientQueryDocumentSnapshot,
  DocumentData as ClientDocumentData,
  CollectionReference as ClientCollectionReference,
  collection as clientCollection,
} from "firebase/firestore"

export function createFireTypeAdmin(firestoreInstance: AdminFirestore) {
  return {
    people: {
      getCollectionRef: (
        validate: boolean
      ): AdminCollectionReference<z.infer<typeof this._doc>> => {
        const path = `people`
        return firestoreInstance
          .collection(path)
          .withConverter(this._converter(validate))
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
        validate: boolean
      ): AdminCollectionReference<z.infer<typeof this._doc>> => {
        const path = `users`
        return firestoreInstance
          .collection(path)
          .withConverter(this._converter(validate))
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
          validate: boolean
        ): AdminCollectionReference<z.infer<typeof this._doc>> => {
          const path = `users/${args.usersId}/settings`
          return firestoreInstance
            .collection(path)
            .withConverter(this._converter(validate))
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
            validate: boolean
          ): AdminCollectionReference<z.infer<typeof this._doc>> => {
            const path = `users/${args.usersId}/settings/${args.settingsId}/config`
            return firestoreInstance
              .collection(path)
              .withConverter(this._converter(validate))
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
        validate: boolean
      ): ClientCollectionReference<z.infer<typeof this._doc>> => {
        const path = `people`
        return clientCollection(firestoreInstance, path).withConverter(
          this._converter(validate)
        )
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
        validate: boolean
      ): ClientCollectionReference<z.infer<typeof this._doc>> => {
        const path = `users`
        return clientCollection(firestoreInstance, path).withConverter(
          this._converter(validate)
        )
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
          validate: boolean
        ): ClientCollectionReference<z.infer<typeof this._doc>> => {
          const path = `users/${args.usersId}/settings`
          return clientCollection(firestoreInstance, path).withConverter(
            this._converter(validate)
          )
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
            validate: boolean
          ): ClientCollectionReference<z.infer<typeof this._doc>> => {
            const path = `users/${args.usersId}/settings/${args.settingsId}/config`
            return clientCollection(firestoreInstance, path).withConverter(
              this._converter(validate)
            )
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

import { z } from "zod"

const firetype = {
  people: {
    getCollectionRef: () => {
      const path = `people`
      return path
    },
    _doc: z.object({
      name: z.string(),
    }),
  },
  users: {
    getCollectionRef: () => {
      const path = `users`
      return path
    },
    settings: {
      getCollectionRef: (args: { usersId: string }) => {
        const path = `users/${args.usersId}/settings`
        return path
      },
      _parents: ["users"],
      config: {
        getCollectionRef: (args: { usersId: string; settingsId: string }) => {
          const path = `users/${args.usersId}/settings/${args.settingsId}/config`
          return path
        },
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
} as const

export { firetype }

import { z } from "zod"

const firetype = {
  people: {
    getCollectionRef: () => string,
    _doc: z.object({
      name: z.string(),
    }),
  },
  users: {
    getCollectionRef: () => string,
    settings: {
      getCollectionRef: (args: { users: string }) => string,
      config: {
        getCollectionRef: (args: { users: string; settings: string }) => string,
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

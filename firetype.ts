const firetype = {
  people: {
    getCollectionRef: () => string,
  },
  users: {
    getCollectionRef: () => string,
    settings: {
      getCollectionRef: (args: { users: string }) => string,
    },
  },
} as const

export { firetype }

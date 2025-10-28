import z from "zod";

export const schema = z.object({
  uid: z.string(),
  email: z.string().email(),
  name: z.string(),
  surname: z.string().optional(),
  nickname: z.string().optional(),
  display_name: z.string().optional(),

  address: z.string().optional(),
  cap: z.string().optional(),
  city: z.string().optional(),
  filterCity: z.string().optional(),
  region: z.string().optional(),

  channel: z.string().optional(),
  created_time: z.date().optional(),
  birthdate: z.date().optional(),

  loginType: z.string().optional(),
  isVerified: z.boolean().optional(),

  yesMarketing: z.boolean().optional(),

  phone_number: z.string().optional(),
  photo_url: z.string().url().optional(),

  genre: z.string().optional(),
  height: z.number().optional(),

  is2v2: z.boolean().optional(),
  is3v3: z.boolean().optional(),
  is4v4: z.boolean().optional(),

  isMonday: z.boolean().optional(),
  isTuesday: z.boolean().optional(),
  isWednesday: z.boolean().optional(),
  isThursday: z.boolean().optional(),
  isFriday: z.boolean().optional(),
  isSaturday: z.boolean().optional(),
  isSunday: z.boolean().optional(),

  fromMonday: z.string().optional(),
  fromTuesday: z.string().optional(),
  fromWednesday: z.string().optional(),
  fromThursday: z.string().optional(),
  fromFriday: z.string().optional(),
  fromSaturday: z.string().optional(),
  fromSunday: z.string().optional(),

  toMonday: z.string().optional(),
  toTuesday: z.string().optional(),
  toWednesday: z.string().optional(),
  toThursday: z.string().optional(),
  toFriday: z.string().optional(),
  toSaturday: z.string().optional(),
  toSunday: z.string().optional(),

  level: z.number().optional(),
  levGeneral: z.number().optional(),
  levAttack: z.number().optional(),
  levDefense: z.number().optional(),
  levPhysical: z.number().optional(),
  haveNewLevel: z.boolean().optional(),

  frequency: z.string().optional(),
  motivation: z.string().optional(),

  otherSports: z.array(z.string()).optional().default([]),
  passions: z.array(z.string()).optional().default([]),

  points: z.number().optional(),

  profession: z.string().optional(),
  work: z.string().optional(),
  study: z.string().optional(),

  referrealCode: z.string().optional(),

  latLong: z.any().optional(),
});

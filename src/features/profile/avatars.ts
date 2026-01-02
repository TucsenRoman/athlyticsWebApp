export const AVATAR_IDS = [
  "a1","a2","a3","a4","a5","a6", "a7", "a8", "a9",
  "b1","b2","b3","b4","b5","b6","b7","b8","b9",
  "c1","c2","c3","c4","c5","c6","c7","c8","c9",
] as const

export type AvatarId = typeof AVATAR_IDS[number]

export function isAvatarId(value: unknown): value is AvatarId {
  return AVATAR_IDS.includes(value as AvatarId)
}

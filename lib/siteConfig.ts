/**
 * Site-wide constants that are expected to change without touching
 * component code — swap these when the real app listings go live.
 */

/** App store listing URLs (placeholders — replace with the real links). */
export const STORE_LINKS = {
  google: 'https://play.google.com/store/apps/details?id=lk.vertexcomputers.app',
  apple: 'https://apps.apple.com/app/vertex-computers/id6740000000',
} as const;

export type StoreKind = keyof typeof STORE_LINKS;

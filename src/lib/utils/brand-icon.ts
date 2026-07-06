export const BRAND_ICON_NAMES = ['git', 'docker', 'linux', 'openjdk'] as const;
export type BrandIconName = (typeof BRAND_ICON_NAMES)[number];

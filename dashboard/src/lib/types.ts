export type PageId =
  | 'overview'
  | 'traffic'
  | 'engagement'
  | 'conversions'
  | 'performance'
  | 'audience';

export const PAGE_IDS = [
  'overview',
  'traffic',
  'engagement',
  'conversions',
  'performance',
  'audience',
] as const satisfies readonly PageId[];

/** Every page takes the app's 30 s counter and nothing else. Overview also
 *  takes a navigate callback, because its tiles are links to the other five. */
export interface PageProps {
  tick: number;
}

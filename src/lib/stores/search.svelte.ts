/** Shared between the top bar's global search box and the Topics page's own
 *  search input, so typing in either one drives the same filter. */
export const globalSearch: { query: string } = $state({ query: '' });

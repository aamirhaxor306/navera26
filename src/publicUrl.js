/**
 * Prefix for files in `public/` (and HTML/CSS) so they work when the app is
 * hosted under Vite `base` (e.g. /school-of-business/navera26/).
 */
export function publicUrl(path) {
  const base = import.meta.env.BASE_URL;
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}

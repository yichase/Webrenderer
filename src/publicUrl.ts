/** Resolve a file under `public/` against Vite's configured base path. */
export function publicUrl(path: string): string {
    const base = import.meta.env.BASE_URL;
    const relative = path.replace(/^\/+/, "");
    return `${base}${relative}`;
}

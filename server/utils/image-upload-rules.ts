export const MAX_IMAGE_BYTES = 2 * 1024 * 1024
export const MAX_REFERENZ_IMAGE_BYTES = 5 * 1024 * 1024

export const ALLOWED_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif'
])

function assertAllowedMime(mimeRaw: string): string {
  const mime = (mimeRaw || '').toLowerCase()
  if (!ALLOWED_IMAGE_MIME.has(mime)) {
    throw createError({
      statusCode: 400,
      message: 'Nur Bilder (JPEG, PNG, WebP, GIF, AVIF) erlaubt.'
    })
  }
  return mime
}

export function assertValidAdminImage(mimeRaw: string, byteLength: number): void {
  if (byteLength > MAX_IMAGE_BYTES) {
    throw createError({ statusCode: 413, message: 'Datei zu groß — maximal 2 MB.' })
  }
  assertAllowedMime(mimeRaw)
}

export function assertValidReferenzImage(mimeRaw: string, byteLength: number): void {
  if (byteLength > MAX_REFERENZ_IMAGE_BYTES) {
    throw createError({ statusCode: 413, message: 'Datei zu groß — maximal 5 MB.' })
  }
  assertAllowedMime(mimeRaw)
}

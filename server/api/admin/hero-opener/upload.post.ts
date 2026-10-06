import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = config.blobReadWriteToken as string
  if (!token) {
    throw createError({ statusCode: 500, message: 'BLOB_READ_WRITE_TOKEN nicht konfiguriert.' })
  }

  const body = await readBody(event) as HandleUploadBody & { type?: string }

  // Token generation is triggered by the browser (authenticated user)
  if (!body.type || body.type === 'blob.generate-client-token') {
    requireAdmin(event)
  }
  // blob.upload-completed is called by Vercel Blob servers — verified internally by handleUpload

  const headers = getRequestHeaders(event)
  const jsonResponse = await handleUpload({
    body,
    request: {
      headers: { get: (key: string) => headers[key.toLowerCase()] ?? null },
    } as Request,
    onBeforeGenerateToken: async (_pathname) => ({
      allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'],
      maximumSizeInBytes: 500 * 1024 * 1024,
      allowOverwrite: true,
    }),
    onUploadCompleted: async ({ blob }) => {
      const supabase = getSupabaseAdmin(event)
      await supabase
        .from('hero_opener')
        .upsert(
          { id: 'default', video_url: blob.url, provider: 'file', video_id: blob.url },
          { onConflict: 'id' }
        )
    },
    token,
  })

  return jsonResponse
})

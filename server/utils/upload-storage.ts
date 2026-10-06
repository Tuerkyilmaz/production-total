import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { put } from '@vercel/blob'
import type { H3Event } from 'h3'

export type UploadPurpose = 'projekt' | 'referenz' | 'ugc'

export function resolveUploadTarget(
  purpose: UploadPurpose,
  config: {
    supabaseStorageBucket: string
    supabaseLogosBucket: string
  },
  safeName: string
): { bucket: string; objectKey: string } {
  const ts = Date.now()
  if (purpose === 'referenz') {
    return {
      bucket: config.supabaseLogosBucket || 'logos',
      objectKey: `referenzen/${ts}-${safeName}`
    }
  }
  if (purpose === 'ugc') {
    return {
      bucket: config.supabaseStorageBucket,
      objectKey: `ugc-creators/avatars/${ts}-${safeName}`
    }
  }
  return {
    bucket: config.supabaseStorageBucket,
    objectKey: `projekte/thumbnails/${ts}-${safeName}`
  }
}

function isSupabaseS3Ready(config: {
  supabaseStorageUrl: string
  supabaseAccessKey: string
  supabaseSecretAccessKey: string
}): boolean {
  return !!(
    config.supabaseStorageUrl?.trim()
    && config.supabaseAccessKey?.trim()
    && config.supabaseSecretAccessKey?.trim()
  )
}

function isSupabaseStorageJsReady(config: {
  supabaseUrl: string
  supabaseServiceRoleKey: string
}): boolean {
  return !!(config.supabaseUrl?.trim() && config.supabaseServiceRoleKey?.trim())
}

export function publicSupabaseObjectUrl(siteBase: string, bucket: string, objectKey: string): string {
  const base = siteBase.replace(/\/$/, '')
  const path = objectKey.split('/').map((s) => encodeURIComponent(s)).join('/')
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path}`
}

function throwIfBucketMissing(e: unknown, bucket: string): never {
  const name = e && typeof e === 'object' && 'name' in e ? String((e as { name: string }).name) : ''
  const msg = e instanceof Error ? e.message : String(e)
  const combined = `${name} ${msg}`.toLowerCase()
  if (
    name === 'NoSuchBucket'
    || combined.includes('bucket not found')
    || combined.includes('does not exist')
    || combined.includes('not found')
  ) {
    throw createError({
      statusCode: 400,
      message:
        `Kein Storage-Bucket „${bucket}“. Unter Storage → Buckets einen Bucket anlegen und SUPABASE_STORAGE_BUCKET bzw. SUPABASE_LOGOS_BUCKET setzen.`
    })
  }
  throw createError({ statusCode: 500, message: msg || 'Upload fehlgeschlagen.' })
}

export async function uploadBufferToStorage(
  event: H3Event,
  buffer: Buffer,
  mime: string,
  bucket: string,
  objectKey: string
): Promise<string> {
  const config = useRuntimeConfig(event)

  if (isSupabaseStorageJsReady(config)) {
    const supabase = getSupabaseAdmin(event)
    const { error } = await supabase.storage.from(bucket).upload(objectKey, buffer, {
      contentType: mime,
      upsert: false
    })
    if (error) {
      throwIfBucketMissing(error, bucket)
    }
    const siteBase = config.public.supabaseUrl?.trim() || config.supabaseUrl?.trim()
    if (!siteBase) {
      throw createError({ statusCode: 500, message: 'SUPABASE_URL fehlt — für die öffentliche Objekt-URL erforderlich.' })
    }
    return publicSupabaseObjectUrl(siteBase, bucket, objectKey)
  }

  if (isSupabaseS3Ready(config)) {
    const client = new S3Client({
      region: 'us-east-1',
      endpoint: config.supabaseStorageUrl!.trim(),
      credentials: {
        accessKeyId: config.supabaseAccessKey!,
        secretAccessKey: config.supabaseSecretAccessKey!
      },
      forcePathStyle: true
    })
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: objectKey,
          Body: buffer,
          ContentType: mime
        })
      )
    } catch (e: unknown) {
      throwIfBucketMissing(e, bucket)
    }
    const siteBase = config.public.supabaseUrl?.trim()
    if (!siteBase) {
      throw createError({ statusCode: 500, message: 'SUPABASE_URL fehlt — für die öffentliche Objekt-URL erforderlich.' })
    }
    return publicSupabaseObjectUrl(siteBase, bucket, objectKey)
  }

  if (!config.blobReadWriteToken) {
    throw createError({
      statusCode: 500,
      message:
        'Kein Speicher konfiguriert: Supabase-Bucket oder Vercel BLOB_READ_WRITE_TOKEN setzen.'
    })
  }

  const blob = await put(objectKey, buffer, {
    access: 'public',
    token: config.blobReadWriteToken,
    contentType: mime
  })
  return blob.url
}

export async function resizeReferenzLogo(input: Buffer): Promise<{ buffer: Buffer; mime: string }> {
  try {
    const sharp = (await import('sharp')).default
    const buffer = await sharp(input)
      .resize(600, 200, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 88 })
      .toBuffer()
    return { buffer, mime: 'image/webp' }
  } catch {
    return { buffer: input, mime: 'image/webp' }
  }
}

export async function resizeUgcPhoto(input: Buffer): Promise<{ buffer: Buffer; mime: string }> {
  try {
    const sharp = (await import('sharp')).default
    const buffer = await sharp(input)
      .resize(800, 600, {
        fit: 'cover',
        position: 'centre'
      })
      .webp({ quality: 88 })
      .toBuffer()
    return { buffer, mime: 'image/webp' }
  } catch {
    return { buffer: input, mime: 'image/webp' }
  }
}

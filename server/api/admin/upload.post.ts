import { assertValidAdminImage, assertValidReferenzImage } from '../../utils/image-upload-rules'
import {
  resizeReferenzLogo,
  resizeUgcPhoto,
  resolveUploadTarget,
  uploadBufferToStorage,
  type UploadPurpose
} from '../../utils/upload-storage'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const purposeRaw = typeof query.purpose === 'string' ? query.purpose : 'projekt'
  const purpose: UploadPurpose =
    purposeRaw === 'referenz' || purposeRaw === 'ugc' ? purposeRaw : 'projekt'

  const parts = await readMultipartFormData(event)
  if (!parts?.length) {
    throw createError({ statusCode: 400, message: 'Keine multipart-Daten.' })
  }
  const fileEntry = parts.find((p) => p.name === 'file')
  if (!fileEntry?.data?.length) {
    throw createError({ statusCode: 400, message: 'Feld „file“ mit Dateiinhalt erforderlich.' })
  }

  const mimeIn = (fileEntry.type || '').toLowerCase()
  if (purpose === 'referenz') {
    assertValidReferenzImage(mimeIn, fileEntry.data.length)
  } else {
    assertValidAdminImage(mimeIn, fileEntry.data.length)
  }

  const rawName = fileEntry.filename || 'upload.bin'
  const safeName = rawName.replace(/[^\w.\-]/g, '_').slice(0, 120) || 'upload.bin'

  let buffer = Buffer.from(fileEntry.data)
  let mime = mimeIn || 'application/octet-stream'

  if (purpose === 'referenz') {
    const resized = await resizeReferenzLogo(buffer)
    buffer = resized.buffer
    mime = resized.mime
    const webpName = safeName.replace(/\.[^.]+$/, '') + '.webp'
    const { bucket, objectKey } = resolveUploadTarget(purpose, config, webpName)
    const url = await uploadBufferToStorage(event, buffer, mime, bucket, objectKey)
    return { url }
  }

  if (purpose === 'ugc') {
    const resized = await resizeUgcPhoto(buffer)
    buffer = resized.buffer
    mime = resized.mime
    const webpName = safeName.replace(/\.[^.]+$/, '') + '.webp'
    const { bucket, objectKey } = resolveUploadTarget(purpose, config, webpName)
    const url = await uploadBufferToStorage(event, buffer, mime, bucket, objectKey)
    return { url }
  }

  const { bucket, objectKey } = resolveUploadTarget(purpose, config, safeName)
  const url = await uploadBufferToStorage(event, buffer, mime, bucket, objectKey)
  return { url }
})

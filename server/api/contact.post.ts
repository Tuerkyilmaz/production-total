import nodemailer from 'nodemailer'

type ContactBody = {
  name?: string
  email?: string
  phone?: string
  subject?: string
  message?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactBody>(event)
  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim()
  const phone = String(body?.phone || '').trim()
  const subject = String(body?.subject || '').trim()
  const message = String(body?.message || '').trim()

  if (!name || !email || !phone || !subject || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Bitte alle Pflichtfelder ausfüllen.' })
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  if (!emailOk) {
    throw createError({ statusCode: 400, statusMessage: 'Bitte eine gültige E-Mail-Adresse angeben.' })
  }

  const config = useRuntimeConfig(event)
  const host = String(config.smtpHost || '')
  const port = Number(config.smtpPort || 465)
  const secure = Boolean(config.smtpSecure)
  const user = String(config.smtpUser || '')
  const pass = String(config.smtpPassword || '')
  const to = String(config.public.contactEmail || user || '').trim()

  if (!host || !port || !user || !pass || !to) {
    throw createError({ statusCode: 500, statusMessage: 'E-Mail-Konfiguration unvollständig.' })
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  })

  await transporter.sendMail({
    from: `"${name}" <${user}>`,
    replyTo: email,
    to,
    subject: `[Kontaktformular] ${subject}`,
    text: `Name / Unternehmen: ${name}\nE-Mail: ${email}\nTelefonnummer: ${phone}\nBetreff: ${subject}\n\nNachricht:\n${message}`
  })

  return { ok: true }
})

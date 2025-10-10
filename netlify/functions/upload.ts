import { Handler } from '@netlify/functions'
import crypto from 'crypto'

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { dataUrl } = JSON.parse(event.body || '{}')
    if (!dataUrl) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'dataUrl is required' }) }
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    if (!cloudName || !apiKey || !apiSecret) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Cloudinary env vars missing' }) }
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const toSign = `timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(toSign).digest('hex')

    const form = new URLSearchParams()
    form.append('file', dataUrl)
    form.append('api_key', apiKey)
    form.append('timestamp', String(timestamp))
    form.append('signature', signature)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    const json = await res.json()
    if (!res.ok) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Upload failed', details: json }) }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ url: json.secure_url || json.url }) }
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Unexpected error', message: e instanceof Error ? e.message : String(e) }) }
  }
}



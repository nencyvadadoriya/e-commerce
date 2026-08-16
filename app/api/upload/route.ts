import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const singleFile = formData.get('file') as File | null

    const allFiles: File[] = []
    if (files && files.length > 0) {
      allFiles.push(...files)
    } else if (singleFile) {
      allFiles.push(singleFile)
    }

    if (allFiles.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const urls: string[] = []

    for (const file of allFiles) {
      if (!file || typeof file === 'string' || !file.arrayBuffer) continue

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Sanitize extension and generate unique name
      const ext = path.extname(file.name) || '.jpg'
      const cleanExt = ext.toLowerCase().replace(/[^a-z0-9.]/g, '')
      const uniqueId = crypto.randomUUID()
      const filename = `${uniqueId}${cleanExt}`
      const filePath = path.join(uploadDir, filename)

      await writeFile(filePath, buffer)
      urls.push(`/uploads/${filename}`)
    }

    return NextResponse.json({
      urls,
      url: urls[0] ?? '',
      message: 'Images uploaded successfully',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image', details: String(error) }, { status: 500 })
  }
}

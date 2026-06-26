import { NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import path from 'path';

// POST /api/upload — Upload product images
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier invalide: ${file.type}. Autorisé: JPG, PNG, WebP, GIF` },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB.` },
        { status: 400 }
      );
    }

    // Ensure the upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'products');
    await mkdir(uploadDir, { recursive: true });

    // Verify directory is writable
    await access(uploadDir);

    // Generate unique filename
    const originalExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(originalExt) ? originalExt : 'jpg';
    const filename = `product-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${safeExt}`;
    const filepath = path.join(uploadDir, filename);

    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Le fichier est vide' }, { status: 400 });
    }

    await writeFile(filepath, buffer);

    const url = `/products/${filename}`;
    return NextResponse.json({ url, filename, size: buffer.length });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('POST /api/upload error:', msg);
    return NextResponse.json({ error: `Upload échoué: ${msg}` }, { status: 500 });
  }
}

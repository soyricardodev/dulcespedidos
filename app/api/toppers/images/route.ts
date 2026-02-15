import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/db';
import { topperImages } from '@/db/schema';
import { uploadToR2 } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const topperId = formData.get('topperId') as string;
    const description = formData.get('description') as string;

    if (!file || !topperId) {
      return NextResponse.json({ error: 'Missing file or topperId' }, { status: 400 });
    }

    // Upload to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageUrl = await uploadToR2(buffer, file.name, file.type);

    const db = getDb();
    const [newImage] = await db.insert(topperImages).values({
      topperId: parseInt(topperId),
      imageUrl,
      description,
    }).returning();

    return NextResponse.json({ image: newImage });
  } catch (error) {
    console.error('Error uploading topper image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

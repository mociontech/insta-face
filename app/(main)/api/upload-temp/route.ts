import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convertir a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Aquí puedes subir a un servicio temporal o usar Replicate directo
    // Por simplicidad, usaremos Replicate directo en el siguiente paso
    return NextResponse.json({ 
      success: true,
      // Esto es un placeholder - en realidad manejaremos la imagen diferente
      url: `data:${file.type};base64,${buffer.toString('base64')}`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
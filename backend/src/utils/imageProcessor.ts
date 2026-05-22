import sharp from 'sharp';
import { supabaseAdmin } from '../config/supabase';

const SUPABASE_BUCKET = 'food-safety-audit';

const VERSIONS = [
  { key: 'report', width: 1200, height: 900, quality: 85 },
  { key: 'thumb',  width: 400,  height: 300, quality: 70  },
] as const;

// ── Garantizar que el bucket existe y es público ────────────────────────────
// Se verifica una sola vez por proceso (flag de módulo).
// Si el bucket no existe, lo crea como público para que las URLs funcionen.
let bucketReady = false;
async function ensureBucket(): Promise<void> {
  if (bucketReady) return;

  const { data: buckets, error: listErr } = await supabaseAdmin.storage.listBuckets();
  if (listErr) {
    console.warn('[imageProcessor] No se pudo listar buckets:', listErr.message);
    return; // No bloqueamos la subida; puede que igual funcione
  }

  const exists = buckets?.some(b => b.name === SUPABASE_BUCKET);
  if (!exists) {
    const { error: createErr } = await supabaseAdmin.storage.createBucket(SUPABASE_BUCKET, {
      public: true,          // URLs públicas sin token
      fileSizeLimit: 20971520, // 20 MB
      // HEIC/HEIF incluidos: sharp los convierte a JPEG automáticamente
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
    });
    if (createErr) {
      console.error('[imageProcessor] Error creando bucket:', createErr.message);
      throw new Error(`No se pudo crear el bucket de almacenamiento: ${createErr.message}`);
    }
    console.log(`[imageProcessor] Bucket '${SUPABASE_BUCKET}' creado correctamente.`);
  } else {
    // Aseguramos que el bucket sea público (por si fue creado como privado antes)
    const { error: updateErr } = await supabaseAdmin.storage.updateBucket(SUPABASE_BUCKET, {
      public: true,
    });
    if (updateErr) {
      console.warn('[imageProcessor] No se pudo actualizar el bucket a público:', updateErr.message);
    }
  }

  bucketReady = true;
}

export interface ProcessedImages {
  url_original: string;
  url_report:   string;
  url_thumbnail: string;
  storage_key:  string;
  width_px:     number;
  height_px:    number;
  size_bytes:   number;
  mime_type:    string;
}

/**
 * Procesa una imagen de evidencia:
 * 1. Guarda el original en Supabase Storage
 * 2. Genera versiones report (1200x900) y thumb (400x300)
 * 3. Devuelve las URLs públicas de las 3 versiones
 *
 * storageKeyBase: Ej. "fsa/2026/FSA-2026-0001/cop_magazine_1"
 */
export async function processAuditImage(
  buffer: Buffer,
  mimeType: string,
  storageKeyBase: string,
  originalSizeBytes: number
): Promise<ProcessedImages> {
  // Garantizar que el bucket existe y es público antes de subir
  await ensureBucket();

  // Obtener metadatos del original
  const metadata = await sharp(buffer).metadata();
  const width_px  = metadata.width  ?? 0;
  const height_px = metadata.height ?? 0;

  // 1. Guardar original
  // Nota: si el archivo es HEIC/HEIF (iPhone), sharp lo decodifica automáticamente
  // vía libvips y lo recodifica como JPEG en las versiones report/thumb.
  // El original se guarda tal cual llega (buffer sin modificar).
  const originalMime = ['image/heic', 'image/heif'].includes(mimeType) ? 'image/jpeg' : mimeType;
  const originalKey = `${storageKeyBase}_original.jpg`;
  const { error: origError } = await supabaseAdmin.storage
    .from(SUPABASE_BUCKET)
    .upload(originalKey, buffer, {
      contentType: originalMime,
      upsert: true,
    });
  if (origError) throw new Error(`Error guardando original: ${origError.message}`);

  const { data: { publicUrl: url_original } } = supabaseAdmin.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(originalKey);

  // 2. Generar versiones procesadas
  const urls: Record<string, string> = {};

  for (const version of VERSIONS) {
    const processed = await sharp(buffer)
      .resize(version.width, version.height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: version.quality, progressive: true })
      .toBuffer();

    const key = `${storageKeyBase}_${version.key}.jpg`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from(SUPABASE_BUCKET)
      .upload(key, processed, { contentType: 'image/jpeg', upsert: true });

    if (uploadError) throw new Error(`Error guardando versión ${version.key}: ${uploadError.message}`);

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(key);
    urls[version.key] = publicUrl;
  }

  return {
    url_original,
    url_report:    urls['report'],
    url_thumbnail: urls['thumb'],
    storage_key:   storageKeyBase,
    width_px,
    height_px,
    size_bytes:    originalSizeBytes,
    mime_type:     mimeType,
  };
}

/**
 * Elimina todas las versiones de una imagen del bucket
 */
export async function deleteAuditImageVersions(storageKeyBase: string): Promise<void> {
  const keys = [
    `${storageKeyBase}_original.jpg`,
    `${storageKeyBase}_report.jpg`,
    `${storageKeyBase}_thumb.jpg`,
  ];
  const { error } = await supabaseAdmin.storage.from(SUPABASE_BUCKET).remove(keys);
  if (error) console.warn(`[imageProcessor] No se pudo borrar imagen ${storageKeyBase}:`, error.message);
}

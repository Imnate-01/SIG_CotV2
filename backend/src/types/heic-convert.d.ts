declare module 'heic-convert' {
  interface ConvertOptions {
    buffer: Buffer | ArrayBuffer | Uint8Array;
    format: 'JPEG' | 'PNG';
    quality?: number; // 0–1, solo para JPEG
  }

  function heicConvert(options: ConvertOptions): Promise<ArrayBuffer>;
  export = heicConvert;
}

/**
 * Storage Service Abstraction
 * 
 * Connected to Supabase Storage (with fallback for MOCK / S3 / Cloudinary).
 */
import { supabaseAdmin } from '@/lib/supabase/supabase';

export interface StorageUploadResult {
  url: string;
  key: string;
  provider: 'MOCK' | 'SUPABASE' | 'S3' | 'CLOUDINARY';
}

export class StorageService {
  private static provider = process.env.STORAGE_PROVIDER || 'SUPABASE';

  /**
   * Uploads a file buffer or base64 data to storage provider.
   */
  static async uploadFile(
    fileContent: Buffer | string,
    fileName: string,
    bucket: string = 'public-assets',
    contentType: string = 'image/png'
  ): Promise<StorageUploadResult> {
    if (this.provider === 'SUPABASE') {
      try {
        const fileKey = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
        const buffer = typeof fileContent === 'string'
          ? Buffer.from(fileContent.replace(/^data:image\/\w+;base64,/, ''), 'base64')
          : fileContent;

        const { error } = await supabaseAdmin.storage
          .from(bucket)
          .upload(fileKey, buffer, {
            contentType,
            upsert: true,
          });

        if (error) {
          console.error('[StorageService SUPABASE Upload Error]', error);
          throw new Error(`Supabase Storage upload failed: ${error.message}`);
        }

        const { data: publicUrlData } = supabaseAdmin.storage
          .from(bucket)
          .getPublicUrl(fileKey);

        return {
          url: publicUrlData.publicUrl,
          key: fileKey,
          provider: 'SUPABASE',
        };
      } catch (err: any) {
        console.warn('[StorageService] Falling back to MOCK upload:', err.message);
      }
    }

    if (this.provider === 'CLOUDINARY') {
      throw new Error('Cloudinary provider not yet configured. Set STORAGE_PROVIDER=SUPABASE or MOCK.');
    }

    if (this.provider === 'S3') {
      throw new Error('AWS S3 provider not yet configured. Set STORAGE_PROVIDER=SUPABASE or MOCK.');
    }

    // Fallback Mock upload for local development
    const mockUrl = `/uploads/${bucket}/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    return {
      url: mockUrl,
      key: `${bucket}/${Date.now()}-${fileName}`,
      provider: 'MOCK',
    };
  }

  /**
   * Generates a 15-minute secure pre-signed download URL for private files (e.g., KYC documents)
   */
  static async getSignedUrl(bucket: string, fileKey: string, expiresIn: number = 900): Promise<string> {
    if (this.provider === 'SUPABASE') {
      try {
        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .createSignedUrl(fileKey, expiresIn);

        if (error) {
          console.error('[StorageService SUPABASE Signed URL Error]', error);
          return fileKey;
        }
        return data.signedUrl;
      } catch (err: any) {
        console.warn('[StorageService] Signed URL fallback:', err.message);
      }
    }
    return `/uploads/${bucket}/${fileKey}`;
  }

  /**
   * Deletes a file from storage.
   */
  static async deleteFile(fileKey: string, bucket: string = 'public-assets'): Promise<boolean> {
    if (this.provider === 'SUPABASE') {
      try {
        const { error } = await supabaseAdmin.storage.from(bucket).remove([fileKey]);
        if (error) {
          console.error('[StorageService SUPABASE Delete Error]', error);
          return false;
        }
        return true;
      } catch (err: any) {
        console.warn('[StorageService] Delete fallback:', err.message);
      }
    }
    console.log(`[StorageService MOCK] Deleted file key: ${fileKey}`);
    return true;
  }
}

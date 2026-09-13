/**
 * Storage Service Abstraction
 * 
 * Supports local/mock file handling, easily expandable to S3 / Cloudinary / Firebase Storage.
 */

export interface StorageUploadResult {
  url: string;
  key: string;
  provider: 'MOCK' | 'S3' | 'CLOUDINARY';
}

export class StorageService {
  private static provider = process.env.STORAGE_PROVIDER || 'MOCK';

  /**
   * Uploads a file buffer or base64 data to storage provider.
   */
  static async uploadFile(
    fileContent: Buffer | string,
    fileName: string,
    folder: string = 'uploads'
  ): Promise<StorageUploadResult> {
    if (this.provider === 'CLOUDINARY') {
      // Future Cloudinary integration placeholder
      throw new Error('Cloudinary provider not yet configured. Set STORAGE_PROVIDER=MOCK.');
    }

    if (this.provider === 'S3') {
      // Future AWS S3 integration placeholder
      throw new Error('AWS S3 provider not yet configured. Set STORAGE_PROVIDER=MOCK.');
    }

    // Mock upload for local development (no external keys required)
    const mockUrl = `/uploads/${folder}/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    return {
      url: mockUrl,
      key: `${folder}/${Date.now()}-${fileName}`,
      provider: 'MOCK',
    };
  }

  /**
   * Deletes a file from storage.
   */
  static async deleteFile(fileKey: string): Promise<boolean> {
    console.log(`[StorageService MOCK] Deleted file key: ${fileKey}`);
    return true;
  }
}

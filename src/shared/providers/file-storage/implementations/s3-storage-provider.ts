import path from 'path';
import fs from 'fs/promises';
import 'dotenv';
import { S3 } from '@aws-sdk/client-s3';

import uploadConfig from '../../../../config/upload';
import config from '../../../../config';
import { IFileStorageProvider } from '../models/file-storage-provider.interface';

export default class S3StorageProvider implements IFileStorageProvider {
  private client: S3;

  constructor() {
    this.client = new S3({
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
      region: 'us-east-1',
    });
  }

  async get(filename: string): Promise<Buffer | null> {
    try {
      const file = await this.client.getObject({
        Bucket: config.BUCKET_NAME,
        Key: filename,
        ResponseContentType: 'Buffer',
      });

      const content = await file.Body?.transformToByteArray();

      if (!content) return null;

      return Buffer.from(new Uint8Array(content));
    } catch (error) {
      return null;
    }
  }

  async save(filename: string): Promise<string> {
    const fileContent = await fs.readFile(
      path.join(uploadConfig.tempFolder, filename)
    );

    await this.client.putObject({
      Bucket: config.BUCKET_NAME,
      Key: filename,
      Body: fileContent,
    });

    return filename;
  }

  async delete(filename: string): Promise<void> {
    await this.client.deleteObject({
      Bucket: config.BUCKET_NAME,
      Key: filename,
    });
  }
}

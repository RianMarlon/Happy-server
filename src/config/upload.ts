import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import * as Yup from 'yup';

const uploadFolder = path.join(__dirname, '..', '..', 'uploads');
const tempFolder = path.join(__dirname, '..', '..', 'temp');

export default {
  tempFolder,
  uploadFolder,
  multer: {
    storage: multer.diskStorage({
      destination: (request, file, callback) => {
        if (!fs.existsSync(tempFolder)) {
          fs.mkdirSync(tempFolder, { recursive: true });
        }

        callback(null, path.join(tempFolder));
      },
      filename: (request, file, callback) => {
        crypto.randomBytes(16, (err: any, hash) => {
          const format = file.mimetype.split('/')[1];

          const fileName = `${Date.now().toString()}-${hash.toString(
            'hex'
          )}.${format}`;

          callback(null, fileName);
        });
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: async (request: any, file: any, callback: any) => {
      const allowedMimes = [
        'image/jpeg',
        'image/pjpeg',
        'image/jpg',
        'image/png',
      ];

      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(
          new Yup.ValidationError(
            'Formato da imagem fornecida não é aceito!',
            null,
            ''
          )
        );
      }
    },
  },
};

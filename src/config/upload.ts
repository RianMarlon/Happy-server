import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const pathFiles = path.join(__dirname, '..', '..', 'uploads');

export default {
  storage: multer.diskStorage({
    destination: (request, file, callback) => {
      if (!fs.existsSync(pathFiles)) {
        fs.mkdirSync(pathFiles, { recursive: true });
      }

      callback(null, path.join(pathFiles));
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
  fileFilter: (request: any, file: any, callback: any) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/jpg',
      'image/png',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Formato da imagem fornecida não é aceito!'));
    }
  },
};

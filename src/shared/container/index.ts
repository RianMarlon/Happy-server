import { container } from 'tsyringe';

import config from '../../config';

import { IUsersRepository } from '../../modules/users/domain/repositories/users-repository.interface';
import { IImagesRepository } from '../../modules/images/domain/repositories/images-repository.interface';
import { IOrphanagesRepository } from '../../modules/orphanages/domain/repositories/orphanages-repository.interface';
import { IHashProvider } from '../providers/hash/models/hash-provider.interface';
import { IJwtProvider } from '../providers/jwt/models/jwt-provider.interface';
import { IFileStorageProvider } from '../providers/file-storage/models/file-storage-provider.interface';
import { IMailProvider } from '../providers/mail/models/mail-provider.interface';

import UsersRepository from '../../modules/users/infra/typeorm/repositories/users-repository';
import ImagesRepository from '../../modules/images/infra/typeorm/repositories/images-repository';
import OrphanagesRepository from '../../modules/orphanages/infra/typeorm/repositories/orphanages-repository';
import BcryptHashProvider from '../providers/hash/implementations/bcrypt-hash-provider';
import JsonWebTokenProvider from '../providers/jwt/implementations/jsonwebtoken-provider';
import DiskStorageProvider from '../providers/file-storage/implementations/disk-storage-provider';
import MailtrapProvider from '../providers/mail/implementations/mailtrap-provider';
import S3StorageProvider from '../providers/file-storage/implementations/s3-storage-provider';

container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UsersRepository
);

container.registerSingleton<IImagesRepository>(
  'ImagesRepository',
  ImagesRepository
);

container.registerSingleton<IOrphanagesRepository>(
  'OrphanagesRepository',
  OrphanagesRepository
);

container.registerSingleton<IHashProvider>('HashProvider', BcryptHashProvider);

container.registerSingleton<IJwtProvider>('JwtProvider', JsonWebTokenProvider);

container.registerSingleton<IFileStorageProvider>(
  'FileStorageProvider',
  config.NODE_ENV === 'test' ? DiskStorageProvider : S3StorageProvider
);

container.registerSingleton<IMailProvider>('MailProvider', MailtrapProvider);

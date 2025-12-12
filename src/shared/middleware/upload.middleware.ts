import multer from 'multer';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`File type ${file.mimetype} is not allowed`));
  }
};

const limits = {
  fileSize: 50 * 1024 * 1024, // 50MB
};

export const uploadSingle = (fieldName: string = 'file') => {
  return multer({
    storage,
    fileFilter,
    limits,
  }).single(fieldName);
};

export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 10) => {
  return multer({
    storage,
    fileFilter,
    limits,
  }).array(fieldName, maxCount);
};

export const uploadFields = (fields: multer.Field[]) => {
  return multer({
    storage,
    fileFilter,
    limits,
  }).fields(fields);
};


import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Tipos MIME permitidos
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan: JPEG, PNG, GIF, WEBP'), false);
  }
};

// Crea una instancia de multer configurada para una subcarpeta especifica
const createUpload = (subfolder) => {
  const dir = path.join(UPLOADS_DIR, subfolder);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${req.params.id}-${Date.now()}${ext}`;
      cb(null, filename);
    }
  });

  return multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });
};

// Retorna la URL relativa del archivo guardado
const getFileUrl = (subfolder, filename) => {
  return `/uploads/${subfolder}/${filename}`;
};

// Elimina un archivo del disco dada su URL relativa
const deleteFile = (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;

  const relativePath = fileUrl.replace('/uploads/', '');
  const filePath = path.join(UPLOADS_DIR, relativePath);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log('🗑️ [MULTER-SERVICE] Archivo eliminado:', filePath);
  }
};

const multerService = {
  createUpload,
  getFileUrl,
  deleteFile,
  UPLOADS_DIR
};

export default multerService;

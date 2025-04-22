const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Supported file types
const supportedFileTypes = {
  image: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  video: ['video/mp4', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav']
};

// Create multer storage configuration
const createStorage = (basePath, subfolder,idSubFolder) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      let destinationPath = path.join(basePath, subfolder || '');
      
      // For user-specific folders
      if (req.user?._id) {
        destinationPath = path.join(destinationPath, req.user._id.toString(),idSubFolder);
      }
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
      }
      
      cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
};

// Create file filter
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only ${allowedTypes.join(', ')} are allowed.`), false);
    }
  };
};

// Initialize upload middleware
const createUploader = (options = {}) => {
  const {
    basePath = path.join(__dirname, '../files'),
    subfolder = '',
    idSubFolder = '',
    fieldName = 'file',
    fileTypes = ['image', 'video', 'document'], // Default to all types
    maxSize = 10 * 1024 * 1024 // 10MB
  } = options;

  // Combine allowed MIME types
  const allowedTypes = fileTypes.flatMap(type => supportedFileTypes[type] || []);

  return multer({
    storage: createStorage(basePath, subfolder, idSubFolder),
    fileFilter: createFileFilter(allowedTypes),
    limits: { fileSize: maxSize }
  }).single(fieldName);
};


// Delete file utility
const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, '../files', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
};

// Get relative path (for storing in DB)
// Get relative path (for storing in DB)
const getRelativePath = (fullPath) => {
  const basePath = path.join(__dirname, '../files');
  const relativePath = path.relative(basePath, fullPath);
  // Normalize path separators to forward slashes
  return relativePath.split(path.sep).join('/');
};

module.exports = {
  createUploader,
  deleteFile,
  getRelativePath,
  supportedFileTypes
};
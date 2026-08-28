const cloudinary = require('../config/cloudinary');
const sharp = require('sharp');

const uploadImage = async (fileBuffer, folder = 'event-handling/profiles') => {
  try {
    // Resize and compress with sharp before uploading
    const processedBuffer = await sharp(fileBuffer)
      .resize(500, 500, { fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload to Cloudinary using a stream
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      
      // Write buffer to stream
      const { Readable } = require('stream');
      const readable = new Readable();
      readable.push(processedBuffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    throw new Error('Failed to upload image');
  }
};

const deleteImage = async (publicId) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

module.exports = { uploadImage, deleteImage };

const cloudinary = require('cloudinary').v2;
const https = require('https');
const http = require('http');

class ImageService {
  constructor() {
    // Configure Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      this.cloudinaryEnabled = true;
      console.log('Cloudinary configured successfully');
    } else {
      console.warn('Cloudinary not configured. Image uploads will be limited.');
      this.cloudinaryEnabled = false;
    }
  }

  // Validate base64 image
  isValidBase64Image(str) {
    try {
      if (!str || typeof str !== 'string') return false;
      
      const regex = /^data:image\/(png|jpg|jpeg|gif|webp|bmp|svg\+xml);base64,/i;
      if (!regex.test(str)) return false;
      
      const base64 = str.replace(regex, '');
      if (!base64) return false;
      
      // Check if base64 is valid
      const buffer = Buffer.from(base64, 'base64');
      return buffer.length > 0 && buffer.length < 10000000; // Less than 10MB
    } catch (e) {
      console.error('Base64 validation error:', e.message);
      return false;
    }
  }

  // Validate image URL with timeout
  async isValidImageUrl(url) {
    try {
      if (!url || typeof url !== 'string') return false;
      
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(url)) return false;

      // Check for common image extensions or trusted domains
      const imagePattern = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
      const trustedDomains = ['unsplash.com', 'imgur.com', 'cloudinary.com', 'images.unsplash.com'];
      
      const hasTrustedDomain = trustedDomains.some(domain => url.includes(domain));
      
      if (imagePattern.test(url) || hasTrustedDomain) {
        // For trusted domains, do a quick HEAD request to verify
        return await this.checkUrlAccessibility(url);
      }
      
      return false;
    } catch (e) {
      console.error('URL validation error:', e.message);
      return false;
    }
  }

  // Check if URL is accessible with timeout
  async checkUrlAccessibility(url, timeout = 5000) {
    return new Promise((resolve) => {
      try {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.request(url, { method: 'HEAD', timeout }, (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        });

        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });

        req.on('error', () => {
          resolve(false);
        });

        req.setTimeout(timeout);
        req.end();
      } catch (error) {
        resolve(false);
      }
    });
  }

  // Upload base64 to Cloudinary with timeout
  async uploadBase64ToCloudinary(base64Data, options = {}) {
    if (!this.cloudinaryEnabled) {
      throw new Error('Cloudinary is not configured');
    }

    try {
      const defaultOptions = {
        folder: 'scam-reports',
        resource_type: 'image',
        format: 'jpg',
        quality: 'auto:good',
        fetch_format: 'auto',
        timeout: 30000, // 30 second timeout
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      };

      const uploadOptions = { ...defaultOptions, ...options };
      
      console.log('Starting base64 upload to Cloudinary...');
      const result = await Promise.race([
        cloudinary.uploader.upload(base64Data, uploadOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 30000)
        )
      ]);
      
      console.log('Base64 upload successful:', result.public_id);
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      };
    } catch (error) {
      console.error('Cloudinary base64 upload error:', error.message);
      throw new Error(`Failed to upload base64 image: ${error.message}`);
    }
  }

  // Upload URL to Cloudinary with timeout
  async uploadUrlToCloudinary(imageUrl, options = {}) {
    if (!this.cloudinaryEnabled) {
      throw new Error('Cloudinary is not configured');
    }

    try {
      const defaultOptions = {
        folder: 'scam-reports',
        resource_type: 'image',
        format: 'jpg',
        quality: 'auto:good',
        fetch_format: 'auto',
        timeout: 30000, // 30 second timeout
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      };

      const uploadOptions = { ...defaultOptions, ...options };
      
      console.log('Starting URL upload to Cloudinary:', imageUrl);
      const result = await Promise.race([
        cloudinary.uploader.upload(imageUrl, uploadOptions),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 30000)
        )
      ]);
      
      console.log('URL upload successful:', result.public_id);
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      };
    } catch (error) {
      console.error('Cloudinary URL upload error:', error.message);
      throw new Error(`Failed to upload image from URL: ${error.message}`);
    }
  }

  // Delete image from Cloudinary
  async deleteFromCloudinary(publicId) {
    if (!this.cloudinaryEnabled || !publicId) {
      return { result: 'not_found' };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Image deleted from Cloudinary:', publicId);
      return result;
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error.message);
      throw error;
    }
  }

  // Process any type of image input with improved logic
  async processImage(imageData, imageType = 'auto', forceUpload = false) {
    try {
      console.log('Processing image:', { imageType, hasData: !!imageData, forceUpload });
      
      let result = { 
        url: null, 
        publicId: null, 
        type: null, 
        metadata: null,
        processed: false 
      };

      if (!imageData) {
        console.log('No image data provided');
        return result;
      }

      // Auto-detect image type if not specified
      if (imageType === 'auto') {
        if (typeof imageData === 'string') {
          if (imageData.startsWith('data:image/')) {
            imageType = 'base64';
          } else if (imageData.startsWith('http')) {
            imageType = 'url';
          } else {
            imageType = 'url'; // Assume it's a URL
          }
        }
      }

      console.log('Detected image type:', imageType);

      if (imageType === 'base64') {
        if (!this.isValidBase64Image(imageData)) {
          throw new Error('Invalid base64 image format. Supported formats: PNG, JPG, JPEG, GIF, WebP, BMP, SVG under 10MB');
        }

        if (this.cloudinaryEnabled) {
          const uploadResult = await this.uploadBase64ToCloudinary(imageData);
          result.url = uploadResult.url;
          result.publicId = uploadResult.publicId;
          result.metadata = {
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
            bytes: uploadResult.bytes
          };
          result.processed = true;
        } else {
          // Fallback: keep as base64 (not recommended for production)
          result.url = imageData;
        }
        result.type = 'base64';

      } else if (imageType === 'url') {
        // First validate the URL
        const isValidUrl = await this.isValidImageUrl(imageData);
        if (!isValidUrl) {
          throw new Error('Invalid image URL format or URL is not accessible');
        }

        // For URLs, only upload to Cloudinary if explicitly requested or if it's not already a Cloudinary URL
        const isCloudinaryUrl = imageData.includes('cloudinary.com');
        const shouldUpload = forceUpload || (!isCloudinaryUrl && this.cloudinaryEnabled);

        if (shouldUpload && this.cloudinaryEnabled) {
          try {
            console.log('Uploading URL to Cloudinary...');
            const uploadResult = await this.uploadUrlToCloudinary(imageData);
            result.url = uploadResult.url;
            result.publicId = uploadResult.publicId;
            result.metadata = {
              format: uploadResult.format,
              width: uploadResult.width,
              height: uploadResult.height,
              bytes: uploadResult.bytes
            };
            result.processed = true;
            console.log('URL successfully uploaded to Cloudinary');
          } catch (uploadError) {
            // If upload fails, keep original URL
            console.warn('Failed to upload URL to Cloudinary, keeping original:', uploadError.message);
            result.url = imageData;
            result.processed = false;
          }
        } else {
          // Keep original URL
          result.url = imageData;
          result.processed = false;
          console.log('Using original URL without uploading to Cloudinary');
        }
        result.type = 'url';
      } else {
        throw new Error(`Unsupported image type: ${imageType}`);
      }

      console.log('Image processing completed:', { 
        url: result.url ? 'present' : 'null', 
        processed: result.processed,
        type: result.type 
      });
      
      return result;
    } catch (error) {
      console.error('Image processing error:', error.message);
      throw error;
    }
  }

  // Get optimized image URL
  getOptimizedImageUrl(publicId, options = {}) {
    if (!this.cloudinaryEnabled || !publicId) {
      return null;
    }

    const defaultOptions = {
      width: 800,
      height: 600,
      crop: 'fill',
      quality: 'auto:good',
      fetch_format: 'auto'
    };

    const transformOptions = { ...defaultOptions, ...options };
    
    return cloudinary.url(publicId, transformOptions);
  }

  // Generate multiple image sizes
  generateImageSizes(publicId) {
    if (!this.cloudinaryEnabled || !publicId) {
      return {};
    }

    return {
      thumbnail: this.getOptimizedImageUrl(publicId, { width: 150, height: 150, crop: 'thumb' }),
      small: this.getOptimizedImageUrl(publicId, { width: 400, height: 300 }),
      medium: this.getOptimizedImageUrl(publicId, { width: 800, height: 600 }),
      large: this.getOptimizedImageUrl(publicId, { width: 1200, height: 900 }),
      original: cloudinary.url(publicId, { quality: 'auto:best' })
    };
  }

  // Health check method
  async healthCheck() {
    const status = {
      cloudinaryEnabled: this.cloudinaryEnabled,
      timestamp: new Date().toISOString()
    };

    if (this.cloudinaryEnabled) {
      try {
        // Test Cloudinary connection
        await cloudinary.api.ping();
        status.cloudinaryStatus = 'connected';
      } catch (error) {
        status.cloudinaryStatus = 'error';
        status.cloudinaryError = error.message;
      }
    }

    return status;
  }
}

module.exports = new ImageService();
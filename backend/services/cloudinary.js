const fs = require('fs');
const { v2: cloudinary } = require('cloudinary'); // Fixed import

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log('No file path provided');
            return null;
        }

        // Check if file exists
        if (!fs.existsSync(localFilePath)) {
            console.log('File does not exist at path:', localFilePath);
            return null;
        }

        console.log('Attempting to upload file:', localFilePath);
        
        // Upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "reports", // Optional: organize uploads in a folder
        });
        
        // File has been uploaded successfully
        console.log("File uploaded to Cloudinary successfully:", response.secure_url);
        
        // Remove the locally saved temporary file after successful upload
        fs.unlinkSync(localFilePath);
        
        return response;
        
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        
        // Remove the locally saved temporary file if upload failed
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
                console.log('Temporary file cleaned up after error');
            }
        } catch (cleanupError) {
            console.error('Error cleaning up temporary file:', cleanupError);
        }
        
        return null;
    }
};

// Helper function to delete from cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        
        const response = await cloudinary.uploader.destroy(publicId);
        console.log('Image deleted from Cloudinary:', publicId);
        return response;
        
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return null;
    }
};

module.exports = { 
    uploadOnCloudinary,
    deleteFromCloudinary
};
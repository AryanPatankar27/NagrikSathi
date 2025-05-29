const Report = require('../models/Report');
const imageService = require('../services/imageServices');
const { uploadOnCloudinary }=require('../services/cloudinary');
const path = require('path');
const fs = require('fs');

// GET all reports
const getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    const reports = await Report.find(filter)
      .sort({ dateReported: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'); // Exclude version field
      
    const total = await Report.countDocuments(filter);
    
    res.json({
      success: true,
      reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReports: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message
    });
  }
};

// GET single report by ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id).select('-__v');
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message
    });
  }
};

// Update report status
const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, verified, or rejected'
      });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-__v');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: report
    });

  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
      error: error.message
    });
  }
};

// Handle extension report submissions
const submitExtensionReport = async (req, res) => {
  try {
    console.log('Processing extension report submission...');
    
    const { 
      title, 
      description, 
      url, 
      screenshot, 
      screenshotUrl, 
      category, 
      notes, 
      source,
      imageType = 'auto',
      forceUpload = false
    } = req.body;

    // Validate required fields
    if (!title || !url || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, url, and category are required'
      });
    }

    console.log('Required fields validated');

    let imageResult = { url: null, publicId: null, type: null, metadata: null };
    
    // Process image if provided
    try {
      if (screenshot) {
        console.log('Processing base64 screenshot...');
        imageResult = await imageService.processImage(screenshot, 'base64', forceUpload);
      } else if (screenshotUrl) {
        console.log('Processing screenshot URL:', screenshotUrl);
        imageResult = await imageService.processImage(screenshotUrl, imageType, forceUpload);
      }
      console.log('Image processing completed:', { hasUrl: !!imageResult.url, processed: imageResult.processed });
    } catch (imageError) {
      console.error('Image processing error:', imageError.message);
      return res.status(400).json({
        success: false,
        message: `Image processing error: ${imageError.message}`
      });
    }

    // Create report object
    const reportData = {
      title,
      description: description || `URL: ${url}\n\nNotes: ${notes || 'No additional notes.'}`,
      url,
      category,
      source: source || 'Chrome Extension',
      screenshotUrl: imageResult.url,
      screenshotPublicId: imageResult.publicId,
      imageType: imageResult.type,
      imageMetadata: imageResult.metadata,
      reportedBy: 'Extension User',
      notes,
      status: 'pending'
    };

    console.log('Creating report in database...');

    // Save to database
    const report = new Report(reportData);
    await report.save();
    
    console.log('Extension report saved successfully:', report._id);
    
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        id: report._id,
        title: report.title,
        category: report.category,
        status: report.status,
        dateReported: report.dateReported,
        screenshotUrl: report.screenshotUrl,
        imageProcessed: imageResult.processed || false
      }
    });

  } catch (error) {
    console.error('Extension report submission error:', error);
    
    // Clean up uploaded image if report creation failed
    if (error.name !== 'ValidationError' && imageResult?.publicId) {
      try {
        await imageService.deleteFromCloudinary(imageResult.publicId);
        console.log('Cleaned up uploaded image after error');
      } catch (cleanupError) {
        console.error('Error cleaning up image:', cleanupError.message);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while submitting report',
      error: error.message
    });
  }
};

// Manual form report submission through url
const submitManualReport = async (req, res) => {
  try {
    console.log('Processing manual report submission...');
    
    const { 
      title, 
      source, 
      category, 
      location, 
      description, 
      screenshot,
      screenshotUrl,
      reporterName, 
      contactInfo,
      url,
      imageType = 'auto',
      forceUpload = false
    } = req.body;

    // Validate required fields
    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title and category are required'
      });
    }

    console.log('Required fields validated');

    let imageResult = { url: null, publicId: null, type: null, metadata: null };
    
    // Process image if provided
    try {
      if (screenshot) {
        console.log('Processing base64 screenshot...');
        imageResult = await imageService.processImage(screenshot, 'base64', forceUpload);
      } else if (screenshotUrl) {
        console.log('Processing screenshot URL:', screenshotUrl);
        imageResult = await imageService.processImage(screenshotUrl, imageType, forceUpload);
      }
      console.log('Image processing completed:', { hasUrl: !!imageResult.url, processed: imageResult.processed });
    } catch (imageError) {
      console.error('Image processing error:', imageError.message);
      return res.status(400).json({
        success: false,
        message: `Image processing error: ${imageError.message}`
      });
    }

    // Create report object
    const reportData = {
      title,
      source: source || 'Manual Form',
      category,
      location,
      description,
      url,
      screenshotUrl: imageResult.url,
      screenshotPublicId: imageResult.publicId,
      imageType: imageResult.type,
      imageMetadata: imageResult.metadata,
      reporterName,
      contactInfo,
      reportedBy: reporterName || 'Anonymous User',
      status: 'pending'
    };

    console.log('Creating report in database...');

    // Save to database
    const report = new Report(reportData);
    await report.save();

    console.log('Manual report saved successfully:', report._id);

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        id: report._id,
        title: report.title,
        category: report.category,
        status: report.status,
        dateReported: report.dateReported,
        screenshotUrl: report.screenshotUrl,
        imageProcessed: imageResult.processed || false
      }
    });
  } catch (error) {
    console.error('Manual report submission error:', error);
    
    // Clean up uploaded image if report creation failed
    if (error.name !== 'ValidationError' && imageResult?.publicId) {
      try {
        await imageService.deleteFromCloudinary(imageResult.publicId);
        console.log('Cleaned up uploaded image after error');
      } catch (cleanupError) {
        console.error('Error cleaning up image:', cleanupError.message);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error submitting report',
      error: error.message
    });
  }
};

//Manual form report submission through image file
const submitManualReportWithFile = async (req, res) => {
  let tempFilePath = null;
  let uploadedImageUrl = null;
  let uploadedImagePublicId = null;
  
  try {
    console.log('Processing manual report submission with file upload...');
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided. Please upload an image file.'
      });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Extract form data with correct field names
    const {
      title,
      source,
      category,
      location,      // optional
      description,
      name,          // optional - reporter name
      contactInfo    // optional
    } = req.body;

    // Validate required fields
    if (!title || !source || !category || !description) {
      // Clean up uploaded file before returning error
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, source, category, and description are required'
      });
    }

    console.log('Required fields validated');

    // Upload image to Cloudinary
    try {
      tempFilePath = req.file.path;
      console.log('Uploading image to Cloudinary...');
      
      const cloudinaryResponse = await uploadOnCloudinary(tempFilePath);
      
      if (!cloudinaryResponse) {
        return res.status(400).json({
          success: false,
          message: 'Failed to upload image to Cloudinary. Please try again.'
        });
      }

      uploadedImageUrl = cloudinaryResponse.secure_url;
      uploadedImagePublicId = cloudinaryResponse.public_id;
      
      console.log('Image uploaded successfully to Cloudinary:', uploadedImageUrl);
      
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError.message);
      
      // Clean up temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      return res.status(400).json({
        success: false,
        message: `Image upload failed: ${uploadError.message}`
      });
    }

    // Create report object with correct field mapping
    const reportData = {
      title,
      source,
      category,
      location: location || '',           // optional field
      description,
      screenshotUrl: uploadedImageUrl,
      screenshotPublicId: uploadedImagePublicId,
      imageType: 'uploaded_file',
      name: name || '',                   // optional reporter name
      contactInfo: contactInfo || '',     // optional contact info
      reportedBy: name || 'Anonymous User',
      status: 'pending',
      dateReported: new Date()
    };

    console.log('Creating report in database...');

    // Save to database
    const report = new Report(reportData);
    await report.save();

    console.log('Manual report with file saved successfully:', report._id);

    res.status(201).json({
      success: true,
      message: 'Report with image file submitted successfully',
      data: {
        id: report._id,
        title: report.title,
        source: report.source,
        category: report.category,
        location: report.location,
        description: report.description,
        status: report.status,
        dateReported: report.dateReported,
        screenshotUrl: report.screenshotUrl,
        name: report.name,
        contactInfo: report.contactInfo,
        imageSource: 'uploaded_file'
      }
    });

  } catch (error) {
    console.error('Manual report with file submission error:', error);
    
    // Clean up temp file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log('Cleaned up temporary file');
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError.message);
      }
    }
    
    // Clean up uploaded image from Cloudinary if report creation failed
    if (uploadedImagePublicId && error.name !== 'ValidationError') {
      try {
        const { v2: cloudinary } = require('cloudinary');
        await cloudinary.uploader.destroy(uploadedImagePublicId);
        console.log('Cleaned up uploaded image from Cloudinary after error');
      } catch (cleanupError) {
        console.error('Error cleaning up Cloudinary image:', cleanupError.message);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Error submitting report with file',
      error: error.message
    });
  }
};


// Delete report
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Delete image from Cloudinary if exists
    if (report.screenshotPublicId) {
      try {
        await imageService.deleteFromCloudinary(report.screenshotPublicId);
        console.log('Image deleted from Cloudinary:', report.screenshotPublicId);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError.message);
        // Continue with report deletion even if image deletion fails
      }
    }
    
    await Report.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};

// Get reports statistics
const getReportsStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const categoryStats = await Report.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const sourceStats = await Report.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const totalReports = await Report.countDocuments();
    const recentReports = await Report.countDocuments({
      dateReported: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const reportsWithImages = await Report.countDocuments({
      screenshotUrl: { $ne: null }
    });

    // Get ImageService health status
    const imageServiceHealth = await imageService.healthCheck();
    
    res.json({
      success: true,
      stats: {
        statusBreakdown: stats,
        categoryBreakdown: categoryStats,
        sourceBreakdown: sourceStats,
        totalReports,
        recentReports,
        reportsWithImages,
        imageServiceHealth
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllReports,
  getReportById,
  updateReportStatus,
  submitExtensionReport,
  submitManualReport,
  submitManualReportWithFile,
  deleteReport,
  getReportsStats,
};
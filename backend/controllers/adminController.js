const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token for Admin
const generateToken = (adminId) => {
  return jwt.sign(
    { userId: adminId, type: 'admin' }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Admin Login Controller
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findByEmail(email);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (admin.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated. Please contact super admin.'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await admin.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login and reset failed attempts
    await admin.updateLastLogin();

    // Generate token
    const token = generateToken(admin._id);

    // Return response without password
    const adminResponse = {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      fullName: admin.fullName,
      permissions: admin.permissions,
      isSuper: admin.isSuper,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt
    };

    // Log the login attempt
    console.log(`Admin login successful: ${admin.email} at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: adminResponse
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Admin Signup Controller (Only for super admin or authorized admin)
const signup = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, fullName, permissions } = req.body;
    const createdBy = req.admin ? req.admin.userId : null;

    // Check if current admin has permission to create new admins
    if (req.admin && req.admin.type === 'admin') {
      const currentAdmin = await Admin.findById(req.admin.userId);
      if (!currentAdmin || (!currentAdmin.isSuper && !currentAdmin.hasPermission('manage_admins'))) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to create admin accounts'
        });
      }
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const admin = new Admin({
      email: email.toLowerCase().trim(),
      password,
      fullName: fullName || '',
      permissions: permissions || ['read'],
      role: 'admin',
      createdBy: createdBy
    });

    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    // Return response without password
    const adminResponse = {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      fullName: admin.fullName,
      permissions: admin.permissions,
      isSuper: admin.isSuper,
      createdAt: admin.createdAt
    };

    // Log the admin creation
    console.log(`New admin created: ${admin.email} by ${createdBy || 'system'} at ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      token,
      admin: adminResponse
    });

  } catch (error) {
    console.error('Admin signup error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during admin creation'
    });
  }
};

// Get Admin Profile Controller
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.userId)
      .select('-password -loginAttempts -lockUntil')
      .populate('createdBy', 'email fullName');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        fullName: admin.fullName,
        permissions: admin.permissions,
        isSuper: admin.isSuper,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdBy: admin.createdBy,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update Admin Profile Controller
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, fullName, permissions } = req.body;
    const adminId = req.admin.userId;

    // Get current admin to check permissions
    const currentAdmin = await Admin.findById(adminId);
    if (!currentAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if trying to modify permissions and if current admin has permission
    if (permissions && !currentAdmin.isSuper && !currentAdmin.hasPermission('manage_admins')) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to modify admin permissions'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingAdmin = await Admin.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: adminId } 
      });
      
      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (email) updateData.email = email.toLowerCase().trim();
    if (fullName !== undefined) updateData.fullName = fullName;
    if (permissions && (currentAdmin.isSuper || currentAdmin.hasPermission('manage_admins'))) {
      updateData.permissions = permissions;
    }

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true, select: '-password -loginAttempts -lockUntil' }
    );

    res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        fullName: admin.fullName,
        permissions: admin.permissions,
        isSuper: admin.isSuper,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    });

  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change Admin Password Controller
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.userId;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await admin.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    // Log password change
    console.log(`Admin password changed: ${admin.email} at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  signup,
  getProfile,
  updateProfile,
  changePassword
};
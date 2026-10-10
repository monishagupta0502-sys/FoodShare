const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new donor or ngo
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, organizationName, registrationNumber } = req.body;

    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be self-registered.',
        data: null,
      });
    }

    if (!['donor', 'ngo'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either donor or ngo.',
        data: null,
      });
    }

    if (role === 'ngo' && (!organizationName || !registrationNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Organization name and registration number are required for NGO accounts.',
        data: null,
      });
    }

    const emailNorm = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailNorm });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
        data: null,
      });
    }

    const user = await User.create({
      name,
      email: emailNorm,
      password,
      role,
      phone: phone || '',
      address: address || '',
      organizationName: role === 'ngo' ? organizationName : undefined,
      registrationNumber: role === 'ngo' ? registrationNumber : undefined,
    });

    const token = generateToken(user._id);

    // Exclude password from response
    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
        data: null,
      });
    }

    let emailNorm = email.toLowerCase().trim();
    if (emailNorm === 'donor' || emailNorm === 'donor@foodshare.com') emailNorm = 'donor@foodshare.org';
    if (emailNorm === 'ngo' || emailNorm === 'ego' || emailNorm === 'ngo@foodshare.com' || emailNorm === 'ego@foodshare.org') emailNorm = 'ngo@foodshare.org';
    if (emailNorm === 'admin' || emailNorm === 'admin@foodshare.com') emailNorm = 'admin@foodshare.org';

    const user = await User.findOne({ email: emailNorm }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        data: null,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        data: null,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact an administrator.',
        data: null,
      });
    }

    const token = generateToken(user._id);
    const userResponse = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: userResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      message: 'Current profile retrieved.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

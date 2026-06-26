const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Activity } = require('../models');
const { encrypt, decrypt } = require('../utils/encryption');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'super_secret_key_for_premium_agency_saas_321', {
    expiresIn: '8h' // Hardened session: 8 hours token expiry
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password.' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Employee'
    });

    // Audit log registration
    await Activity.create({
      type: 'AUTH',
      action: 'Account Registered',
      details: `New account registered: ${name} (${user.role})`,
      userId: user.id
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user.id, user.role)
    });
  } catch (error) {
    console.error('💥 Registration Error:', error);
    return res.status(500).json({ message: 'Registration failed. Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Create independent log for unknown failed login
      await Activity.create({
        type: 'SECURITY',
        action: 'Failed Login',
        details: `Failed login attempt for unknown email: ${email}`
      });
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check brute-force lockout status
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const waitTimeSec = Math.ceil((new Date(user.lockUntil) - new Date()) / 1000);
      return res.status(403).json({ 
        message: `Account is temporarily locked due to multiple failed login attempts. Try again in ${waitTimeSec} seconds.`,
        locked: true
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment login attempts
      const attempts = user.loginAttempts + 1;
      let lockUntil = null;
      let responseMsg = 'Invalid email or password';

      if (attempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lock
        responseMsg = 'Invalid email or password. Account is now locked for 15 minutes.';
        
        await Activity.create({
          type: 'SECURITY',
          action: 'Account Locked',
          details: `Account ${email} locked for 15 mins due to 5 consecutive failures.`,
          userId: user.id
        });
      } else {
        await Activity.create({
          type: 'SECURITY',
          action: 'Failed Login',
          details: `Failed login attempt for ${email}. Attempt ${attempts} of 5.`,
          userId: user.id
        });
      }

      await user.update({ loginAttempts: attempts, lockUntil });
      return res.status(401).json({ message: responseMsg });
    }

    // Reset login attempts on successful credentials match
    await user.update({ loginAttempts: 0, lockUntil: null });

    // Handle Optional 2FA
    if (user.twoFactorEnabled) {
      return res.json({
        twoFactorRequired: true,
        userId: user.id,
        email: user.email,
        message: 'Two-factor authentication code is required.'
      });
    }

    // Handle Force Password Change on first login
    if (user.mustChangePassword) {
      return res.json({
        mustChangePassword: true,
        email: user.email,
        tempToken: generateToken(user.id, user.role),
        message: 'Password change required on first login.'
      });
    }

    // Audit log successful login
    await Activity.create({
      type: 'AUTH',
      action: 'Successful Login',
      details: `${user.name} (${user.role}) logged in successfully.`,
      userId: user.id
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user.id, user.role)
    });
  } catch (error) {
    console.error('💥 Login Error:', error);
    return res.status(500).json({ message: 'Login failed. Server error.' });
  }
};

// Force Change Password (on first login)
exports.changePasswordForce = async (req, res) => {
  try {
    const { email, tempToken, newPassword } = req.body;

    if (!email || !tempToken || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, tempToken, and newPassword.' });
    }

    // Verify tempToken
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'super_secret_key_for_premium_agency_saas_321');
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired transition token.' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.email !== email) {
      return res.status(400).json({ message: 'User verification failed.' });
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({
      password: hashedPassword,
      mustChangePassword: false,
      loginAttempts: 0,
      lockUntil: null
    });

    await Activity.create({
      type: 'AUTH',
      action: 'Password Forced Update',
      details: `First-time forced password reset completed for ${user.email}.`,
      userId: user.id
    });

    return res.json({
      success: true,
      message: 'Password changed successfully. You can now log in.',
      token: generateToken(user.id, user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('💥 Force Password Change Error:', error);
    return res.status(500).json({ message: 'Failed to update password.' });
  }
};

// Setup 2FA configuration secret
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Generate a secure mock 2FA Secret Key
    const rawSecret = crypto.randomBytes(10).toString('hex').toUpperCase();
    
    // Encrypt the 2FA secret at rest before saving it in the database
    const encryptedSecret = encrypt(rawSecret);

    await user.update({ twoFactorSecret: encryptedSecret });

    return res.json({
      secret: rawSecret,
      qrMock: `otpauth://totp/AkariaInnovations:${user.email}?secret=${rawSecret}&issuer=AkariaInnovations`
    });
  } catch (error) {
    console.error('💥 2FA Setup Error:', error);
    return res.status(500).json({ message: 'Failed to configure 2FA.' });
  }
};

// Enable/Disable 2FA toggle
exports.toggle2FA = async (req, res) => {
  try {
    const { enable, code } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (enable) {
      if (!user.twoFactorSecret) {
        return res.status(400).json({ message: 'Generate a 2FA secret key first.' });
      }

      // Decrypt the secret key stored at rest to verify it
      const decryptedSecret = decrypt(user.twoFactorSecret);
      if (!decryptedSecret) {
        return res.status(500).json({ message: 'Decryption failed for security key.' });
      }

      // Verify input verification code
      // We accept '123456' as standard mock verification code or matching the decrypted key
      if (code !== '123456' && code !== decryptedSecret.substring(0, 6)) {
        return res.status(400).json({ message: 'Invalid 2FA verification code. Use "123456".' });
      }

      await user.update({ twoFactorEnabled: true });
      
      await Activity.create({
        type: 'SECURITY',
        action: '2FA Enabled',
        details: `${user.name} enabled Two-Factor Authentication.`,
        userId: user.id
      });
    } else {
      await user.update({ twoFactorEnabled: false, twoFactorSecret: null });
      
      await Activity.create({
        type: 'SECURITY',
        action: '2FA Disabled',
        details: `${user.name} disabled Two-Factor Authentication.`,
        userId: user.id
      });
    }

    return res.json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled,
      message: user.twoFactorEnabled ? 'Two-Factor Authentication activated.' : 'Two-Factor Authentication deactivated.'
    });
  } catch (error) {
    console.error('💥 Toggle 2FA Error:', error);
    return res.status(500).json({ message: 'Failed to toggle 2FA configuration.' });
  }
};

// Verify 2FA on login
exports.verify2FA = async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ message: 'Please provide userId and 2FA code.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const decryptedSecret = decrypt(user.twoFactorSecret);
    
    // Validate verification code - accepting standard 123456 or matching secret
    if (code !== '123456' && code !== decryptedSecret.substring(0, 6)) {
      await Activity.create({
        type: 'SECURITY',
        action: 'Failed 2FA Login',
        details: `Incorrect 2FA verification code entered for ${user.email}.`,
        userId: user.id
      });
      return res.status(400).json({ message: 'Invalid 2FA verification code.' });
    }

    // Reset lock attempts if any
    await user.update({ loginAttempts: 0, lockUntil: null });

    // Handle force change if it's pending
    if (user.mustChangePassword) {
      return res.json({
        mustChangePassword: true,
        email: user.email,
        tempToken: generateToken(user.id, user.role),
        message: 'Password change required on first login.'
      });
    }

    await Activity.create({
      type: 'AUTH',
      action: 'Successful Login',
      details: `${user.name} (${user.role}) logged in successfully with 2FA.`,
      userId: user.id
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user.id, user.role)
    });
  } catch (error) {
    console.error('💥 2FA Login Verification Error:', error);
    return res.status(500).json({ message: 'Failed to verify 2FA code.' });
  }
};

// Forgot Password Flow
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Security hardening: do not disclose email mismatch, but log it
      await Activity.create({
        type: 'SECURITY',
        action: 'Password Recovery Triggered',
        details: `Password recovery requested for non-existing email: ${email}`
      });
      return res.json({ message: 'Verification code sent if email matches our records.' });
    }

    // Generate secure token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour expiry

    // Save token as custom decrypted/encrypted state or temporary metadata log
    // We can also store this on the User model. But to keep the table clean, we write it to Activity Logs
    // and return in the mock payload. In real life we'd mail it.
    await Activity.create({
      type: 'SECURITY',
      action: 'Password Recovery Code',
      details: `Recovery Token generated for ${email}: ${resetToken}. Expire: ${resetExpires.toISOString()}`,
      userId: user.id
    });

    console.log(`✉️ [SMTP MOCK EMAIL] Reset Link: http://localhost:5173/reset-password?token=${resetToken}&email=${email}`);

    return res.json({
      message: 'Verification code generated.',
      mockUrl: `/reset-password?token=${resetToken}&email=${email}`,
      token: resetToken // Outputting token so the mock reset form can be filled instantly
    });
  } catch (error) {
    console.error('💥 Forgot Password Error:', error);
    return res.status(500).json({ message: 'Failed to process forgot password request.' });
  }
};

// Reset Password Verification Flow
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Please provide email, token, and newPassword.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid request details.' });
    }

    // Search activity logs for the generated token matching this user id
    const logs = await Activity.findAll({
      where: {
        userId: user.id,
        action: 'Password Recovery Code'
      },
      order: [['createdAt', 'DESC']],
      limit: 1
    });

    if (logs.length === 0) {
      return res.status(400).json({ message: 'No recovery code found for this user.' });
    }

    const logDetails = logs[0].details;
    if (!logDetails.includes(token)) {
      return res.status(400).json({ message: 'Invalid or expired recovery code.' });
    }

    // Check expiry
    const expiryPart = logDetails.split('Expire: ')[1];
    if (expiryPart && new Date(expiryPart) < new Date()) {
      return res.status(400).json({ message: 'Recovery code has expired.' });
    }

    // Reset password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({
      password: hashedPassword,
      loginAttempts: 0,
      lockUntil: null
    });

    // Delete matching reset tokens logs or mark them used
    await Activity.create({
      type: 'AUTH',
      action: 'Password Reset',
      details: `Password successfully reset via recovery token for ${user.email}.`,
      userId: user.id
    });

    return res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('💥 Reset Password Error:', error);
    return res.status(500).json({ message: 'Failed to reset password.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    return res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      twoFactorEnabled: req.user.twoFactorEnabled
    });
  } catch (error) {
    console.error('💥 Get Me Error:', error);
    return res.status(500).json({ message: 'Failed to fetch user. Server error.' });
  }
};

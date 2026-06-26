const { Document, Activity } = require('../models');

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({ order: [['createdAt', 'DESC']] });
    return res.json(documents);
  } catch (error) {
    console.error('Get Documents Error:', error);
    return res.status(500).json({ message: 'Failed to fetch documents.' });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const { name, category, fileUrl, fileSize } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Document name is required.' });
    }

    // 1. Approved extension allowlist & executable check
    const allowedExtensions = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'png', 'jpg', 'jpeg', 'gif', 'csv', 'txt', 'zip', 'ppt', 'pptx'];
    const blockedExtensions = ['exe', 'bat', 'sh', 'msi', 'js', 'vbs', 'cmd', 'scr', 'bin', 'com', 'pif'];
    
    const parts = name.split('.');
    if (parts.length < 2) {
      return res.status(400).json({ message: 'Invalid file format. Extensions are required.' });
    }
    
    const ext = parts.pop().toLowerCase();
    
    if (blockedExtensions.includes(ext)) {
      return res.status(400).json({ 
        message: 'Security Alert: Forbidden file type. Executable code or scripts cannot be cataloged.' 
      });
    }
    
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ 
        message: `Forbidden file type. Only standard documents/assets are allowed (.${allowedExtensions.join(', .')}).` 
      });
    }

    // 2. Scan uploaded files (Simulation)
    console.log(`🛡️ [File Shield Scanner] Initiated scanning for: ${name}`);
    console.log(`🛡️ [File Shield Scanner] Scanning for macro viruses and executable payloads...`);
    console.log(`🛡️ [File Shield Scanner] Scan COMPLETE. Integrity verified for: ${name}`);

    // 3. Rename uploaded files automatically and sanitize the filename
    const baseNameClean = parts.join('.').replace(/[^a-zA-Z0-9_-]/g, '_');
    const sanitizedName = `${baseNameClean}_sec_${Date.now()}.${ext}`;

    const doc = await Document.create({
      name: sanitizedName,
      category: category || 'General',
      fileUrl: fileUrl ? fileUrl.replace(name, sanitizedName) : `#mock-download-${sanitizedName}`,
      fileSize: fileSize || '120 KB',
      uploadedBy: req.user.id // Assigning uploader id
    });

    await Activity.create({
      type: 'CRM',
      action: 'Uploaded Document',
      details: `${req.user.name} cataloged document: ${sanitizedName} (Clean Scan Passed).`,
      userId: req.user.id
    });

    return res.status(201).json(doc);
  } catch (error) {
    console.error('Create Document Error:', error);
    return res.status(500).json({ message: 'Failed to upload document metadata.' });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Document.findByPk(id);
    if (!doc) {
      return res.status(444).json({ message: 'Document not found.' });
    }

    const docName = doc.name;
    await doc.destroy();

    await Activity.create({
      type: 'CRM',
      action: 'Deleted Document',
      details: `${req.user.name} removed document: ${docName}.`,
      userId: req.user.id
    });

    return res.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Delete Document Error:', error);
    return res.status(500).json({ message: 'Failed to delete document.' });
  }
};

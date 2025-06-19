
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import pool from '../../utils/db-connection.js';
import { validateRequest } from '../middleware/validation.js';
import { z } from 'zod';

const router = express.Router();

// Validation schema for file management settings
const fileSettingsSchema = z.object({
  maxFileSizeKb: z.number().min(1).max(10240),
  allowedFileTypes: z.array(z.string().min(1)),
  maxFilesPerTask: z.number().min(1).max(20),
  enableFileUploads: z.boolean()
});

// Get file management settings
router.get('/file-management', authenticateToken, async (req, res) => {
  try {
    const [settings] = await pool.execute(`
      SELECT setting_key, setting_value, setting_type 
      FROM system_settings 
      WHERE setting_key IN ('max_file_size_kb', 'allowed_file_types', 'max_files_per_task', 'enable_file_uploads')
    `);

    const fileSettings = {
      maxFileSizeKb: 1,
      allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png', 'xlsx', 'csv'],
      maxFilesPerTask: 5,
      enableFileUploads: true
    };

    settings.forEach((setting: any) => {
      switch (setting.setting_key) {
        case 'max_file_size_kb':
          fileSettings.maxFileSizeKb = parseInt(setting.setting_value);
          break;
        case 'allowed_file_types':
          fileSettings.allowedFileTypes = JSON.parse(setting.setting_value);
          break;
        case 'max_files_per_task':
          fileSettings.maxFilesPerTask = parseInt(setting.setting_value);
          break;
        case 'enable_file_uploads':
          fileSettings.enableFileUploads = setting.setting_value === 'true';
          break;
      }
    });

    res.json(fileSettings);
  } catch (error) {
    console.error('Error fetching file settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch file settings' });
  }
});

// Update file management settings
router.post('/file-management', authenticateToken, validateRequest(fileSettingsSchema), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const { maxFileSizeKb, allowedFileTypes, maxFilesPerTask, enableFileUploads } = req.body;

    // Update each setting
    const updates = [
      ['max_file_size_kb', maxFileSizeKb.toString(), 'number'],
      ['allowed_file_types', JSON.stringify(allowedFileTypes), 'json'],
      ['max_files_per_task', maxFilesPerTask.toString(), 'number'],
      ['enable_file_uploads', enableFileUploads.toString(), 'boolean']
    ];

    for (const [key, value, type] of updates) {
      await pool.execute(`
        INSERT INTO system_settings (setting_key, setting_value, setting_type, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE 
          setting_value = VALUES(setting_value),
          updated_at = NOW()
      `, [key, value, type]);
    }

    res.json({ success: true, message: 'File settings updated successfully' });
  } catch (error) {
    console.error('Error updating file settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update file settings' });
  }
});

// Get specific setting value
router.get('/setting/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT setting_value, setting_type FROM system_settings WHERE setting_key = ?',
      [key]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }

    const setting = rows[0];
    let value = setting.setting_value;

    // Parse value based on type
    switch (setting.setting_type) {
      case 'number':
        value = parseInt(value);
        break;
      case 'boolean':
        value = value === 'true';
        break;
      case 'json':
        value = JSON.parse(value);
        break;
    }

    res.json({ success: true, value });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch setting' });
  }
});

export default router;

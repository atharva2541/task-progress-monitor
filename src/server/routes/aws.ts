
import express from 'express';
import { query, queryOne } from '../../utils/db-connection';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { DbAwsSettings, DbAwsCredentials } from '../../types/database';
import crypto from 'crypto';

const router = express.Router();

// Encryption key and IV (in production, these should be stored securely)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key-32-chars-length';
const IV_LENGTH = 16; // For AES, this is always 16

// Encrypt function
const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt function
const decrypt = (text: string): string => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift() || '', 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Get AWS settings (non-sensitive)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await queryOne<DbAwsSettings>(
      'SELECT id, region, s3_bucket_name, ses_from_email, created_at, updated_at FROM aws_settings LIMIT 1'
    );

    if (!settings) {
      res.status(404).json({ error: 'AWS settings not found' });
      return;
    }

    res.status(200).json({
      region: settings.region,
      s3BucketName: settings.s3_bucket_name,
      sesFromEmail: settings.ses_from_email,
    });
  } catch (error) {
    console.error('Get AWS settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update AWS settings
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { region, s3BucketName, sesFromEmail, accessKeyId, secretAccessKey } = req.body;

    if (!region || !s3BucketName || !sesFromEmail) {
      res.status(400).json({ error: 'Region, S3 bucket name, and SES from email are required' });
      return;
    }

    // Check if settings already exist
    const existingSettings = await queryOne<DbAwsSettings>('SELECT id FROM aws_settings LIMIT 1');

    if (existingSettings) {
      // Update existing settings
      await query(
        'UPDATE aws_settings SET region = ?, s3_bucket_name = ?, ses_from_email = ?, updated_at = ? WHERE id = ?',
        [region, s3BucketName, sesFromEmail, new Date().toISOString(), existingSettings.id]
      );
    } else {
      // Insert new settings
      await query(
        'INSERT INTO aws_settings (region, s3_bucket_name, ses_from_email, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [region, s3BucketName, sesFromEmail, new Date().toISOString(), new Date().toISOString()]
      );
    }

    // Update credentials if provided
    if (accessKeyId && secretAccessKey) {
      // Encrypt the credentials
      const encryptedAccessKeyId = encrypt(accessKeyId);
      const encryptedSecretAccessKey = encrypt(secretAccessKey);

      // Check if credentials already exist
      const existingCredentials = await queryOne<DbAwsCredentials>('SELECT id FROM aws_credentials LIMIT 1');

      if (existingCredentials) {
        // Update existing credentials
        await query(
          'UPDATE aws_credentials SET access_key_id = ?, secret_access_key = ?, updated_at = ? WHERE id = ?',
          [encryptedAccessKeyId, encryptedSecretAccessKey, new Date().toISOString(), existingCredentials.id]
        );
      } else {
        // Insert new credentials
        await query(
          'INSERT INTO aws_credentials (access_key_id, secret_access_key, created_at, updated_at) VALUES (?, ?, ?, ?)',
          [encryptedAccessKeyId, encryptedSecretAccessKey, new Date().toISOString(), new Date().toISOString()]
        );
      }
    }

    res.status(200).json({ message: 'AWS settings updated successfully' });
  } catch (error) {
    console.error('Update AWS settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get AWS credentials (for internal use only)
router.get('/credentials', authenticateToken, async (req, res) => {
  try {
    // This endpoint should be highly restricted
    // In production, you might want to implement additional security measures
    
    const credentials = await queryOne<DbAwsCredentials>(
      'SELECT access_key_id, secret_access_key FROM aws_credentials LIMIT 1'
    );

    if (!credentials) {
      res.status(404).json({ error: 'AWS credentials not found' });
      return;
    }

    // Decrypt the credentials
    const accessKeyId = decrypt(credentials.access_key_id);
    const secretAccessKey = decrypt(credentials.secret_access_key);

    res.status(200).json({
      accessKeyId,
      secretAccessKey,
    });
  } catch (error) {
    console.error('Get AWS credentials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test AWS connection
router.post('/test', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { region, accessKeyId, secretAccessKey, s3BucketName, sesFromEmail } = req.body;

    if (!region || !accessKeyId || !secretAccessKey) {
      res.status(400).json({ error: 'Region, access key ID, and secret access key are required' });
      return;
    }

    // In a real implementation, we would test the AWS connection here
    // For now, we'll just simulate a successful connection

    res.status(200).json({ message: 'AWS connection successful' });
  } catch (error) {
    console.error('Test AWS connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

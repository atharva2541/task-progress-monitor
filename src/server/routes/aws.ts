
import express from 'express';
import { query, queryOne } from '../../utils/db-connection';
import { authenticateToken, isAdmin } from '../middleware/auth';
import { DbAwsSettings, DbAwsCredentials } from '../../types/database';
import crypto from 'crypto';

const router = express.Router();

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-32ch';
const IV_LENGTH = 16;

// Ensure encryption key is 32 bytes
const getEncryptionKey = () => {
  const key = ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32);
  return Buffer.from(key);
};

// Encrypt function
const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipher('aes-256-cbc', getEncryptionKey());
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

// Decrypt function
const decrypt = (text: string): string => {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift() || '', 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipher('aes-256-cbc', getEncryptionKey());
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '';
  }
};

// Get AWS settings (non-sensitive)
router.get('/', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const settings = await queryOne<DbAwsSettings>(
      'SELECT id, region, s3_bucket_name, ses_from_email, created_at, updated_at FROM aws_settings LIMIT 1'
    );

    if (!settings) {
      res.status(200).json({
        region: 'us-east-1',
        s3BucketName: '',
        sesFromEmail: '',
      });
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
router.post('/', authenticateToken, isAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { region, s3BucketName, sesFromEmail, accessKeyId, secretAccessKey } = req.body;

    if (!region || !s3BucketName || !sesFromEmail) {
      res.status(400).json({ error: 'Region, S3 bucket name, and SES from email are required' });
      return;
    }

    // Check if settings already exist
    const existingSettings = await queryOne<DbAwsSettings>('SELECT id FROM aws_settings LIMIT 1');
    const now = new Date().toISOString();

    if (existingSettings) {
      // Update existing settings
      await query(
        'UPDATE aws_settings SET region = ?, s3_bucket_name = ?, ses_from_email = ?, updated_at = ? WHERE id = ?',
        [region, s3BucketName, sesFromEmail, now, existingSettings.id]
      );
    } else {
      // Insert new settings
      await query(
        'INSERT INTO aws_settings (region, s3_bucket_name, ses_from_email, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [region, s3BucketName, sesFromEmail, now, now]
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
          [encryptedAccessKeyId, encryptedSecretAccessKey, now, existingCredentials.id]
        );
      } else {
        // Insert new credentials
        await query(
          'INSERT INTO aws_credentials (access_key_id, secret_access_key, created_at, updated_at) VALUES (?, ?, ?, ?)',
          [encryptedAccessKeyId, encryptedSecretAccessKey, now, now]
        );
      }
    }

    res.status(200).json({ 
      success: true,
      message: 'AWS settings updated successfully' 
    });
  } catch (error) {
    console.error('Update AWS settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get AWS credentials (for internal use only)
router.get('/credentials', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
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

    if (!accessKeyId || !secretAccessKey) {
      res.status(500).json({ error: 'Failed to decrypt credentials' });
      return;
    }

    res.status(200).json({
      accessKeyId,
      secretAccessKey,
    });
  } catch (error) {
    console.error('Get AWS credentials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test AWS connection with actual validation
router.post('/test', authenticateToken, isAdmin, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { region, accessKeyId, secretAccessKey, s3BucketName, sesFromEmail } = req.body;

    if (!region || !accessKeyId || !secretAccessKey) {
      res.status(400).json({ error: 'Region, access key ID, and secret access key are required' });
      return;
    }

    // Import AWS SDK modules for testing
    try {
      const { SESClient, GetIdentityVerificationAttributesCommand } = await import('@aws-sdk/client-ses');
      const { S3Client, HeadBucketCommand } = await import('@aws-sdk/client-s3');

      const credentials = {
        accessKeyId,
        secretAccessKey,
      };

      // Test SES connection
      if (sesFromEmail) {
        const sesClient = new SESClient({ region, credentials });
        await sesClient.send(new GetIdentityVerificationAttributesCommand({
          Identities: [sesFromEmail]
        }));
      }

      // Test S3 connection
      if (s3BucketName) {
        const s3Client = new S3Client({ region, credentials });
        await s3Client.send(new HeadBucketCommand({
          Bucket: s3BucketName
        }));
      }

      res.status(200).json({ 
        success: true,
        message: 'AWS connection successful' 
      });
    } catch (awsError: any) {
      console.error('AWS connection test failed:', awsError);
      res.status(400).json({ 
        error: 'AWS connection failed',
        details: awsError.message 
      });
    }
  } catch (error) {
    console.error('Test AWS connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

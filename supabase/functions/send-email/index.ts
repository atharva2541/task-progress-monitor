
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, text }: EmailRequest = await req.json();

    console.log(`=== EMAIL SENDING DEBUG ===`);
    console.log(`Recipient: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML length: ${html.length}`);

    const AWS_REGION = Deno.env.get('AWS_REGION');
    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const SES_FROM_EMAIL = Deno.env.get('SES_FROM_EMAIL');

    console.log(`AWS Region: ${AWS_REGION}`);
    console.log(`SES From Email: ${SES_FROM_EMAIL}`);
    console.log(`AWS Access Key exists: ${!!AWS_ACCESS_KEY_ID}`);
    console.log(`AWS Secret Key exists: ${!!AWS_SECRET_ACCESS_KEY}`);

    if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !SES_FROM_EMAIL) {
      const missingVars = [];
      if (!AWS_REGION) missingVars.push('AWS_REGION');
      if (!AWS_ACCESS_KEY_ID) missingVars.push('AWS_ACCESS_KEY_ID');
      if (!AWS_SECRET_ACCESS_KEY) missingVars.push('AWS_SECRET_ACCESS_KEY');
      if (!SES_FROM_EMAIL) missingVars.push('SES_FROM_EMAIL');
      
      console.error(`Missing AWS SES configuration: ${missingVars.join(', ')}`);
      return new Response(JSON.stringify({ 
        error: 'Email service not configured',
        missing: missingVars
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Attempting to send email to ${to} from ${SES_FROM_EMAIL}`);

    // Create AWS SES request
    const sesEndpoint = `https://email.${AWS_REGION}.amazonaws.com`;
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const date = timestamp.substr(0, 8);

    console.log(`SES Endpoint: ${sesEndpoint}`);
    console.log(`Timestamp: ${timestamp}`);

    const params = new URLSearchParams({
      'Action': 'SendEmail',
      'Source': SES_FROM_EMAIL,
      'Destination.ToAddresses.member.1': to,
      'Message.Subject.Data': subject,
      'Message.Body.Html.Data': html,
      'Message.Body.Text.Data': text || html.replace(/<[^>]*>/g, ''),
      'Version': '2010-12-01'
    });

    console.log(`Request params prepared, body length: ${params.toString().length}`);

    // AWS Signature Version 4
    const algorithm = 'AWS4-HMAC-SHA256';
    const service = 'ses';
    const credentialScope = `${date}/${AWS_REGION}/${service}/aws4_request`;

    const canonicalRequest = [
      'POST',
      '/',
      '',
      `host:${sesEndpoint.replace('https://', '')}`,
      'x-amz-date:' + timestamp,
      '',
      'host;x-amz-date',
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(params.toString())).then(hash => 
        Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
      )
    ].join('\n');

    const stringToSign = [
      algorithm,
      timestamp,
      credentialScope,
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalRequest)).then(hash => 
        Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
      )
    ].join('\n');

    // Create signing key
    const kDate = await hmac(`AWS4${AWS_SECRET_ACCESS_KEY}`, date);
    const kRegion = await hmac(kDate, AWS_REGION);
    const kService = await hmac(kRegion, service);
    const kSigning = await hmac(kService, 'aws4_request');
    const signature = await hmac(kSigning, stringToSign, true);

    const authorizationHeader = `${algorithm} Credential=${AWS_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=host;x-amz-date, Signature=${signature}`;

    console.log(`Authorization header created, making request to SES...`);

    const response = await fetch(sesEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authorizationHeader,
        'X-Amz-Date': timestamp,
      },
      body: params.toString(),
    });

    console.log(`SES Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SES Error Response: ${errorText}`);
      throw new Error(`SES Error: ${response.status} ${errorText}`);
    }

    const responseText = await response.text();
    console.log('SES Success Response:', responseText);

    // Extract Message ID from response
    const messageIdMatch = responseText.match(/<MessageId>([^<]+)<\/MessageId>/);
    const messageId = messageIdMatch ? messageIdMatch[1] : null;
    
    if (messageId) {
      console.log(`Email sent successfully with Message ID: ${messageId}`);
    } else {
      console.log('Email sent but no Message ID found in response');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: messageId,
      sesResponse: responseText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Detailed error in send-email function:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function hmac(key: string | Uint8Array, data: string, hex = false): Promise<string | Uint8Array> {
  const keyBytes = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  const dataBytes = new TextEncoder().encode(data);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes);
  const signatureArray = new Uint8Array(signature);
  
  if (hex) {
    return Array.from(signatureArray).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  return signatureArray;
}

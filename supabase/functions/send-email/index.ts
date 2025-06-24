
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

    const AWS_REGION = Deno.env.get('AWS_REGION');
    const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const SES_FROM_EMAIL = Deno.env.get('SES_FROM_EMAIL');

    if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !SES_FROM_EMAIL) {
      throw new Error('Missing AWS SES configuration');
    }

    // Create AWS SES request
    const sesEndpoint = `https://email.${AWS_REGION}.amazonaws.com`;
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const date = timestamp.substr(0, 8);

    const params = new URLSearchParams({
      'Action': 'SendEmail',
      'Source': SES_FROM_EMAIL,
      'Destination.ToAddresses.member.1': to,
      'Message.Subject.Data': subject,
      'Message.Body.Html.Data': html,
      'Message.Body.Text.Data': text || html.replace(/<[^>]*>/g, ''),
      'Version': '2010-12-01'
    });

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

    const response = await fetch(sesEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authorizationHeader,
        'X-Amz-Date': timestamp,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SES Error: ${response.status} ${errorText}`);
    }

    const responseText = await response.text();
    console.log('SES Response:', responseText);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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

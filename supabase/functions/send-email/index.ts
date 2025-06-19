
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from }: EmailRequest = await req.json();

    // Get AWS credentials from Supabase secrets
    const region = Deno.env.get("AWS_REGION") || "us-east-1";
    const accessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
    const defaultFromEmail = Deno.env.get("SES_FROM_EMAIL") || "noreply@sbfc.com";

    if (!accessKeyId || !secretAccessKey) {
      console.error("AWS credentials not found");
      return new Response(
        JSON.stringify({ error: "AWS credentials not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Import AWS SES client
    const { SESClient, SendEmailCommand } = await import("https://esm.sh/@aws-sdk/client-ses@3.470.0");

    // Initialize SES client
    const sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      }
    });

    // Prepare email parameters
    const params = {
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Data: html,
          },
        },
        Subject: {
          Data: subject,
        },
      },
      Source: from || defaultFromEmail,
    };

    // Send email using SES
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);

    console.log("Email sent successfully via SES:", response);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: response.MessageId 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email via SES:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { name, email, role, roles, password_expiry_date, is_first_login } = await req.json()

    console.log('Creating user with data:', { name, email, role, roles })

    // Check if user already exists in auth.users
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error checking existing users:', listError)
      return new Response(
        JSON.stringify({ error: { message: 'Failed to check existing users: ' + listError.message } }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    const existingUser = existingUsers?.users?.find(user => user.email === email)
    
    if (existingUser) {
      // Check if profile exists for this user
      const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', existingUser.id)
        .single()

      if (profileCheckError && profileCheckError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error checking existing profile:', profileCheckError)
        return new Response(
          JSON.stringify({ error: { message: 'Failed to check existing profile: ' + profileCheckError.message } }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        )
      }

      if (!existingProfile) {
        // User exists but no profile - create the profile
        console.log('User exists but no profile found, creating profile...')
        const { error: profileCreateError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: existingUser.id,
            name: name,
            email: email,
            role: role,
            roles: roles,
            password_expiry_date: password_expiry_date,
            is_first_login: is_first_login
          })

        if (profileCreateError) {
          console.error('Profile creation error:', profileCreateError)
          return new Response(
            JSON.stringify({ error: { message: 'Failed to create profile for existing user: ' + profileCreateError.message } }),
            { 
              status: 400, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, user: existingUser }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        )
      } else {
        console.log('User and profile already exist with this email')
        return new Response(
          JSON.stringify({ error: { message: 'A user with this email already exists' } }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        )
      }
    }

    // Create the auth user using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: 'TempPass123!', // Temporary password
      email_confirm: true, // Auto-confirm email to avoid confirmation step
      user_metadata: {
        name: name,
        role: role,
        roles: roles
      }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return new Response(
        JSON.stringify({ error: { message: 'Failed to create user: ' + authError.message } }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    console.log('Auth user created successfully:', authData.user?.id)

    // Wait for the profile to be created by the trigger
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update the profile with the correct data
    if (authData.user) {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          name: name,
          role: role,
          roles: roles,
          password_expiry_date: password_expiry_date,
          is_first_login: is_first_login
        })
        .eq('id', authData.user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        return new Response(
          JSON.stringify({ error: { message: 'User created but profile update failed: ' + updateError.message } }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        )
      }

      // Generate password reset link using the correct Admin API method
      console.log('Generating password reset link for:', email)
      
      try {
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
        })
        
        if (linkError) {
          console.error('Recovery link generation failed:', linkError)
          return new Response(
            JSON.stringify({ 
              success: true, 
              warning: `User ${name} created successfully, but password reset link could not be generated. Error: ${linkError.message}. Please have the user request a password reset manually.`,
              user: authData.user 
            }),
            { 
              status: 200, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          )
        } else {
          console.log('Recovery link generated successfully:', linkData?.properties?.action_link)
          
          // Send email via AWS SES using the send-email edge function
          try {
            console.log('Sending password reset email via AWS SES to:', email)
            
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #5a3FFF;">Welcome to Audit Tracker</h2>
                <p>Hello ${name},</p>
                <p>Your account has been created successfully. To complete your account setup, please click the link below to set your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${linkData?.properties?.action_link}" 
                     style="background-color: #5a3FFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Set Your Password
                  </a>
                </div>
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 14px;">${linkData?.properties?.action_link}</p>
                <p>This link will expire in 24 hours for security reasons.</p>
                <p>If you didn't expect this email, please contact your administrator.</p>
                <p>Thank you,<br/>Audit Tracker Team</p>
              </div>
            `

            const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
              },
              body: JSON.stringify({
                to: email,
                subject: 'Welcome to Audit Tracker - Set Your Password',
                html: emailHtml
              })
            })

            if (!emailResponse.ok) {
              const errorText = await emailResponse.text()
              console.error('Email sending failed:', errorText)
              throw new Error(`Email sending failed: ${errorText}`)
            }

            console.log('Password reset email sent successfully via AWS SES')
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: `User ${name} created successfully. Password setup email has been sent to ${email}.`,
                user: authData.user 
              }),
              { 
                status: 200, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              }
            )
          } catch (emailError) {
            console.error('AWS SES email sending failed:', emailError)
            return new Response(
              JSON.stringify({ 
                success: true, 
                warning: `User ${name} created successfully, but the password setup email could not be sent via AWS SES. Error: ${emailError.message}. Password reset link: ${linkData?.properties?.action_link}`,
                recovery_link: linkData?.properties?.action_link,
                user: authData.user 
              }),
              { 
                status: 200, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              }
            )
          }
        }
      } catch (emailError) {
        console.error('Unexpected error during recovery link generation:', emailError)
        return new Response(
          JSON.stringify({ 
            success: true, 
            warning: `User ${name} created successfully, but there was an issue generating the password reset link. Please check your Supabase configuration.`,
            user: authData.user 
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ success: true, user: authData.user }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )

  } catch (error: any) {
    console.error('Unexpected error during user creation:', error)
    return new Response(
      JSON.stringify({ error: { message: 'Unexpected error: ' + error.message } }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    )
  }
})

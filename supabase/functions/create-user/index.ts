
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

    // Check if user already exists
    const { data: existingProfiles, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)

    if (checkError) {
      console.error('Error checking existing profiles:', checkError)
      return new Response(
        JSON.stringify({ error: checkError }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
    }

    if (existingProfiles && existingProfiles.length > 0) {
      console.log('User already exists with this email')
      return new Response(
        JSON.stringify({ error: { message: 'A user with this email already exists' } }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      )
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
        JSON.stringify({ error: authError }),
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
          JSON.stringify({ error: updateError }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        )
      }

      // Send password reset email
      console.log('Sending password reset email to:', email)
      
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
      })
      
      if (resetError) {
        console.error('Failed to send password reset email:', resetError)
        return new Response(
          JSON.stringify({ 
            success: true, 
            warning: 'User created but password reset email could not be sent',
            user: authData.user 
          }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        )
      } else {
        console.log('Password reset email sent successfully')
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

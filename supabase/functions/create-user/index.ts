
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

      // Send password reset email using the auth admin method
      console.log('Sending password reset email to:', email)
      
      try {
        const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: email,
        })
        
        console.log('Password reset link generation result:', { resetData, resetError })
        
        if (resetError) {
          console.error('Failed to generate password reset link:', resetError)
          return new Response(
            JSON.stringify({ 
              success: true, 
              warning: 'User created but password reset email could not be sent: ' + resetError.message,
              user: authData.user 
            }),
            { 
              status: 200, 
              headers: { 'Content-Type': 'application/json', ...corsHeaders }
            }
          )
        } else {
          console.log('Password reset link generated successfully:', resetData)
          
          // Try to send the reset email
          const { error: sendResetError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('//', '//').replace('/v1', '')}/auth/reset-password`
          })
          
          if (sendResetError) {
            console.error('Failed to send invitation email:', sendResetError)
            return new Response(
              JSON.stringify({ 
                success: true, 
                warning: 'User created but invitation email could not be sent: ' + sendResetError.message,
                user: authData.user 
              }),
              { 
                status: 200, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders }
              }
            )
          } else {
            console.log('Invitation email sent successfully')
          }
        }
      } catch (emailError) {
        console.error('Unexpected error during email sending:', emailError)
        return new Response(
          JSON.stringify({ 
            success: true, 
            warning: 'User created but password reset email could not be sent due to unexpected error',
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

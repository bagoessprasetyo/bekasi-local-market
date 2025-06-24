import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 Auth callback started');
        console.log('🔍 Current URL:', window.location.href);
        
        // Get the current session after OAuth redirect
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth callback error:', error);
          navigate('/login?error=auth_callback_error');
          return;
        }
        
        if (session) {
          console.log('✅ Auth callback successful, user:', session.user.email);
          // Redirect to home page after successful authentication
          navigate('/', { replace: true });
        } else {
          console.log('⚠️ No session found in callback');
          navigate('/login?error=no_session');
        }
      } catch (error) {
        console.error('❌ Auth callback exception:', error);
        navigate('/login?error=callback_exception');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Memproses autentikasi...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID || '';
const SCRIPT_ID = 'google-identity-script';

function loadGoogleScript(onLoad) {
  if (document.getElementById(SCRIPT_ID)) {
    onLoad();
    return;
  }

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = onLoad;
  script.onerror = () => {
    toast.error('Unable to load Google sign-in. Please try again.');
  };
  document.head.appendChild(script);
}

export default function GoogleSignInButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded || !buttonRef.current) return;

    loadGoogleScript(() => {
      if (!window.google?.accounts?.id) {
        toast.error('Google Identity Services is unavailable.');
        return;
      }

      if (!GOOGLE_CLIENT_ID) {
        toast.error('Google client ID is not configured.');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (credentialResponse) => {
          if (!credentialResponse?.credential) {
            onError?.('Google sign-in failed.');
            return;
          }
          onSuccess?.(credentialResponse.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
        }
      );

      setLoaded(true);
    });
  }, [loaded, onError, onSuccess]);

  return <div ref={buttonRef} style={{ width: '100%' }} />;
}

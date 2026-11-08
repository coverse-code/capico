(function () {
  const form = document.querySelector('.signin-form');
  const emailInput = document.getElementById('login');
  const message = document.getElementById('authMessage');
  const sessionPanel = document.getElementById('authSession');
  const sessionEmail = document.getElementById('authEmail');
  const signOutButton = document.getElementById('signOutButton');
  const googleSignInButton = document.getElementById('googleSignInButton');
  const submitButton = form.querySelector('[type="submit"]');
  let currentMessage = '';

  function setMessage(text, type) {
    currentMessage = text;
    message.textContent = window.translateText ? window.translateText(currentMessage) : currentMessage;
    message.dataset.type = type;
    message.hidden = false;
  }

  new MutationObserver(function () {
    if (!message.hidden && window.translateText) {
      message.textContent = window.translateText(currentMessage);
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  function updateSession(session) {
    sessionPanel.hidden = !session;
    sessionEmail.textContent = session ? session.user.email : '';
  }

  function getClient() {
    const config = window.CAPICO_SUPABASE_CONFIG;
    if (!config || !config.url || !config.anonKey) {
      throw new Error('Sign-in is not configured. Add the Supabase project URL and publishable anon key to auth-config.js.');
    }
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('The Supabase client could not be loaded. Check your internet connection and reload the page.');
    }
    return window.supabase.createClient(config.url, config.anonKey);
  }

  let client;
  try {
    client = getClient();
    client.auth.getSession().then(function (result) {
      if (result.error) {
        setMessage(result.error.message, 'error');
        return;
      }
      updateSession(result.data.session);
    }).catch(function (error) {
      setMessage(error.message, 'error');
    });

    client.auth.onAuthStateChange(function (_event, session) {
      updateSession(session);
    });
  } catch (error) {
    setMessage(error.message, 'error');
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!emailInput.reportValidity()) return;

    try {
      if (!client) client = getClient();
      submitButton.disabled = true;
      message.hidden = true;
      const redirectUrl = new URL(window.location.href);
      if (!['http:', 'https:'].includes(redirectUrl.protocol)) {
        throw new Error('Email sign-in requires the site to be served over HTTP or HTTPS, not opened as a local file.');
      }
      redirectUrl.hash = '';
      const result = await client.auth.signInWithOtp({
        email: emailInput.value.trim(),
        options: { emailRedirectTo: redirectUrl.toString() }
      });
      if (result.error) throw result.error;
      setMessage('Check your email for the secure sign-in link. New accounts are created automatically.', 'success');
    } catch (error) {
      setMessage(error.message, 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  googleSignInButton.addEventListener('click', async function () {
    try {
      if (!client) client = getClient();
      googleSignInButton.disabled = true;
      message.hidden = true;
      const redirectUrl = new URL(window.location.href);
      if (!['http:', 'https:'].includes(redirectUrl.protocol)) {
        throw new Error('Google sign-in requires the site to be served over HTTP or HTTPS, not opened as a local file.');
      }
      redirectUrl.hash = '';
      const result = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl.toString() }
      });
      if (result.error) throw result.error;
    } catch (error) {
      setMessage(error.message, 'error');
    } finally {
      googleSignInButton.disabled = false;
    }
  });

  signOutButton.addEventListener('click', async function () {
    try {
      if (!client) client = getClient();
      signOutButton.disabled = true;
      const result = await client.auth.signOut();
      if (result.error) throw result.error;
      setMessage('You have signed out.', 'success');
    } catch (error) {
      setMessage(error.message, 'error');
    } finally {
      signOutButton.disabled = false;
    }
  });
})();

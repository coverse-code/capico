# Deploy Capico

## Static hosting

Publish the repository root as the site root. Keep the `kod` and `img` folders together; the pages load images from `../img`. The root `index.html` redirects visitors to `kod/cc.html`.

The root `404.html` is the custom not-found page for static hosts that support this convention (including GitHub Pages). It is shown when a requested page or URL is missing; a full hosting outage or lost network connection cannot serve any site page.

Use the production URL over HTTPS. Do not deploy the site by opening the HTML files as `file://`.

## Supabase configuration

Before deploying, edit `auth-config.js` and set the Supabase project's public URL and publishable key:

```js
window.CAPICO_SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY'
};
```

These values are used in browser code. Use only the publishable (or legacy anon) key. Never put a `service_role` key or OAuth client secret in this file.

In Supabase:

1. Enable Google under **Authentication → Providers → Google**.
2. In Google Cloud, configure the OAuth consent screen and create a Web application OAuth client.
3. Add Supabase's callback URL shown by the Google provider settings to the Google OAuth client's **Authorized redirect URIs**. It normally has this form: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`.
4. In **Authentication → URL Configuration**, set the production site URL and allow the deployed callback pages, including `https://YOUR_DOMAIN/kod/**`.
5. Add local development URLs separately if needed, such as `http://127.0.0.1:5500/**`.

The site sends the current page URL as the return URL for Google OAuth and email magic links. Supabase must allow that return URL.

## Verify after deploying

- Open the production HTTPS URL and confirm it redirects to `kod/cc.html`.
- Test Google sign-in and confirm the browser returns to the site.
- Test email sign-in with an address you control and follow the emailed link.
- Confirm sign-out works.

The pages are static. Authentication provides a Supabase session; account-specific trading features require a separate application backend and are not provided by this static site.

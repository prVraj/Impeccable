# Starter security headers

Read this when the project sends no security headers (step 6). Offer the set below, add it only with the person's yes, then open every page again (step 8).

Contents: The values (and the Content-Security-Policy line by line), Where to put them (Next.js, Vercel, Netlify and Cloudflare Pages), After adding them.

## The values

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | see below |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |

- Turn a feature back on in `Permissions-Policy` only if the site uses it: `camera=(self)`.
- Add `preload` to `Strict-Transport-Security` only when the person asks. Why: preload is hard to undo, and it forces HTTPS on every subdomain.

### Content-Security-Policy

Start from this and add only what the site needs:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self';
media-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests
```

| The site has | Add |
| --- | --- |
| Next.js pages served as static files, or an inline theme script | `'unsafe-inline'` to `script-src`. Why: Next.js writes small inline scripts into each page; nonces would make every page dynamic. |
| A dev server that breaks under the CSP (Next.js error overlay) | `'unsafe-eval'` to `script-src` in development only, never in production |
| Analytics, fonts, embeds or images from another site | That exact origin (`https://fonts.gstatic.com`) to the matching line, with a comment saying why |
| An API on another domain | Its origin to `connect-src` |
| A YouTube or map embed | Its origin to `frame-src` |

Never use `*` or a bare `https:` in any line. Why: it lets every site through and the policy does nothing.

## Where to put them

### Next.js (`next.config.ts`)

```ts
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
```

Merge into the existing config; never replace other settings. `headers()` does nothing with `output: "export"`: use the host's file below instead.

### Vercel, any framework (`vercel.json`)

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" }
      ]
    }
  ]
}
```

### Netlify and Cloudflare Pages (`_headers` in the published folder, such as `public/`)

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=63072000; includeSubDomains
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
  Cross-Origin-Opener-Policy: same-origin
```

## After adding them

Open every page of the built site in light and dark, at 1280px and 375px wide, with the console open. Each "Refused to load" message names one blocked address: add that exact origin to the line it names, or move the file into the project. Done when no page logs a CSP message.

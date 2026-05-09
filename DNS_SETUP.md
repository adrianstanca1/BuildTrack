# BuildTrack DNS Setup

## What Needs to Happen

Add an **A record** in Hostinger DNS for the BuildTrack subdomain.

| Field | Value |
|-------|-------|
| **Type** | A |
| **Name/Host** | `buildtrack` |
| **Points to / IPv4** | `72.62.132.43` |
| **TTL** | 3600 (1 hour) |

## Current DNS Provider

- **Registrar:** Hostinger
- **Nameservers:** `ns1.dns-parking.com`, `ns2.dns-parking.com`
- **Parent domain:** `cortexbuildpro.com` (already resolves to 72.62.132.43)

## How to Add (hPanel)

1. Log into [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Go to **Domains** → **cortexbuildpro.com**
3. Click **DNS / Nameservers** tab
4. Under **DNS Records**, click **Add Record**
5. Select type **A**, enter:
   - Name: `buildtrack`
   - Points to: `72.62.132.43`
   - TTL: 3600
6. Click **Save**

## Verification

After adding the record (DNS propagation may take 5-30 min):

```bash
# Check resolution
dig +short buildtrack.cortexbuildpro.com

# Should return: 72.62.132.43

# Test the endpoint
curl http://buildtrack.cortexbuildpro.com/health
# Should return: BuildTrack OK
```

## Next: SSL Certificate

Once DNS resolves, run:

```bash
certbot --nginx -d buildtrack.cortexbuildpro.com
```

The NGINX config is already prepared with the HTTPS server block.

Traefik
=======

Runs [Traefik](https://doc.traefik.io/traefik/) as the compose project `traefik` in `/srv/traefik`. It is
the only container that publishes ports (80, 443). HTTP redirects to HTTPS. Services opt in with docker
labels on the shared `proxy` network, the app's labels live in the root `compose.yaml`.

TLS is configured on the `websecure` entrypoint, so routers only need a rule. With
`traefik_https_letsencrypt_enabled` (default) certificates come from Let's Encrypt via the HTTP challenge.
Set it to false on test boxes the internet can't reach, Traefik then serves its default certificate.

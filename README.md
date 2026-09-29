# cratis.direct

Marketing site for **Cratis Direct** — "coming soon", with a login link to <https://app.cratis.direct>.

Plain static files, no build step (same approach as cratis.no / cratis.studio).

```shell
npm run serve              # http://localhost:4321, opens your browser
PORT=8080 npm run serve    # another port
npm run serve -- --no-open # don't open a browser
```

- `index.html`, `styles.css`, `script.js` — the page
- `assets/img/` — real screenshots captured from the running product (see below)
- Palette and type are taken from the Direct app itself (`--primary-color #e8a33d`, `#181818` ground, Inter).

## Refreshing screenshots

Port-forward `direct` and inject the identity headers as described in the Direct repo's
`.cratis/ai/rules/project/debugging-production-directly-port-forward-injected-principal.md`,
then capture at 1440px wide:

`/product/journeys`, `/product/adlc-designer` (click gate G04), `/product/backlog`,
`/content/digest`, journey detail panel, `/global` (cropped above the cost tiles).

Review every capture for private repositories, tokens and spend before committing.

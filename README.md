# URL Shortener

A Node.js and Express application for creating short links, redirecting visitors, and viewing link analytics. It uses MongoDB for persistence and EJS for the web interface.

## Features

- Create short links with generated IDs or custom aliases.
- Set an optional expiration date for a link.
- Redirect short links and record visits.
- View a user's links, click analytics, and QR codes.
- Sign up and log in with password hashing and a signed session cookie.
- Create links through an API key.
- Apply rate limits to authentication, link creation, and analytics requests.
- Check server and database health at `/health`.
- Remove expired links with a scheduled GitHub Actions workflow.

## Requirements

- Node.js 22 or later.
- npm.
- A MongoDB database and connection string.

## Run locally

1. Install dependencies:

   ```sh
   npm ci
   ```

2. Create a `.env` file in the project root:

   ```env
   MONGO_URL=mongodb+srv://<username>:<password>@<cluster>/<database>
   PORT=5001
   MAIL_USER=
   MAIL_PASS=
   MAIL_TO=
   ```

   `MONGO_URL` is required. `PORT` is optional and defaults to `5001`. The `MAIL_*` values are used by the `/api/url/start` event-email endpoint.

3. Start the server:

   ```sh
   node index.js
   ```

   Then open `http://localhost:5001`. To use the `npm start` script instead, see the startup telemetry note below.

The `.env` file is ignored by Git. Never commit database credentials, mail credentials, or API keys.

## Project structure

```text
.
├── controller/       Request handlers for URLs, users, and event email
├── job/              Expired-link cleanup job
├── middleware/       Authentication, API-key verification, and rate limits
├── model/            Mongoose user and URL schemas
├── public/           Static assets, styles, and browser scripts
├── routes/           Express route definitions
├── scripts/          Startup and one-off maintenance scripts
├── services/         JWT-based user token helpers
├── views/            EJS pages
├── index.js          Express app setup and server entry point
└── connection.js     MongoDB connection helper
```

## HTTP endpoints

| Method | Path | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Server and MongoDB health status |
| `POST` | `/user/` | Public | Create an account (`name`, `email`, `password`, `user_id`) |
| `POST` | `/user/login` | Public | Log in with `email` or `user_id` and `password` |
| `GET` | `/user/logout` | Public | Clear the login cookie |
| `GET` | `/user/api-key` | Login cookie | Get or create the account's API key |
| `DELETE` | `/user/deleteUser` | Login cookie | Delete the account and its links; requires `password` |
| `POST` | `/api/url/` | Login cookie | Create a short link |
| `POST` | `/api/url/api` | `x-api-key` header | Create a short link using an API key |
| `GET` | `/api/url/my-links` | Login cookie | List the signed-in user's links |
| `GET` | `/api/url/qr/:shortId` | Login cookie | Get a QR code as SVG |
| `GET` | `/api/url/analytics/:shortid` | Login cookie | Get click count and visit history |
| `DELETE` | `/api/url/:shortId` | Login cookie | Delete one of the signed-in user's links |
| `POST` | `/api/url/expand` | Public, rate-limited | Follow a URL and report its final destination |
| `POST` | `/api/url/start` | Public | Send the supplied startup event details by email |
| `GET` | `/:shortId` | Public | Redirect to the original URL and record a visit |

Link-creation requests accept a `url`, plus optional `alias` and `expiresAt` values. URLs must begin with `http://` or `https://`. Aliases must be 3–30 lowercase letters, digits, or hyphens; reserved and already-used aliases are rejected.

Authentication cookies are HTTP-only and marked `Secure`, so production should be served over HTTPS. Link creation is limited to 50 requests per 15 minutes, login/signup to 10 attempts per 15 minutes, and analytics/URL expansion to 100 requests per 15 minutes.

## Maintenance and deployment

- `npm run cleanup:expired-urls` connects to MongoDB and deletes links whose `expiresAt` has passed. It requires `MONGO_URL`.
- `.github/workflows/cleanup-expired-urls.yml` runs that cleanup daily at 2:17 AM Asia/Kolkata time, and can also be started manually. Configure the repository secret `MONGO_URL`.
- `.github/workflows/main_urlshortener.yml` contains the manually triggered Azure Web App deployment workflow. Configure its Azure credentials as GitHub Actions secrets before using it.

## Important implementation notes

- **Startup telemetry:** `npm start` first runs `scripts/client.js`. That script sends the machine username, platform, architecture, hostname, and Node.js version to an external endpoint. The endpoint is handled by `/api/url/start`, which emails the submitted details using `MAIL_USER`, `MAIL_PASS`, and `MAIL_TO`. Running `node index.js` starts the web app without the startup script.
- **JWT signing key:** `services/auth.js` currently uses a hard-coded signing key. Replace it with a strong environment-provided secret and invalidate existing tokens before using this app with real accounts or in production.
- Do not use real credentials in examples, commits, or issue reports. Rotate any credentials that have previously been exposed.

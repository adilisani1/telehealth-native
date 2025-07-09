## Email Verification (Gmail SMTP)

Add the following to your `.env` file in the backend directory:

```
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_PASS=your_gmail_app_password
```

- Use an App Password if 2FA is enabled on your Gmail account.
- Never commit your .env file to version control.

## Troubleshooting: Missing credentials for "PLAIN"

If you see the error:

    "Missing credentials for \"PLAIN\""

- Make sure you have a `.env` file in your backend directory with the following:
  ```
  GMAIL_USER=your_gmail_address@gmail.com
  GMAIL_PASS=your_gmail_app_password
  ```
- If you have 2FA enabled on your Gmail, you **must** use an App Password, not your regular Gmail password.
- Restart your backend server after adding or changing the `.env` file.
- Make sure you are running the backend from the correct directory so the `.env` file is loaded.

If you still see this error, add a `console.log(process.env.GMAIL_USER, process.env.GMAIL_PASS)` in `backend/utils/mail.js` to debug if the values are being loaded.

## Security & Compliance

- **Helmet**: HTTP security headers are enabled by default.
- **CORS**: API is restricted to requests from http://localhost:3000 (change for production).
- **Field-level encryption**: Health records are encrypted at rest. Set FIELD_ENCRYPTION_SECRET in your .env file.
- **GDPR endpoints**: (Phase 2) Data export and account deletion endpoints are available.
- **Consent**: User consent is required for registration and profile update.

### .env Example
```
FIELD_ENCRYPTION_SECRET=your_strong_secret_here
``` 
# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to [carafaadmuze121@gmail.com]. All security vulnerabilities will be promptly addressed.

Please do not create a public GitHub issue for security vulnerabilities.

## Security Best Practices

1. **API Key Protection**: Never commit API keys to version control
2. **Input Validation**: All user inputs are validated and sanitized
3. **HTTPS Only**: Always use HTTPS for API calls
4. **Regular Updates**: Keep dependencies updated
5. **Error Handling**: Sensitive information is not exposed in error messages

## Security Considerations

- This application uses client-side JavaScript to make API calls
- API keys are visible in the client-side code (consider using environment variables for production)
- User data is not stored or transmitted beyond weather API calls
- No personal information is collected or stored

## Reporting Security Issues

When reporting security issues, please include:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if available)

We appreciate your help in keeping this project secure! 
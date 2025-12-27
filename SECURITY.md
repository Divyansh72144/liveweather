# Security Documentation

## Security Features Implemented

### 1. CORS (Cross-Origin Resource Sharing) Protection
- **Status:** ✅ Implemented
- **Description:** Restricted CORS to specific origins only
- **Configuration:** Set via `ALLOWED_ORIGINS` in `.env` file
- **Default:** `http://localhost:5173,http://localhost:3000`

```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 2. Rate Limiting
- **Status:** ✅ Implemented
- **Description:** Limits number of requests per IP to prevent DoS attacks
- **Default:** 100 requests per 15 minutes
- **Configuration:** Set via environment variables

```env
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### 3. Input Validation
- **Status:** ✅ Implemented
- **Description:** Validates query parameters for suspicious patterns
- **Protection Against:**
  - XSS (Cross-Site Scripting)
  - SQL Injection patterns
  - HTML injection
  - JavaScript protocol injection

### 4. Security Headers
- **Status:** ✅ Implemented
- **Headers Added:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000`
  - Removed `X-Powered-By` header

### 5. Environment Variables
- **Status:** ✅ Implemented
- **Description:** Sensitive configuration moved to `.env` files
- **Files:**
  - `.env` - Local development (not in git)
  - `.env.example` - Template for developers

### 6. Error Handling
- **Status:** ⚠️ Partial
- **Description:** Basic error handling in place
- **TODO:** Implement proper error sanitization for production

## Configuration

### Backend Environment Variables

See `backend/.env.example` for all available configuration options:

```env
# Server
PORT=4000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# API
OPENMETEO_API=https://api.open-meteo.com/v1/forecast

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### Frontend Environment Variables

See `.env.example` in the root directory:

```env
VITE_BACKEND_API_URL=http://localhost:4000
```

## Best Practices

### Development
1. Never commit `.env` files to version control
2. Use `.env.example` as a template
3. Keep dependencies updated
4. Test with rate limiting enabled

### Production
1. Set `NODE_ENV=production`
2. Use HTTPS only
3. Configure proper CORS origins
4. Enable all security headers
5. Monitor rate limits
6. Implement logging for security events

## Reporting Vulnerabilities

If you discover a security vulnerability, please:
1. Do not create a public issue
2. Send details to the project maintainers
3. Include steps to reproduce
4. Allow time for fix before disclosure

## Dependencies

### Security Packages Used
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variable management
- `cors` - CORS protection

### Regular Maintenance
```bash
# Audit dependencies for vulnerabilities
npm audit

# Update dependencies
npm update

# Fix security issues
npm audit fix
```

## Future Security Improvements

### High Priority
- [ ] Implement cache size limits (LRU)
- [ ] Add request logging and monitoring
- [ ] Implement proper error sanitization
- [ ] Add API authentication/authorization

### Medium Priority
- [ ] Add Content Security Policy headers
- [ ] Implement request signing
- [ ] Add monitoring/alerting for rate limit breaches
- [ ] Implement request timeout handling

### Low Priority
- [ ] Add security testing to CI/CD
- [ ] Implement automated security scanning
- [ ] Add helmet.js for additional security headers

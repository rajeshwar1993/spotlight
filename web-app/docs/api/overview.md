# Spotlight API Documentation

The Spotlight API provides programmatic access to portfolio data and platform functionality. This RESTful API uses JSON for requests and responses.

## Base URL

```
Production: https://spotlight.com/api
Development: http://localhost:3000/api
```

## Authentication

### API Key Authentication
Include your API key in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://spotlight.com/api/portfolios
```

### User Authentication
For user-specific operations, use session-based authentication via cookies or JWT tokens.

## Rate Limiting

### Default Limits
- **Authenticated Users**: 1000 requests per hour
- **Anonymous Users**: 100 requests per hour
- **API Key Users**: 5000 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Exceeding Limits
When rate limits are exceeded, the API returns HTTP 429 with:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 3600
}
```

## Response Format

### Success Response
```json
{
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-20T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Endpoints Overview

### Portfolios
- `GET /api/portfolios` - List portfolios
- `GET /api/portfolios/{id}` - Get portfolio details
- `POST /api/portfolios` - Create portfolio
- `PUT /api/portfolios/{id}` - Update portfolio
- `DELETE /api/portfolios/{id}` - Delete portfolio

### Public Portfolios
- `GET /api/portfolios/public` - List public portfolios
- `GET /api/portfolios/slug/{slug}` - Get portfolio by slug
- `GET /api/portfolios/discover` - Discover portfolios with filters

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/avatar` - Upload avatar

### Analytics
- `POST /api/analytics/track` - Track events
- `POST /api/analytics/web-vitals` - Report performance metrics
- `GET /api/analytics/dashboard` - Get analytics data

### Images
- `POST /api/images/upload` - Upload image
- `DELETE /api/images/{id}` - Delete image
- `PUT /api/images/{id}` - Update image metadata

## Portfolio Endpoints

### List Portfolios

```http
GET /api/portfolios
```

**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (`draft`, `published`)
- `template` (optional): Filter by template type

**Example Request:**
```bash
curl "https://spotlight.com/api/portfolios?page=1&limit=10&status=published"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "port_123456",
      "title": "John Doe - Actor",
      "slug": "john-doe-actor",
      "template": "classic",
      "status": "published",
      "viewCount": 1250,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T14:30:00Z",
      "publishedAt": "2024-01-16T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

### Get Portfolio Details

```http
GET /api/portfolios/{id}
```

**Example Response:**
```json
{
  "data": {
    "id": "port_123456",
    "title": "John Doe - Actor",
    "slug": "john-doe-actor",
    "template": "classic",
    "status": "published",
    "bio": "Experienced actor with 10+ years in theater and film.",
    "contact": {
      "email": "john@example.com",
      "phone": "+1-555-0123",
      "website": "https://johndoe.com"
    },
    "images": [
      {
        "id": "img_789012",
        "url": "https://cdn.spotlight.com/images/headshot.jpg",
        "type": "headshot",
        "primary": true,
        "alt": "Professional headshot of John Doe"
      }
    ],
    "experience": [
      {
        "title": "Hamlet",
        "role": "Hamlet",
        "type": "theater",
        "year": 2023,
        "company": "Royal Shakespeare Company"
      }
    ],
    "skills": ["Shakespeare", "Method Acting", "Stage Combat"],
    "viewCount": 1250,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-20T14:30:00Z"
  }
}
```

### Create Portfolio

```http
POST /api/portfolios
```

**Request Body:**
```json
{
  "title": "Jane Smith - Model",
  "template": "modern",
  "bio": "Fashion model specializing in editorial and commercial work.",
  "contact": {
    "email": "jane@example.com",
    "phone": "+1-555-0456"
  },
  "skills": ["Fashion Modeling", "Commercial Work", "Runway"],
  "status": "draft"
}
```

**Example Response:**
```json
{
  "data": {
    "id": "port_654321",
    "title": "Jane Smith - Model",
    "slug": "jane-smith-model",
    "template": "modern",
    "status": "draft",
    "createdAt": "2024-01-20T15:00:00Z"
  }
}
```

## Public Portfolio Endpoints

### Discover Portfolios

```http
GET /api/portfolios/discover
```

**Parameters:**
- `search` (optional): Search query
- `profession` (optional): Filter by profession
- `template` (optional): Filter by template
- `location` (optional): Filter by location
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sort` (optional): Sort by (`newest`, `popular`, `random`)

**Example Request:**
```bash
curl "https://spotlight.com/api/portfolios/discover?profession=actor&location=New%20York&sort=popular"
```

### Get Portfolio by Slug

```http
GET /api/portfolios/slug/{slug}
```

**Example Request:**
```bash
curl "https://spotlight.com/api/portfolios/slug/john-doe-actor"
```

## Image Upload Endpoints

### Upload Image

```http
POST /api/images/upload
```

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file`: Image file (required)
- `type`: Image type (`headshot`, `full_body`, `action`, `behind_scenes`)
- `alt`: Alt text for accessibility
- `portfolioId`: Portfolio ID to associate with

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@headshot.jpg" \
  -F "type=headshot" \
  -F "alt=Professional headshot" \
  -F "portfolioId=port_123456" \
  https://spotlight.com/api/images/upload
```

**Example Response:**
```json
{
  "data": {
    "id": "img_789012",
    "url": "https://cdn.spotlight.com/images/headshot.jpg",
    "thumbnailUrl": "https://cdn.spotlight.com/images/headshot_thumb.jpg",
    "type": "headshot",
    "alt": "Professional headshot",
    "fileSize": 1024000,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "createdAt": "2024-01-20T15:30:00Z"
  }
}
```

## Analytics Endpoints

### Track Event

```http
POST /api/analytics/track
```

**Request Body:**
```json
{
  "event": "portfolio_view",
  "properties": {
    "portfolioId": "port_123456",
    "viewSource": "direct_link",
    "userAgent": "Mozilla/5.0...",
    "referrer": "https://google.com"
  },
  "timestamp": 1640995200000
}
```

### Report Web Vitals

```http
POST /api/analytics/web-vitals
```

**Request Body:**
```json
{
  "name": "LCP",
  "value": 1250.5,
  "id": "v3-1640995200000-123456",
  "url": "https://spotlight.com/portfolios/john-doe-actor",
  "timestamp": 1640995200000
}
```

## Error Codes

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_API_KEY` | API key is invalid or missing | 401 |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions | 403 |
| `RESOURCE_NOT_FOUND` | Requested resource doesn't exist | 404 |
| `VALIDATION_ERROR` | Request data validation failed | 422 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `UPLOAD_ERROR` | File upload failed | 400 |
| `PROCESSING_ERROR` | Server processing error | 500 |

### Validation Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "code": "INVALID_EMAIL",
        "message": "Email format is invalid"
      },
      {
        "field": "bio",
        "code": "TOO_LONG",
        "message": "Bio exceeds maximum length of 500 characters"
      }
    ]
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript
```bash
npm install @spotlight/api-client
```

```javascript
import { SpotlightAPI } from '@spotlight/api-client';

const client = new SpotlightAPI('your-api-key');
const portfolios = await client.portfolios.list();
```

### Python
```bash
pip install spotlight-api
```

```python
from spotlight_api import SpotlightClient

client = SpotlightClient(api_key='your-api-key')
portfolios = client.portfolios.list()
```

## Webhooks

### Supported Events
- `portfolio.created`
- `portfolio.updated`
- `portfolio.published`
- `portfolio.unpublished`
- `image.uploaded`
- `user.registered`

### Webhook Configuration
Configure webhooks in your dashboard at `/settings/webhooks`

### Webhook Payload Example
```json
{
  "event": "portfolio.published",
  "data": {
    "id": "port_123456",
    "userId": "user_789012",
    "title": "John Doe - Actor",
    "slug": "john-doe-actor"
  },
  "timestamp": "2024-01-20T15:00:00Z",
  "webhookId": "wh_345678"
}
```

## Rate Limiting Best Practices

### Exponential Backoff
```javascript
async function apiCallWithBackoff(apiCall, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

### Batch Operations
Instead of multiple single requests, use batch endpoints when available:

```javascript
// Instead of multiple single uploads
const images = await Promise.all([
  client.images.upload(file1),
  client.images.upload(file2),
  client.images.upload(file3)
]);

// Use batch upload (if available)
const images = await client.images.batchUpload([file1, file2, file3]);
```

## Getting Help

### Documentation
- **API Reference**: Full endpoint documentation
- **Tutorials**: Step-by-step guides
- **Examples**: Code examples in multiple languages

### Support
- **Email**: api-support@spotlight.com
- **Discord**: Join our developer community
- **GitHub**: Report issues and contribute

### Status Page
Monitor API status at [status.spotlight.com](https://status.spotlight.com)

---

**Version**: 1.0
**Last Updated**: January 20, 2024

For the latest updates and announcements, follow our [developer blog](https://spotlight.com/developers/blog).
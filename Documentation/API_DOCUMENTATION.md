# 📡 API Documentation

## Overview

Meeting Reports System REST API provides endpoints for managing and retrieving meeting reports data.

**Base URL**: `http://localhost:3001/api`

**Version**: 1.0.0

**Content-Type**: `application/json`

---

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Get Meetings](#get-meetings)
  - [Search Meetings](#search-meetings)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## Authentication

Currently, the API does not require authentication. This may be added in future versions.

**Future Implementation**:
```http
Authorization: Bearer <token>
```

---

## Endpoints

### Health Check

Check API and database connectivity status.

**Endpoint**: `GET /api/health`

**Parameters**: None

**Response**:
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "connected"
}
```

**Status Codes**:
- `200` - Service is healthy
- `500` - Service is unhealthy

**Example**:
```bash
curl http://localhost:3001/api/health
```

---

### Get Meetings

Retrieve all meeting reports.

**Endpoint**: `GET /api/meetings`

**Parameters**: None

**Response**:
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": 1,
      "meeting_number": "1/2568",
      "meeting_title": "รายงานการประชุมคณะกรรมการวางแผนและประเมินผล ครั้งที่ 1/2568",
      "meeting_date": "2025-01-15T00:00:00.000Z",
      "meeting_date_thai": "15 มกราคม 2568",
      "location": "ห้องประชุมดอกปีบ สำนักงานสาธารณสุขจังหวัดลำพูน",
      "file_name": "meeting_1_2568.pdf",
      "file_size": 2150000,
      "file_size_formatted": "2.15 MB",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | Request success status |
| count | integer | Number of records returned |
| data | array | Array of meeting objects |
| data[].id | integer | Unique meeting ID |
| data[].meeting_number | string | Meeting number (e.g., "1/2568") |
| data[].meeting_title | string | Meeting title |
| data[].meeting_date | string | ISO 8601 date |
| data[].meeting_date_thai | string | Thai formatted date |
| data[].location | string | Meeting location |
| data[].file_name | string | PDF filename |
| data[].file_size | integer | File size in bytes |
| data[].file_size_formatted | string | Human-readable file size |
| data[].created_at | string | Record creation timestamp |

**Status Codes**:
- `200` - Success
- `500` - Server error

**Example**:
```bash
curl http://localhost:3001/api/meetings
```

---

### Search Meetings

Search meeting reports by keyword.

**Endpoint**: `GET /api/meetings?search={keyword}`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search keyword |

**Search Fields**:
- `meeting_title` - Meeting title
- `meeting_number` - Meeting number
- `location` - Meeting location

**Search Behavior**:
- Case-insensitive
- Partial matching (ILIKE)
- Searches across multiple fields

**Response**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "meeting_number": "1/2568",
      "meeting_title": "รายงานการประชุมคณะกรรมการวางแผนและประเมินผล ครั้งที่ 1/2568",
      "meeting_date": "2025-01-15T00:00:00.000Z",
      "meeting_date_thai": "15 มกราคม 2568",
      "location": "ห้องประชุมดอกปีบ สำนักงานสาธารณสุขจังหวัดลำพูน",
      "file_name": "meeting_1_2568.pdf",
      "file_size": 2150000,
      "file_size_formatted": "2.15 MB",
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

**Status Codes**:
- `200` - Success (even if no results)
- `400` - Invalid search parameter
- `500` - Server error

**Examples**:

```bash
# Search by title
curl "http://localhost:3001/api/meetings?search=คณะกรรมการ"

# Search by location
curl "http://localhost:3001/api/meetings?search=ดอกปีบ"

# Search by meeting number
curl "http://localhost:3001/api/meetings?search=1/2568"

# URL encoded search
curl "http://localhost:3001/api/meetings?search=%E0%B8%84%E0%B8%93%E0%B8%B0%E0%B8%81%E0%B8%A3%E0%B8%A3%E0%B8%A1%E0%B8%81%E0%B8%B2%E0%B8%A3"
```

---

## Response Format

### Success Response

```json
{
  "success": true,
  "count": 1,
  "data": [...]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## Error Handling

### Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server issue |
| 503 | Service Unavailable - Database connection failed |

### Error Response Examples

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid search parameter",
  "message": "Search term must be a string"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch meetings",
  "message": "Database connection timeout"
}
```

#### 503 Service Unavailable
```json
{
  "success": false,
  "error": "Service unavailable",
  "message": "Database is not accessible"
}
```

---

## Rate Limiting

**Current Status**: Not implemented

**Future Implementation**:
- 100 requests per minute per IP
- 1000 requests per hour per IP

**Rate Limit Headers** (Future):
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Examples

### JavaScript (Axios)

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Get all meetings
const getMeetings = async () => {
  try {
    const response = await axios.get(`${API_URL}/meetings`);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Search meetings
const searchMeetings = async (keyword) => {
  try {
    const response = await axios.get(`${API_URL}/meetings`, {
      params: { search: keyword }
    });
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};

// Health check
const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log(response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### JavaScript (Fetch)

```javascript
// Get all meetings
fetch('http://localhost:3001/api/meetings')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Search meetings
fetch('http://localhost:3001/api/meetings?search=คณะกรรมการ')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

### cURL

```bash
# Get all meetings
curl -X GET http://localhost:3001/api/meetings

# Search meetings
curl -X GET "http://localhost:3001/api/meetings?search=คณะกรรมการ"

# Health check
curl -X GET http://localhost:3001/api/health

# With headers
curl -X GET \
  http://localhost:3001/api/meetings \
  -H "Content-Type: application/json"
```

### Python (Requests)

```python
import requests

API_URL = "http://localhost:3001/api"

# Get all meetings
response = requests.get(f"{API_URL}/meetings")
print(response.json())

# Search meetings
params = {"search": "คณะกรรมการ"}
response = requests.get(f"{API_URL}/meetings", params=params)
print(response.json())

# Health check
response = requests.get(f"{API_URL}/health")
print(response.json())
```

### PHP

```php
<?php
$api_url = "http://localhost:3001/api";

// Get all meetings
$response = file_get_contents("$api_url/meetings");
$data = json_decode($response, true);
print_r($data);

// Search meetings
$search = urlencode("คณะกรรมการ");
$response = file_get_contents("$api_url/meetings?search=$search");
$data = json_decode($response, true);
print_r($data);
?>
```

---

## Testing

### Postman Collection

Import the Postman collection from `Testing/postman-collection.json`

### Test Script

```bash
# Run API tests
./Scripts/test-api.sh
```

---

## Changelog

### Version 1.0.0 (2025-01-01)
- Initial API release
- Health check endpoint
- Get meetings endpoint
- Search functionality

---

## Support

For API support, please contact:
- Email: api-support@example.com
- Documentation: https://docs.example.com
- Issues: https://github.com/your-org/meeting-reports-system/issues

---

## Future Enhancements

- [ ] Authentication & Authorization
- [ ] Rate limiting
- [ ] Pagination
- [ ] Sorting options
- [ ] Advanced filters
- [ ] File upload endpoint
- [ ] Meeting CRUD operations
- [ ] Export functionality
- [ ] Webhooks
- [ ] GraphQL support

# Petfinder API Documentation

## Introduction

The Petfinder API (Application Programming Interface) allows you to access the Petfinder database of hundreds of thousands of pets ready for adoption and over ten thousand animal welfare organizations. You can use the API to build your own dynamic websites or applications backed by the same data used on Petfinder.com.

## Capabilities

With the Petfinder API, you can:

- Search for and display pet listings based on pet characteristics, location, and status
- Search for and display animal welfare organizations based on organization name, ID, and location

You can, for example, display a random selection of available pets on a webpage, set up pages to display pets in various categories, allow visitors to your site to search for adoptable pets based on a number of criteria, or display profiles of local organizations.

## Authentication

The Petfinder API uses OAuth for secure authentication.

### Prerequisites

To begin, you need:

1. A Petfinder account (create one if you don't have one)
2. A Petfinder API Key (Client ID) and Secret from www.petfinder.com/developers
3. A way to send requests to the server (cURL recommended for testing)

### Getting an Access Token

Make the following request, replacing `{CLIENT-ID}` and `{CLIENT-SECRET}` with your credentials:

```bash
curl -d "grant_type=client_credentials&client_id={CLIENT-ID}&client_secret={CLIENT-SECRET}" https://api.petfinder.com/v2/oauth2/token
```

The server will respond with:

```json
{
  "token_type": "Bearer",
  "expires_in": 3600,
  "access_token": "..."
}
```

- `token_type`: "Bearer" indicates no additional identification needed
- `expires_in`: Time in seconds the token remains valid
- `access_token`: The token to include in API request headers

## Request Structure

Make API requests using this pattern:

```bash
curl -H "Authorization: Bearer {YOUR_ACCESS_TOKEN}" GET https://api.petfinder.com/v2/{CATEGORY}/{ACTION}?{parameter_1}={value_1}&{parameter_2}={value_2}
```

Components:
- Initial cURL command
- Header information for authentication
- GET request with base URL
- Path parameters separated by slashes
- Optional query parameters after `?`, separated by `&`

## Error Handling

The API uses RFC 7807 for consistent error responses.

### Common Error Codes

| Code | Description |
|------|-------------|
| ERR-401 | Invalid credentials (invalid API key/secret, missing/expired token) |
| ERR-403 | Insufficient access |
| ERR-404 | Resource not found |
| ERR-500 | Unexpected error |
| ERR-00001 | Missing parameters |
| ERR-00002 | Invalid parameters |

Example error response:

```json
{
    "type": "https://www.petfinder.com/developers/v2/docs/errors/ERR-00002/",
    "status": 400,
    "title": "Invalid Request",
    "detail": "The request contains invalid parameters.",
    "invalid-params": [
        {
            "in": "query",
            "path": "type",
            "message": "test is not a valid animal type."
        }
    ]
}
```

## Endpoints

### Animals

#### Get Animals List

```
GET https://api.petfinder.com/v2/animals
```

Query Parameters:

| Parameter | Description | Type | Values |
|-----------|-------------|------|---------|
| type | Animal type | string | See Get Animal Types |
| breed | Animal breed | string | Multiple values allowed (e.g., breed=pug,samoyed) |
| size | Animal size | string | small, medium, large, xlarge |
| gender | Animal gender | string | male, female, unknown |
| age | Animal age | string | baby, young, adult, senior |
| color | Animal color | string | See Get Animal Types |
| coat | Animal coat | string | short, medium, long, wire, hairless, curly |
| status | Adoption status | string | adoptable, adopted, found (default: adoptable) |
| name | Animal name | string | Includes partial matches |
| organization | Organization ID | string | Multiple values allowed |
| location | Geographic location | string | city, state; latitude,longitude; postal code |
| distance | Search radius (miles) | integer | Max: 500, default: 100 |
| sort | Sort attribute | string | recent, -recent, distance, -distance, random |
| page | Results page number | integer | Default: 1 |
| limit | Results per page | integer | Default: 20, max: 100 |

#### Get Single Animal

```
GET https://api.petfinder.com/v2/animals/{id}
```

Path Parameters:

| Parameter | Description | Type |
|-----------|-------------|------|
| id | Animal ID | integer |

### Organizations

#### Get Organizations List

```
GET https://api.petfinder.com/v2/organizations
```

Query Parameters:

| Parameter | Description | Type | Values |
|-----------|-------------|------|---------|
| name | Organization name | string | |
| location | Geographic location | string | city, state; latitude,longitude; postal code |
| distance | Search radius (miles) | integer | Max: 500, default: 100 |
| state | US state filter | string | Two-letter code (e.g., CA) |
| country | Country filter | string | Two-letter code (e.g., US) |
| query | General search | string | Searches name, city, state |
| sort | Sort attribute | string | distance, -distance, name, -name, etc. |
| page | Results page number | integer | Default: 1 |
| limit | Results per page | integer | Default: 20, max: 100 |

#### Get Single Organization

```
GET https://api.petfinder.com/v2/organizations/{id}
```

Path Parameters:

| Parameter | Description | Type | Values |
|-----------|-------------|------|---------|
| id | Organization ID | string | e.g., NJ333 |

## Developer Resources

- Petfinder OpenAPI Specification
- Petfinder JS SDK
- Petfinder PHP SDK
- Petfinder Go SDK
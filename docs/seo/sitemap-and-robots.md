# Sitemap and Robots.txt Implementation

## Overview
This document describes the implementation of the sitemap.xml and robots.txt files for the FindMePet application to improve SEO and search engine indexing.

## Implementation Details

### 1. Sitemap.xml
A sitemap.xml file was added to the `/public` directory to help search engines discover and index the main pages of the application. The sitemap includes:

- Homepage (priority: 1.0)
- Search page (priority: 0.8)
- Results pages (priority: 0.8)
- Filtered results pages (priority: 0.7)
- Questionnaire page (priority: 0.6)

Each URL includes the last modification date, change frequency, and priority level.

### 2. Robots.txt
A robots.txt file was added to the `/public` directory to control search engine crawling behavior. The file:

- Allows crawling of the main domain (findmepet.app)
- Explicitly disallows crawling of the development subdomain (dev.findmepet.app)
- Provides the location of the sitemap.xml file

## Maintenance
When adding new important pages to the application, remember to update the sitemap.xml file to include these pages. The sitemap should be kept up-to-date to ensure proper indexing by search engines.

## Related Changes
In addition to the SEO improvements, the API call to Petfinder was modified to only fetch animals that have photos by adding the `photos=true` parameter to the API URL.

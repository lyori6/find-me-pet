# Product Requirements Document (PRD) for findmepet

## 1. Overview
findmepet is an MVP web application designed to help users discover adoptable pets and receive AI-generated recommendations. The app features a playful, mobile-first, iOS-inspired UI with smooth animations and gamified interactions. It leverages external APIs to retrieve pet data, generate recommendations, and ensure secure interactions. All user inputs are initially stored in localStorage, with plans for eventual persistence via Firestore. The system is built with React and Next.js for the frontend and utilizes serverless functions (via Firebase) for backend processing.

## 2. Goals
- **User Experience:**  
  - Provide an engaging, intuitive, and visually appealing interface with smooth animations.
  - Emphasize a “cute” and gamified design that resonates with animal lovers.

- **Core Functionality:**  
  - **Input Handling:** Capture and persist user inputs (location, pet preferences) in localStorage.
  - **Pet Data Retrieval:** Integrate with the Petfinder API to fetch real-time pet listings.
  - **AI Recommendations:** Combine pet data with user input and generate personalized pet suggestions via OpenAI.
  - **Spam Prevention:** Use Cloudflare Turnstile to validate user submissions and avoid abuse.
  
- **Security & Reliability:**  
  - Secure API keys and tokens using environment variables.
  - Implement graceful error handling and rate limiting.
  
- **Developer Workflow & Documentation:**  
  - Create and maintain a dedicated log file for every new component.  
  - Document all changes and update histories for each component in the codebase.

## 3. Core Features

### 3.1. User Input & Persistence
- **Data Capture:**  
  - Collect user’s location and pet preferences via a responsive form.
- **LocalStorage:**  
  - Store inputs in JSON format using `localStorage` for session continuity.
- **Component Logging:**  
  - For every new component created, add a corresponding log file documenting purpose, change history, and creation date.

### 3.2. Disclaimer Modal
- **Display Logic:**  
  - On the first visit (checked via localStorage), display a modal with a disclaimer.
  - **Example Text:** “Adopting a pet is a lifelong commitment. Please ensure you’re ready to provide love and care for its entire life.”
- **User Interaction:**  
  - Upon acknowledgment, set a flag in localStorage to prevent future displays.

### 3.3. API Integrations

#### Petfinder API
- **Purpose:**  
  - Retrieve detailed information on adoptable pets.
- **Authentication & Access:**  
  - Uses OAuth for secure authentication.
  - **Token Retrieval:**  
    ```bash
    curl -d "grant_type=client_credentials&client_id={CLIENT-ID}&client_secret={CLIENT-SECRET}" https://api.petfinder.com/v2/oauth2/token
    ```
  - **Response Format:**
    ```json
    {
      "token_type": "Bearer",
      "expires_in": 3600,
      "access_token": "..."
    }
    ```
  - **Request Structure:**  
    All API requests must include the header:  
    `Authorization: Bearer {YOUR_ACCESS_TOKEN}`  
    Example endpoint to fetch pets:  
    ```
    GET https://api.petfinder.com/v2/animals?type=dog&page=2
    ```
- **Note:**  
  - Full Petfinder API details can be referenced in their documentation. For findmepet, only essential endpoints will be utilized.

#### OpenAI Integration
- **Purpose:**  
  - Generate tailored pet recommendations by processing combined user input and Petfinder data.
- **Implementation:**  
  - Use a Firebase Function (or Next.js API route for local testing) as a proxy for making calls to OpenAI.
- **Endpoint & Payload:**  
  - **Endpoint:** `POST https://api.openai.com/v1/completions`
  - **Sample Request Payload:**
    ```json
    {
      "model": "text-davinci-003",
      "prompt": "<Combined user & pet data prompt>",
      "max_tokens": 150,
      "temperature": 0.7
    }
    ```
- **Error Handling:**  
  - Manage HTTP 429 (rate limit) and other error responses gracefully, displaying user-friendly messages.
- **Security:**  
  - Store the OpenAI API key securely via environment variables.

#### Cloudflare Turnstile Integration
- **Purpose:**  
  - Prevent spam and abuse before proceeding with API calls.
- **Client-Side Integration:**  
  - Embed the Turnstile widget on the input form.
  - Obtain a token upon form submission.
- **Server-Side Validation:**  
  - Make a POST request to Cloudflare’s verification endpoint:
    ```
    POST https://challenges.cloudflare.com/turnstile/v0/siteverify
    ```
  - **Required Parameters:**
    - `secret`: Your Turnstile secret key.
    - `response`: Token generated from the widget.
    - `remoteip`: (Optional) User’s IP address.
- **Flow:**  
  - Validate the token on the server before proceeding with any external API calls. Reject requests with invalid tokens to avoid unnecessary credit usage.

#### Firebase Integration
- **Serverless Functions:**  
  - Implement endpoints (for OpenAI calls and future features) using Firebase Functions.
  - **Local Testing:**  
    - Utilize the Firebase Emulator Suite (`firebase emulators:start`) for development.
- **Hosting & Deployment:**  
  - Initially allow API calls from any domain.  
  - Upon deployment, restrict API access to the custom domain.
- **Configuration:**  
  - Securely manage environment variables using Firebase’s configuration tools.

## 4. Architecture & Tech Stack
- **Frontend:**  
  - **Framework:** React with Next.js.
  - **Design:** Mobile-first, with a cute, gamified, and animated UI inspired by iOS aesthetics.
- **Backend:**  
  - Serverless architecture using Firebase Functions or Next.js API routes (for local development).
- **Data Storage:**  
  - LocalStorage for session data; future persistence options include Firestore.
- **Deployment:**  
  - Local development via Next.js dev server and Firebase Emulator.
  - Production deployment on Firebase Hosting or Vercel.

## 5. Security & Data Handling
- **Environment Variables:**  
  - API keys and secrets must be stored securely (e.g., in Firebase config or a `.env` file) and never committed to source control.
- **Error Handling & Rate Limiting:**  
  - Implement graceful error messages for API failures (e.g., 429 errors for rate limits, missing data).
- **Data Privacy:**  
  - Ensure all user data stored in localStorage is handled in accordance with best practices.

## 6. User Flow (MVP)
1. **Landing Page:**  
   - Introduce the app with engaging branding animations and a “Get Started” button.
2. **Disclaimer Modal:**  
   - Display on first visit; require acknowledgment before proceeding.
3. **Input Form:**  
   - Collect user location and pet preferences.
   - Integrate the Cloudflare Turnstile widget to validate submissions.
4. **Backend Processing:**  
   - Validate the Turnstile token.
   - Retrieve pet data via the Petfinder API.
   - Combine user input and pet data, then send to the OpenAI proxy endpoint.
5. **Results Page:**  
   - Display recommended pets with images and concise details.
   - Handle missing or incomplete data gracefully.

## 7. Logging & Documentation IMPORTANT 
- **Component Log Files:**  
  - For every new component or major update, create a dedicated log file in the codebase.  
  - Log files should include:
    - **Component Purpose:** A brief description of the component.
    - **Change History:** Detailed record of updates, modifications, and bug fixes.
    - **Creation Date & Developer Notes:** Timestamp and notes for context.
- **Central Documentation:**  
  - Maintain a README/Wiki with detailed architecture, API integration instructions, environment setup, and deployment procedures.
  - Include troubleshooting guides for common API errors and integration issues.

## 8. Timeline & Milestones
- **Week 1:**  
  - Set up the local development environment (Next.js project, Firebase Emulator).
  - Implement the disclaimer modal and localStorage tracking.
- **Week 2:**  
  - Integrate Cloudflare Turnstile on the input form.
  - Establish initial Firebase Function (or Next.js API route) for the OpenAI proxy.
- **Weeks 3–4:**  
  - Complete Petfinder and OpenAI integrations with robust error handling.
  - Polish the responsive design and animation effects.
- **Deployment:**  
  - Finalize environment variable configuration.
  - Deploy the app and backend functions to production (Firebase Hosting or Vercel).
- **Post-MVP:**  
  - Plan future enhancements such as Firebase Auth and additional UI/UX refinements.

## 9. References
- **Petfinder API Documentation:** [Petfinder Developers](https://www.petfinder.com/developers/)
- **OpenAI API Reference:** [OpenAI Documentation](https://platform.openai.com/docs/introduction)
- **Cloudflare Turnstile Docs:** [Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- **Firebase Documentation:** [Firebase Functions](https://firebase.google.com/docs/functions) | [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

### 3.10. Cloudflare Worker for Petfinder API

A Cloudflare Worker is used to proxy requests to the Petfinder API, handling authentication and data retrieval securely.

#### **Endpoint**
https://petfinder.lyori6ux.workers.dev/

#### **Usage**
To get a list of adoptable pets by ZIP code, send a GET request with a `zip` query parameter:GET https://petfinder.lyori6ux.workers.dev/?zip=90210

#### **Response**
Returns a JSON object with pet listings from the Petfinder API.

#### **Notes**
- The worker fetches an OAuth token and caches it for use in API calls.
- CORS is open for now but will be restricted later.
- Environment variables `CLIENT_ID` and `CLIENT_SECRET` are stored securely in Cloudflare.
# Technical Documentation

## Architecture Overview

FindMePet uses a modern web application architecture built on Next.js with the App Router.

### Key Architectural Components:

```
FindMePet
├── Frontend (Next.js + React)
│   ├── Pages and Layout
│   ├── Components
│   └── Client-side State
├── APIs
│   ├── PetFinder API
│   ├── OpenAI API
│   └── Geocoding Services
└── Data Storage
    └── LocalStorage (Client-side)
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: TailwindCSS
- **Component Library**: Custom components built with Radix UI primitives
- **Animation**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation

### State Management
- Client-side state with React hooks
- LocalStorage for persistence between sessions
- URL parameters for shareable state

### API Integration
- **PetFinder API**: REST API for pet data
- **OpenAI API**: GPT-4o-mini for AI recommendations
- **Geocoding**: OpenStreetMap's Nominatim service

### Deployment
- Vercel for hosting and serverless functions

## Code Organization

### Directory Structure
```
/
├── app/                 # Next.js App Router components
│   ├── api/             # API routes
│   ├── components/      # App-specific components
│   ├── context/         # React context providers
│   ├── pet/             # Pet details page
│   ├── questionnaire/   # Questionnaire flow
│   ├── results/         # Search results page
│   ├── search/          # Search form pages
│   ├── utils/           # Utility functions
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Shared components
│   ├── ui/              # UI primitives
│   └── [component].tsx  # Feature components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
├── public/              # Static assets
└── styles/              # Global styles
```

## Key Implementations

### Pet Search Flow
1. User selects pet types (multi-select)
2. User enters location (zip code)
3. App fetches matching pets from PetFinder API
4. Results are displayed in a grid layout
5. AI recommendation is generated and displayed

### AI Recommendation Engine
- **API**: OpenAI API with GPT-4o-mini model
- **Prompt Engineering**: Structured prompt focused on selecting specific pets with reasoning
- **Response Parsing**: Structured format with name, explanation, and match percentages
- **Caching**: LocalStorage caching to reduce API calls
- **Error Handling**: Graceful fallbacks and retry functionality

### Data Flow

```
User Input → Form Validation → LocalStorage → API Request → 
Data Processing → Results Display → AI Processing → Recommendation Display
```

## API Integrations

See [API-INTEGRATIONS.md](API-INTEGRATIONS.md) for detailed documentation on all API integrations.

## Component Library

See [COMPONENTS.md](COMPONENTS.md) for documentation on reusable components.

## Responsive Design

- Mobile-first approach using TailwindCSS breakpoints
- Responsive layout adjustments for all screen sizes
- Touch-friendly interactions for mobile users
- Desktop enhancements for larger screens

## Performance Considerations

- **Image Optimization**: Next.js Image component for responsive images
- **Code Splitting**: Automatic code splitting with Next.js
- **Caching**: Client-side caching for API responses
- **Bundle Size**: Minimized dependencies and code-splitting
- **Loading States**: Skeleton loaders for improved perceived performance

## Error Handling

- Form validation with immediate feedback
- API error handling with user-friendly messages
- Fallback UI for failed components
- Comprehensive error logging

## Security Considerations

- Environment variables for API keys
- Client-side only storage of non-sensitive data
- API route protection
- Input sanitization

## Testing Strategy

- Component testing with Jest and React Testing Library
- End-to-end testing with Playwright
- Accessibility testing with axe-core
- Manual testing for UI/UX flows

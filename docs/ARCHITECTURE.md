# FindMePet Architecture

## System Architecture

FindMePet follows a client-side rendered architecture built on Next.js with the App Router pattern. The application is structured to optimize for user experience while maintaining developer productivity.

```
┌─────────────────────────────────────────────────────────┐
│                    FindMePet System                      │
└───────────────────────────┬─────────────────────────────┘
                          ┌─┴─┐
                 ┌────────┤UI├────────┐
                 │        └───┘        │
                 ▼                     ▼
        ┌─────────────────┐   ┌──────────────────┐
        │  Client-Side    │   │   Server-Side    │
        │    (Browser)    │   │   (Next.js API)  │
        └────────┬────────┘   └─────────┬────────┘
                 │                      │
                 ▼                      ▼
        ┌─────────────────┐   ┌──────────────────┐
        │  Local Storage  │   │  External APIs   │
        └─────────────────┘   └──────────────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │  PetFinder API   │
                             └──────────────────┘
                                      │
                                      ▼
                             ┌──────────────────┐
                             │    OpenAI API    │
                             └──────────────────┘
```

### Key Components

1. **Client-Side (Browser)**
   - React components for UI
   - Client-side state management
   - Form handling and validation
   - API requests via fetch
   - LocalStorage for data persistence

2. **Server-Side (Next.js API)**
   - API route handlers
   - External API integration
   - Server-side rendering
   - Environment variable management

3. **External APIs**
   - PetFinder API for pet data
   - OpenAI API for recommendations
   - Geocoding services for location

## Data Flow Architecture

### Search Flow

```
┌───────────────────────────────────────────────────────────┐
│                         Search Flow                           │
└───────────────────────────┬───────────────────────────────────┘
                            │
                  ┌─────────┴────────────┐
                  │                      │
        ┌─────────▼─────────┐   ┌────────▼─────────┐
        │  Standard Search   │   │   Quick Search   │
        │       Flow        │   │      Flow        │
        └─────────┬─────────┘   └────────┬─────────┘
                  │                      │
        ┌─────────▼─────────┐   ┌────────▼─────────┐
        │ AI Recommendation │   │ Filter-Enabled   │
        │    Results        │   │    Results       │
        └───────────────────┘   └──────────────────┘
```

### Parallel Search Flows

The application implements two parallel search flows that share common components but provide different user experiences:

1. **Standard Search Flow**
   - Step-by-step guided search process
   - Pet type selection followed by zip code entry
   - Results displayed with AI-powered recommendations
   - Filter buttons locked to focus attention on recommendations

2. **Quick Search Flow**
   - Streamlined search process via navigation button
   - Skips pet type selection when zip code is available
   - Results displayed with enabled filter functionality at `/alt-results`
   - No AI recommendations to maintain simple browsing experience

This dual-flow approach allows the application to serve different user preferences while maintaining a consistent visual design and user experience. The implementation uses separate page components rather than conditional rendering to keep the codebase clean and maintainable.

### Data Persistence

```
┌───────────┐    ┌───────────┐    ┌───────────┐
│   User    │    │    URL    │    │  Local    │
│   Input   │───►│ Parameters│───►│  Storage  │
└───────────┘    └───────────┘    └───────────┘
                                        │
                                        ▼
                                  ┌───────────┐
                                  │  Session  │
                                  │Persistence│
                                  └───────────┘
```

## Component Architecture

The application follows a composition-based component architecture:

```
┌───────────────────────────────────────────────────────────┐
│                         Layout                             │
└───────────────────────────┬───────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
    ┌─────────▼─────────┐   │    ┌────────▼─────────┐
    │       Page        │   │    │      Page        │
    │    Components     │   │    │   Components     │
    └─────────┬─────────┘   │    └────────┬─────────┘
              │             │             │
    ┌─────────▼─────────┐   │    ┌────────▼─────────┐
    │     Feature       │   │    │     Feature      │
    │    Components     │   │    │    Components    │
    └─────────┬─────────┘   │    └────────┬─────────┘
              │             │             │
              └─────────────▼─────────────┘
                            │
                  ┌─────────▼─────────┐
                  │        UI         │
                  │     Components    │
                  └───────────────────┘
```

### Component Types

1. **Page Components**: Top-level components that represent entire pages
   - Home page
   - Results page
   - Pet details page

2. **Feature Components**: Reusable components that implement specific features
   - AiRecommendation
   - PetCard
   - SearchForm
   - Questionnaire

3. **UI Components**: Primitive components that form the building blocks of the UI
   - Button
   - Input
   - Checkbox
   - Card

## State Management Architecture

The application uses a distributed state management approach:

```
┌───────────────────────────────────────────────────────────┐
│                    State Management                        │
└───────────────────────────┬───────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
  ┌─────────▼────────┐     │     ┌─────────▼────────┐
  │  Component State │     │     │   LocalStorage   │
  │    (useState)    │     │     │                  │
  └─────────┬────────┘     │     └─────────┬────────┘
            │              │               │
            └──────────────▼───────────────┘
                           │
                 ┌─────────▼────────┐
                 │   URL Parameters │
                 │                  │
                 └──────────────────┘
```

### State Types

1. **Component State**: Local state managed with useState hooks
   - Form inputs
   - UI state (loading, error)
   - Temporary data

2. **LocalStorage**: Persistent client-side storage
   - User preferences
   - Search history
   - Cached responses

3. **URL Parameters**: State in the URL
   - Search parameters
   - Filter selections
   - Shareable state

## API Integration Architecture

```
┌───────────────────────────────────────────────────────────┐
│                    API Integration                         │
└───────────────────────────┬───────────────────────────────┘
                            │
      ┌─────────────────────┼─────────────────────┐
      │                     │                     │
┌─────▼─────┐        ┌──────▼─────┐        ┌──────▼─────┐
│ PetFinder │        │   OpenAI   │        │ Geocoding  │
│    API    │        │    API     │        │  Services  │
└─────┬─────┘        └──────┬─────┘        └──────┬─────┘
      │                     │                     │
      └─────────────────────┼─────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  API Gateway   │
                    │  (Next.js API) │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │Client Components│
                    │                │
                    └────────────────┘
```

## Deployment Architecture

The application is deployed on Vercel with the following architecture:

```
┌───────────────────────────────────────────────────────────┐
│                  Deployment Architecture                   │
└───────────────────────────┬───────────────────────────────┘
                            │
      ┌─────────────────────┼─────────────────────┐
      │                     │                     │
┌─────▼─────┐        ┌──────▼─────┐        ┌──────▼─────┐
│  Vercel   │        │  Serverless │        │   Edge     │
│  Hosting  │        │  Functions  │        │  Network   │
└─────┬─────┘        └──────┬─────┘        └──────┬─────┘
      │                     │                     │
      └─────────────────────┼─────────────────────┘
                            │
                     ┌──────▼─────┐
                     │   Client   │
                     │  Browser   │
                     └────────────┘
```

## Future Architecture Considerations

### User Authentication
```
┌───────────────────────────────────────────────────────────┐
│                 Authentication Architecture                │
└───────────────────────────┬───────────────────────────────┘
                            │
      ┌─────────────────────┼─────────────────────┐
      │                     │                     │
┌─────▼─────┐        ┌──────▼─────┐        ┌──────▼─────┐
│   Auth     │        │   Token    │        │   User     │
│  Provider  │        │  Storage   │        │  Profile   │
└─────┬─────┘        └──────┬─────┘        └──────┬─────┘
      │                     │                     │
      └─────────────────────┼─────────────────────┘
                            │
                    ┌───────▼────────┐
                    │ Protected Routes│
                    │                │
                    └────────────────┘
```

### Advanced State Management
If the application grows in complexity, a more robust state management solution might be needed:

```
┌───────────────────────────────────────────────────────────┐
│              Advanced State Management                     │
└───────────────────────────┬───────────────────────────────┘
                            │
      ┌─────────────────────┼─────────────────────┐
      │                     │                     │
┌─────▼─────┐        ┌──────▼─────┐        ┌──────▼─────┐
│   React    │        │    API     │        │ Persistent │
│  Context   │        │   State    │        │   State    │
└─────┬─────┘        └──────┬─────┘        └──────┬─────┘
      │                     │                     │
      └─────────────────────┼─────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Components    │
                    │                │
                    └────────────────┘
```

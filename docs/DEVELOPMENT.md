# Development Guide

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm 9+
- Git

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd findmepet
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy the template from `env-template.md` to create a `.env.local` file
   - Add your API keys (see [API-INTEGRATIONS.md](API-INTEGRATIONS.md) for details)

4. Start the development server:
   ```bash
   npm run dev
   ```
   
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables
For security reasons, the `.env.local` file is not included in version control. You'll need to set up the following environment variables:

```
PETFINDER_API_KEY=your_petfinder_api_key
PETFINDER_SECRET=your_petfinder_secret
OPENAI_API_KEY=your_openai_api_key
```

Refer to `env-template.md` for the complete list of required environment variables.

## Development Guidelines

### Code Structure
- **app/**: Next.js App Router components and pages
- **components/**: Reusable React components
- **hooks/**: Custom React hooks
- **lib/**: Utility functions and libraries
- **public/**: Static assets
- **styles/**: Global styles and Tailwind configuration

### Current Development Status
- The development server is currently running on `localhost:3000`. Do not attempt to start a new dev server.
- See [STATUS.md](STATUS.md) for current implementation status and known issues.

### Coding Standards
- Use TypeScript for type safety
- Follow ESLint rules configured in the project
- Use Tailwind CSS for styling
- Implement responsive design with mobile-first approach
- Document new components and update existing documentation

### Commit Guidelines
- Use descriptive commit messages
- Reference issue numbers when applicable
- Keep commits focused on single concerns

### Pull Request Process
1. Ensure all tests pass
2. Update documentation to reflect changes
3. Resolve any merge conflicts
4. Request review from maintainers

## Build and Deployment

### Building for Production
```bash
npm run build
```

### Running Production Build Locally
```bash
npm run start
```

### Deployment
The application is configured for deployment on Vercel. Each push to the main branch triggers a deployment.

## Troubleshooting
- **API Authentication Issues**: Ensure your API keys are correctly set in `.env.local`
- **Build Errors**: Run `npm install` to ensure all dependencies are up to date
- **Type Errors**: Run `npm run lint` to identify and fix type issues

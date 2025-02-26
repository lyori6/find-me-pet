# Project Instructions

## Documentation Updates
- Always check and update documentation in the `docs` folder to reflect the latest changes made to the codebase.

## Development Environment
- The development server is currently running on `localhost:3000`. Do not attempt to start a new dev server.

## Environment Variables
- Do not access the `.env.local` file as it is included in `.gitignore`. Instead, use the `env-template.md` located in the `docs` folder for environment variable setup.

## OpenAI Prompt
for visibility:
OPENAI_PROMPT="Based on these available animals, provide a single recommendation for the best match. Your response should: 1. Select ONE specific pet from the list above; 2. Provide a friendly, compassionate explanation (2-3 sentences) of why this pet might be a good match; 3. Include 3 specific matching qualities (expressed as percentages between 70-95%) that make this pet a good companion. Your response should ONLY include: - Name of the selected pet - Brief explanation of why it's a good match - Three match qualities with percentages. DO NOT include any other information. Keep your response concise and focused."

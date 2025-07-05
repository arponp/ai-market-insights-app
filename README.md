# AI Market Insights App

A ChatGPT-like interface for asking financial questions about companies and getting AI-powered market insights. Built with React and the Ontology SDK.

## Features

- **Chat Interface**: Clean, modern chat UI similar to ChatGPT
- **Animated Placeholders**: Typewriter effect showing example financial questions
- **Real-time Responses**: Get instant financial analysis and insights
- **Company Focus**: Specialized in financial data for companies like Apple, Google, etc.
- **Modern UI**: Responsive design with smooth animations

## Example Questions

- "What is Apple's current market cap?"
- "How has Apple's revenue grown over the past 5 years?"
- "What are Apple's main revenue streams?"
- "Compare Apple's P/E ratio to competitors"
- "What is Apple's debt-to-equity ratio?"
- "How much cash does Apple have on hand?"

## Developing

Run the following command to start a local development server on `http://localhost:5173`:

```sh
npm run dev
```

Development configuration is stored in `.env.development`.

In order to make API requests to Foundry, a CORS proxy has been set up for local development which may be removed if the stack is configured to allow `http://localhost:5173` to load resources. The configured OAuth client must also allow `http://localhost:5173/auth/callback` as a redirect URL.

## Deploying

Run the following command to create a production build of your application:

```sh
npm run build
```

Production configuration is stored in `.env.production`.

If you did not fill in the URL your production application will be hosted on you will need to fill in the `VITE_FOUNDRY_REDIRECT_URL` in `.env.production`. A default test is included in `env.test.ts` to verify your production environment variables which you can enable by removing the skip condition or running tests with the environment variable set `VERIFY_ENV_PRODUCTION=true`.

In order to make API requests to Foundry, CORS must be configured for the stack to allow the production origin to load resources. This will be automatically done for you if you are using Foundry website hosting. The configured OAuth client must also allow the production origin auth callback as a redirect URL.

A `foundry.config.json` file is included in the root of this project to make deploying to Foundry website hosting with [`@osdk/cli`](https://www.npmjs.com/package/@osdk/cli) easier. If you are not using Foundry website hosting for your application you may delete this file.

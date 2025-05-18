
# TradeWatch AI - AI-Powered Trading Signal Validator

TradeWatch AI is a Next.js application that leverages Generative AI (via Genkit and Google's Gemini models) to propose and validate trading signals for financial assets. Users can input an asset and an approximate date/time, and the AI will generate a potential trading signal, including an identifier, trade direction, entry price, stop loss, take profit levels, timeframe, exact signal timestamp, and reasoning. These signals can also be automatically sent to a configured Discord server.

## Features

*   **AI-Powered Signal Proposal:** Provide an asset and an approximate date/time for the AI to analyze.
*   **Detailed Signal Generation:** The AI determines:
    *   A unique Signal Identifier (e.g., "AAPL - Momentum Surge")
    *   Optimal Trade Direction (BUY/SELL)
    *   Precise Entry Price
    *   Strategic Stop Loss (SL) level
    *   Up to two Take Profit (TP) levels
    *   Appropriate Timeframe (e.g., 15m, 1H, 4H)
    *   Exact Signal Timestamp (UTC)
    *   Concise Reason for the proposal
*   **Internal AI Validation:** The AI internally assesses the strength and validity of its own proposal before presenting it.
*   **Discord Integration:** Validated signals are automatically sent to a configured Discord server via Webhooks.
*   **Modern Tech Stack:** Built with Next.js (App Router, Server Components), React, ShadCN UI, Tailwind CSS, and Genkit.

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the Repository (If you don't have the code yet)

If you're starting from scratch, clone the repository to your local machine:

```bash
git clone <repository_url>
cd <project_directory_name>
```

If you already have the project files, you can skip this step.

### 2. Install Dependencies

Navigate to the project's root directory in your terminal and install the necessary Node.js packages:

```bash
npm install
```

This command reads the `package.json` file and downloads all required libraries and tools into the `node_modules` folder.

### 3. Set Up Environment Variables

The application requires certain environment variables to function correctly, especially for API keys and webhook URLs.

1.  **Create a `.env` file:** In the root directory of the project, create a new file named `.env`.
2.  **Add the following variables:** Copy the content below into your `.env` file and replace the placeholder values with your actual credentials.

    ```env
    # Discord Webhook URL (Required for sending signals to Discord)
    # Get this from your Discord Server Settings > Integrations > Webhooks > New Webhook
    DISCORD_WEBHOOK_URL=your_actual_discord_webhook_url_here

    # Google AI API Key (Required for Genkit to use Gemini models)
    # Get this from Google AI Studio or Google Cloud Console.
    # Ensure the API key has access to the "Generative Language API" or "Vertex AI API"
    # depending on the model you are using (e.g., Gemini).
    GOOGLE_API_KEY=your_google_ai_api_key_here
    ```

    *   **`DISCORD_WEBHOOK_URL`**: Essential for the Discord notification feature. If not provided, Discord notifications will be skipped.
    *   **`GOOGLE_API_KEY`**: Essential for the Genkit AI flows to interact with Google's Gemini models.

### 4. Run the Genkit Development Server

Genkit handles the AI flows. You need to run its development server.

Open a **new terminal window/tab**, navigate to the project's root directory, and run:

```bash
npm run genkit:watch
```

*   **What this command does:**
    *   It executes `genkit start -- tsx --watch src/ai/dev.ts`.
    *   `genkit start`: Starts the Genkit development toolkit.
    *   `-- tsx`: Instructs Genkit to use `tsx` (a TypeScript executor) to run your AI flow files.
    *   `--watch src/ai/dev.ts`: Watches your AI flow files (starting with `src/ai/dev.ts` and its imports) for changes. If you modify and save an AI-related file, Genkit will automatically restart and reload your flows.
*   **Genkit Developer UI:** This server usually starts on `http://localhost:3400`. You can open this URL in your browser to access the Genkit Developer UI, where you can inspect your flows, test them, and view logs.

If you prefer to run Genkit without automatic reloading on file changes, you can use:
```bash
npm run genkit:dev
```

### 5. Run the Next.js Development Server

This server handles your web application (frontend and Next.js backend components).

Open **another new terminal window/tab** (keep the Genkit server running), navigate to the project's root directory, and run:

```bash
npm run dev
```

*   **What this command does:**
    *   It executes `next dev --turbopack -p 9002`.
    *   `next dev`: Starts the Next.js development server.
    *   `--turbopack`: Uses Turbopack, a fast Rust-based bundler, for quicker development builds and updates.
    *   `-p 9002`: Specifies that the Next.js application should run on port `9002`. If this port is in use, Next.js might try the next available port (e.g., `9003`), or you can change this port number in the `package.json` script.

### 6. Access Your Application

Once both servers (Genkit and Next.js) are running without errors:

*   **Web Application:** Open your web browser and go to `http://localhost:9002`. You should see the TradeWatch AI application.
*   **Genkit Developer UI:** Open `http://localhost:3400` (or the port shown in the Genkit terminal) to inspect and test your AI flows.

### 7. Using the Application

1.  On the homepage (`http://localhost:9002`), enter a financial asset symbol (e.g., "AAPL", "EUR/USD", "TSLA").
2.  Select an approximate date and time (UTC) around which you want the AI to look for a signal.
3.  Click "Get AI Trade Proposal".
4.  The AI will process your request, generate a signal proposal, and validate it.
5.  If a valid signal is found, it will be displayed on the page and sent to your configured Discord channel. If no strong signal is identified, a message will indicate this.

### 8. Stopping the Servers

To stop the local development servers:

*   In each terminal window where a server is running (Genkit and Next.js), press `Ctrl+C`.
*   Confirm if prompted.

## Project Structure Highlights

*   `src/app/`: Contains the Next.js pages and layout components (App Router).
*   `src/components/`: Contains reusable React components, including ShadCN UI components.
*   `src/ai/`: Houses all Genkit-related code.
    *   `src/ai/flows/`: Defines the AI logic using Genkit flows.
    *   `src/ai/genkit.ts`: Genkit initialization and configuration.
    *   `src/ai/dev.ts`: Development entry point for Genkit.
*   `src/lib/`: Utility functions and type definitions.
    *   `src/lib/types.ts`: Shared TypeScript type definitions.
*   `src/services/`: Contains services like `discord-service.ts`.
*   `public/`: Static assets.
*   `.env`: Environment variable configurations (ignored by Git).
*   `package.json`: Project dependencies and scripts.
*   `tailwind.config.ts`: Tailwind CSS configuration.
*   `next.config.ts`: Next.js configuration.

## Troubleshooting

*   **Hydration Errors:** If you encounter hydration errors in Next.js, ensure that any client-side specific rendering (like `new Date()` formatting for display) is deferred until after the component has mounted using `useEffect` and a state variable (e.g., `isClient`).
*   **Genkit Errors:**
    *   Check the Genkit terminal for error messages.
    *   Ensure your `GOOGLE_API_KEY` is correct and has the necessary permissions.
    *   Verify that the model name specified in your flows (e.g., `gemini-2.0-flash`) is available and accessible with your API key.
*   **Discord Notifications Not Sending:**
    *   Double-check that `DISCORD_WEBHOOK_URL` in your `.env` file is correct.
    *   Ensure your Discord server and channel permissions allow webhooks.
    *   Check the Next.js server terminal (where `npm run dev` is running) for any error messages from the `discord-service.ts`.

---

Happy Trading Signal Hunting!

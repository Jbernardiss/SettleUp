# SettleUp ✨

Settle group expenses with ease, powered by Stellar for payments and unique NFT receipts for every settled event. This full-stack application provides a smooth way to track shared costs and finalize balances on the blockchain.

-----

## What is SettleUp?

SettleUp is a monorepo project designed to simplify expense sharing for any event, from a weekend trip with friends to a team lunch. It combines a modern web interface with a robust backend and leverages the Stellar network for fast, low-cost settlements and optional commemorative NFTs.

### Core Features

  * **💸 Easy Expense Splitting**: Create events, invite members via QR code, and log shared expenses.
  * **🚀 Stellar-Powered Payments**: When it's time to settle, the app calculates who owes whom and guides users through payments on the Stellar network using the Freighter wallet.
  * **🖼️ Unique NFT Receipts**: As a unique memento, the event organizer can mint a commemorative NFT on the Stellar testnet for all participants once the event is settled.
  * **🔔 Real-time Notifications**: Users receive notifications to approve expenses and to pay their final balances.

-----

## 🛠️ Tech Stack

| Backend                               | Frontend                  |
| ------------------------------------- | ------------------------- |
| **Node.js / Express** (Serverless)    | **Vite / React** |
| **Firebase Firestore** (Database)     | **Stellar SDK** |
| **Vercel** (Deployment)               | **Freighter** (Wallet)    |

-----

## 🚀 Getting Started (Local Development)

Ready to run SettleUp locally? Let's get you set up in a few simple steps.

### 1\. Prerequisites

Make sure you have the following installed and set up:

  * [ ] **Node.js** (v18 or higher)
  * [ ] A **Firebase project** with Firestore enabled.
  * [ ] **Freighter Wallet** browser extension for interacting with the frontend.
  * [ ] (Optional) Two **Stellar testnet accounts** (an issuer and a distributor) if you want to test NFT minting.

### 2\. Configuration (Environment Variables)

You'll need to set up environment variables for both the backend and frontend.

#### **Backend Server**

Create a `.env` file in the **root** of the project and add your Firebase credentials:

```bash
# .env
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-....@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
```

> **ℹ️ Important Note:** When deploying to a CI/CD environment like Vercel, you'll need to escape the newlines in your `FIREBASE_PRIVATE_KEY`. The application code is already set up to handle this by replacing `\\n` with `\n`.

#### **Frontend App**

Create a `.env` file inside the `SettleUpFrontend/` directory. These are only required if you want to test the NFT minting feature.

```bash
# SettleUpFrontend/.env
VITE_STELLAR_ISSUER_SECRET="S..."
VITE_STELLAR_DISTRIBUTOR_SECRET="S..."
```

### 3\. Install & Run the App

#### **Backend**

Open your terminal in the project's root directory:

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Start the server
npm start
```

Your backend API will now be running locally\!

#### **Frontend**

Open a **new terminal** and navigate to the frontend directory:

```bash
# 1. Go to the frontend directory
cd SettleUpFrontend

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

You can now open your browser to the local address provided by Vite to use the app.

-----

## ☁️ Deployment (Vercel)

This project is optimized for serverless deployment on **Vercel**.

1.  Push your code to a Git repository (GitHub, GitLab, etc.).
2.  Import the repository into your Vercel account.
3.  Vercel should automatically detect the Node.js backend. The included `vercel.json` file properly routes all `/api` requests to the serverless backend.
4.  **Crucially**, add your `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` as environment variables in your Vercel project settings.
5.  Deploy\! Vercel will build both the backend and frontend and handle all routing.

-----

## 🏗️ Project Deep Dive

\<details\>
\<summary\>\<strong\>Click to expand for technical details\</strong\>\</summary\>

### Monorepo Structure

```
.
├── SettleUpFrontend/   # Vite + React Frontend App
└── src/                # Node.js + Express Backend App
```

### Key API Endpoints

  * `GET /api/events/:eventId` - Get details for a specific event.
  * `GET /api/events/user/:userId` - Get all events a user is a member of.
  * `POST /api/events` - Create a new event.
  * `POST /api/events/:eventId/add_user` - Add a user to an event.
  * `POST /api/events/:eventId/finish` - Settle an event and generate the payment plan.
  * `GET /api/expenses/:expenseId` - Get details for a specific expense.
  * `POST /api/expenses/create` - Create a new expense.
  * `GET /api/notifications/:userId/get` - Get all notifications for a user.
  * `POST /api/notifications/answer_expense` - Accept or reject an expense notification.

### Firestore Collections

  * **events**: Stores event information, including `name`, `members[]`, `expenses[]`, `totalAmount`, and `status`.
  * **expenses**: Stores individual expense details like `amount`, `event` reference, and `nAccepted`.
  * **notifications**: Manages all user notifications for expenses and final settlements.

### Development Notes

  * **CORS Enabled**: The server is configured with CORS to allow requests from the frontend.
  * **Vercel Compatibility**: The main server file (`src/server.ts`) exports the Express `app` instance without calling `app.listen()`, as required by Vercel's serverless environment.
  * **SPA Fallback**: The server is configured to serve the frontend's `index.html` for any non-API routes, allowing client-side routing to work seamlessly.

\</details\>

-----

## 📄 License

This project is licensed under the **MIT License**. Feel free to adapt it and make it your own\!

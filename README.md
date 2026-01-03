# testReadMe
[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/Chatchaphon-3/testReadMe)

This repository contains the backend service for a sports betting application, built with Node.js, Express, TypeScript, and Prisma. It provides a RESTful API for managing users, sports, teams, matches, and bets, with authentication handled by Google OAuth.

## Features

-   **User Authentication**: Secure login and logout using Google OAuth 2.0, restricted to Chula University student emails (`@student.chula.ac.th`).
-   **Role-Based Access Control**: Differentiates between `ADMIN` and `USER` roles to secure administrative endpoints.
-   **Betting System**: Users can place bets (points) on match outcomes. Bets are settled automatically after match results are recorded.
-   **Sports & Match Management**: Admins can create, view, update, and delete sports, teams, and matches.
-   **Dynamic Sport Formats**: Supports both `ONE_ON_ONE` and Free-For-All (`FFA`) sport formats, with configurable scoring rules.
-   **Transaction History**: Tracks all user point transactions, including placing bets and receiving winnings.
-   **Leaderboard**: Public endpoint to view top users ranked by points.

## Database Schema

The application uses a PostgreSQL database managed by Prisma. The schema is defined in `prisma/schema.prisma` and includes the following main models:

-   `User`: Stores user profile information, points balance, role, and authentication details.
-   `Sport`: Defines different sports, including their format (`ONE_ON_ONE` or `FFA`) and scoring order (`ASC` or `DESC`).
-   `Team`: Represents a team or individual participant associated with a specific sport.
-   `Match`: An event between two or more teams, with start/end times and settlement status.
-   `MatchTeam`: A pivot model linking `Team` and `Match`, which stores the score for each team in a match.
-   `Bet`: Records a user's bet on a specific match, including the stake and predicted winner.
-   `Transaction`: Logs all point changes for a user, linked to actions like placing a bet or receiving an admin grant.

## Prerequisites

-   Node.js (version 24 or higher)
-   Docker and Docker Compose
-   `npm` or a compatible package manager

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/chatchaphon-3/testreadme.git
cd testreadme
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project and add the following variables. These are essential for connecting to the database and enabling Google OAuth.

```env
# Example .env file

# Connection string for your PostgreSQL database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Google OAuth Client ID
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"

# Secret for signing JWTs
JWT_SECRET="YOUR_JWT_SECRET"
```

### 4. Set Up and Seed the Database

The repository includes scripts to manage a PostgreSQL database using Docker.

```bash
# Create the Docker container for the PostgreSQL database
npm run db.create

# Start the database container
npm run db.start

# Apply Prisma migrations to set up the schema
npm run db.migrate

# (Optional) Seed the database with sample data for development
npm run db.seed
```

## Running the Application

### Development Mode

To run the server in development mode with hot-reloading:

```bash
npm run dev
```

The server will start on `http://localhost:4000` (or the port specified by `PORT` in your `.env` file).

### Production Mode

To build and run the application for production:

```bash
# Build the TypeScript project
npm run build

# Start the server
npm run start
```

## Available Scripts

-   `npm run dev`: Starts the development server using `tsx`.
-   `npm run build`: Compiles the TypeScript source code to JavaScript in the `dist` directory.
-   `npm run start`: Starts the compiled application from the `dist` directory.
-   `npm run lint`: Lints the source code using ESLint.
-   `npm run db.create`: Creates a PostgreSQL Docker container named `cp-olympic-db`.
-   `npm run db.start`: Starts the database container.
-   `npm run db.generate`: Generates Prisma Client based on the schema.
-   `npm run db.migrate`: Applies pending database migrations.
-   `npm run db.seed`: Populates the database with seed data from `prisma/seed.ts`.
-   `npm run db.studio`: Opens Prisma Studio to view and edit database content.

## API Endpoints

All API endpoints are prefixed with `/v1`.

### Authentication (`/auth`)

-   `POST /login`: Log in with a Google ID token.
-   `POST /logout`: Log out the current user (requires authentication).

### Users (`/users`)

-   `GET /me`: Get the profile of the currently authenticated user.
-   `GET /me/bets`: Get bets placed by the current user.
-   `POST /me/bets`: Place a new bet.
-   `GET /me/transactions`: Get the transaction history for the current user.
-   `GET /top`: Get the leaderboard of top users by points.
-   `GET /`: (Admin) Get a list of all users.
-   `GET /:id`: (Admin) Get a specific user by ID.

### Matches (`/matches`)

-   `GET /`: Get a list of all matches. Supports filtering and pagination.
-   `POST /`: (Admin) Create a new match.
-   `GET /:id`: Get details for a specific match.
-   `PUT /:id/results`: (Admin) Record the results for a settled match.

### Teams (`/teams`)

-   `GET /`: Get a list of all teams.
-   `POST /`: (Admin) Create a new team.
-   `GET /:id`: Get details for a specific team.
-   `PATCH /:id`: (Admin) Update a team's details.
-   `DELETE /:id`: (Admin) Delete a team.

### Bets (`/bets`)

-   `GET /`: (Admin) Get a list of all bets.
-   `GET /:id`: (Admin) Get a specific bet by ID.

### Transactions (`/transactions`)

-   `GET /`: (Admin) Get a list of all transactions.
-   `GET /:id`: (Admin) Get a specific transaction by ID.
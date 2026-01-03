## Getting Started

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
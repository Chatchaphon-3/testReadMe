## API Endpoints

All API endpoints are prefixed with `/v1`.

### Authentication (`/auth`)

- `POST /auth/login`: Log in with a Google ID token.

```json
// Request (body)
{ "googleIdToken": "ya29.a0Af..." }

// Example response
{
  "success": true,
  "data": "eyJhbGciOiJI..." // access token
}
```

- `POST /auth/logout`: (requireAuth) Log out the current user.

```json
// Example response
{
  "success": true,
  "data": { "id": 12, "username": "alice", "email": "alice@example.com" }
}
```

### Users (`/users`)

- `GET /users/me`: (requireAuth) Get the profile of the currently authenticated user.

Example URL: `http://localhost:3000/v1/users/me`

```json
// Example response
{
  "success": true,
  "data": {
    "id": 12,
    "email": "alice@example.com",
    "username": "alice",
    "points": 120,
    "role": "USER",
    "isActive": true,
    "lastLogoutAt": "2025-12-24T12:34:56.000Z"
  }
}
```

- `GET /me/bets`: (requireAuth) Get bets placed by the current user.

Example URL: `http://localhost:3000/v1/users/me/bets?page=1&pageSize=20&sort=createdAt:desc`

```json
// Example response
{
  "success": true,
  "data": [
    {
      "id": 123,
      "userId": 12,
      "matchId": 45,
      "createdAt": "2025-12-24T10:00:00.000Z",
      "predTeamId": 5,
      "status": "UNSETTLED",
      "stake": 100.5
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 5 }
}
```

- `POST /me/bets`: (requireAuth) Place a new bet.

Example URL: `http://localhost:3000/v1/users/me/bets`

```json
// Request (body)
{ "matchId": 45, "predTeamId": 5, "stake": 100.5 }

// Example response (201)
{
  "success": true,
  "data": {
    "id": 124,
    "userId": 12,
    "matchId": 45,
    "createdAt": "2025-12-24T10:01:00.000Z",
    "predTeamId": 5,
    "status": "UNSETTLED",
    "stake": 100.5
  }
}
```

- `GET /users/me/transactions`: (requireAuth) Get the transaction history for the current user.

Example URL: `http://localhost:3000/v1/users/me/transactions?page=1&pageSize=10&source=OTHER`

```json
// Example response
{
  "success": true,
  "data": [
    {
      "id": 11,
      "userId": 12,
      "amount": 500,
      "issueDate": "2025-12-24T09:00:00.000Z",
      "source": "OTHER",
      "description": "Top-up",
      "referenceId": null
    }
  ],
  "pagination": { "page": 1, "pageSize": 10, "total": 1 }
}
```

- `GET /users/me/bets/:matchId`: (requireAuth) Get a specific bet for the current user by match id.

Example URL: `http://localhost:3000/v1/users/me/bets/45`

```json
// Example response
{
  "success": true,
  "data": {
    "id": 123,
    "userId": 12,
    "matchId": 45,
    "createdAt": "2025-12-24T10:00:00.000Z",
    "predTeamId": 5,
    "status": "UNSETTLED",
    "stake": 100.5
  }
}
```

- `GET /users/top`: Get the leaderboard of top users by points.

Example URL: `http://localhost:3000/v1/users/top?limit=10`

```json
// Example response
{
  "success": true,
  "data": [
    { "id": 3, "email": "bob@example.com", "username": "bob", "points": 1200 }
  ]
}
```

- `GET /users/`: (Admin) Get a list of all users.

Example URL: `http://localhost:3000/v1/users?q=alice&role=USER&page=1`

```json
// Example response
{
  "success": true,
  "data": [
    { "id": 12, "email": "alice@example.com", "username": "alice", "points": 120 }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 1 }
}
```

- `GET /users/:id`: (Admin) Get a specific user by ID.

Example URL: `http://localhost:3000/v1/users/12`

```json
// Example response
{
  "success": true,
  "data": { "id": 12, "email": "alice@example.com", "username": "alice", "points": 120 }
}
```

### Matches (`/matches`)

- `GET /matches/`: Get a list of all matches. Supports filtering and pagination.

Example URL: `http://localhost:3000/v1/matches?date=2025-12-24&sportId=1&page=1`

```json
// Example response
{
  "success": true,
  "data": [
    {
      "id": 45,
      "startDate": "2025-12-24T15:00:00.000Z",
      "endDate": "2025-12-24T17:00:00.000Z",
      "sportId": 1,
      "isSettled": false
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 1 }
}
```

- `POST /matches/`: (Admin) Create a new match.

Example URL: `http://localhost:3000/v1/matches`

```json
// Request (body)
{ "teamIds": [1,2], "startDate": "2025-12-24T15:00:00Z", "endDate": "2025-12-24T17:00:00Z", "sportId": 1 }

// Example response (201)
{
  "success": true,
  "data": {
    "id": 46,
    "startDate": "2025-12-24T15:00:00.000Z",
    "endDate": "2025-12-24T17:00:00.000Z",
    "sportId": 1,
    "isSettled": false
  }
}
```

- `GET /matches/:id`: Get details for a specific match.

Example URL: `http://localhost:3000/v1/matches/45?include=teams`

```json
// Example response
{
  "success": true,
  "data": {
    "id": 45,
    "startDate": "2025-12-24T15:00:00.000Z",
    "endDate": "2025-12-24T17:00:00.000Z",
    "sportId": 1,
    "isSettled": false,
    "teams": [
      { "id": 1, "sportId": 1, "name": "Team A", "members": ["alice","bob"] },
      { "id": 2, "sportId": 1, "name": "Team B", "members": ["charlie"] }
    ]
  }
}
```

- `PUT /matches/:id/results`: (Admin) Record the results for a settled match.

Example URL: `http://localhost:3000/v1/matches/45/results`

```json
// Request (body): map of teamId -> score (ints)
{ "1": 3, "2": 1 }

// Example response
{
  "success": true,
  "data": {
    "id": 45,
    "scores": { "1": 3, "2": 1 },
    "isSettled": true
  }
}
```

### Teams (`/teams`)

- `GET /teams/`: Get a list of all teams.

Example URL: `http://localhost:3000/v1/teams?sportId=1&q=united`

```json
// Example response
{
  "success": true,
  "data": [
    { "id": 1, "sportId": 1, "name": "Team A", "members": ["alice","bob"] }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 1 }
}
```

- `POST /teams/`: (Admin) Create a new team.

Example URL: `http://localhost:3000/v1/teams`

```json
// Request (body)
{ "name": "Team A", "members": ["alice","bob"], "sportId": 1 }

// Example response (201)
{
  "success": true,
  "data": { "id": 10, "sportId": 1, "name": "Team A", "members": ["alice","bob"] }
}
```

- `GET /teams/:id`: Get details for a specific team.

Example URL: `http://localhost:3000/v1/teams/1?include=sport`

```json
// Example response
{
  "success": true,
  "data": {
    "id": 1,
    "sportId": 1,
    "name": "Team A",
    "members": ["alice","bob"],
    "sport": { "id": 1, "name": "Football", "format": "ONE_ON_ONE", "ordering": "ASC" }
  }
}
```

- `PATCH /teams/:id`: (Admin) Update a team's details.

Example URL: `http://localhost:3000/v1/teams/1`

```json
// Request (body) - any field optional
{ "name": "New Team Name", "members": ["alice","charlie"] }

// Example response
{ "success": true, "data": { "id": 1, "sportId": 1, "name": "New Team Name", "members": ["alice","charlie"] } }
```

- `DELETE /teams/:id`: (Admin) Delete a team.

Example URL: `http://localhost:3000/v1/teams/1`

```json
// Example response
{ "success": true, "data": { "id": 1 } }
```

### Bets (`/bets`)

- `GET /bets/`: (Admin) Get a list of all bets.

Example URL: `http://localhost:3000/v1/bets?userId=12&matchId=45`

```json
// Example response
{
  "success": true,
  "data": [
    { "id": 123, "userId": 12, "matchId": 45, "createdAt": "2025-12-24T10:00:00.000Z", "predTeamId": 5, "status": "UNSETTLED", "stake": 100.5 }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 1 }
}
```

- `GET /bets/:id`: (Admin) Get a specific bet by ID.

Example URL: `http://localhost:3000/v1/bets/123`

```json
// Example response
{
  "success": true,
  "data": {
    "id": 123,
    "userId": 12,
    "matchId": 45,
    "createdAt": "2025-12-24T10:00:00.000Z",
    "predTeamId": 5,
    "status": "UNSETTLED",
    "stake": 100.5,
    "match": { "id": 45, "startDate": "2025-12-24T15:00:00.000Z", "sportId": 1 },
    "user": { "id": 12, "email": "alice@example.com", "username": "alice" }
  }
}
```

### Transactions (`/transactions`)

- `GET /transactions/`: (Admin) Get a list of all transactions.

Example URL: `http://localhost:3000/v1/transactions?userId=12&source=BET`

```json
// Example response
{
  "success": true,
  "data": [
    { "id": 11, "userId": 12, "amount": 500, "issueDate": "2025-12-24T09:00:00.000Z", "source": "BET", "description": "Bet payout", "referenceId": null }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 1 }
}
```

- `GET /transactions/:id`: (Admin) Get a specific transaction by ID.

Example URL: `http://localhost:3000/v1/transactions/11`

```json
// Example response
{
  "success": true,
  "data": {
    "id": 11,
    "userId": 12,
    "amount": 500,
    "issueDate": "2025-12-24T09:00:00.000Z",
    "source": "BET",
    "description": "Bet payout",
    "referenceId": null,
    "user": { "id": 12, "email": "alice@example.com", "username": "alice" }
  }
}
```

*** End Patch

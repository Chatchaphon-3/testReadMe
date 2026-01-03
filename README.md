## API Endpoints

All API endpoints are prefixed with `/v1`.

### Authentication (`/auth`)

	```json
	// Request (body)
	{ "googleIdToken": "ya29.a0Af..." }

	// Example response
	{
		"success": true,
		"data": "eyJhbGciOiJI..." // access token
	}
	```

### Users (`/users`)
## API Endpoints

All API endpoints are prefixed with `/v1`.

### Authentication (`/auth`)

- `POST /login`: Log in with a Google ID token.

```json
// Request (body)
{ "googleIdToken": "ya29.a0Af..." }

// Example response
{
  "success": true,
  "data": "eyJhbGciOiJI..." // access token
}
```

- `POST /logout`: (requireAuth) Log out the current user.

```json
// Example response
{
  "success": true,
  "data": { "id": 12, "username": "alice", "email": "alice@example.com" }
}
```

### Users (`/users`)

- `GET /me`: (requireAuth) Get the profile of the currently authenticated user.
## API Endpoints

All API endpoints are prefixed with `/v1`.

### Authentication (`/auth`)

- `POST /login`: Log in with a Google ID token.

```json
// Request (body)
{ "googleIdToken": "ya29.a0Af..." }

// Example response
{
  "success": true,
  "data": "eyJhbGciOiJI..." // access token
}
```

- `POST /logout`: (requireAuth) Log out the current user.

```json
// Example response
{
  "success": true,
  "data": { "id": 12, "username": "alice", "email": "alice@example.com" }
}
```

### Users (`/users`)

- `GET /me`: (requireAuth) Get the profile of the currently authenticated user.

```json
// Example response
{ "success": true, "data": { "id": 12, "username": "alice" } }
```

- `GET /me/bets`: (requireAuth) Get bets placed by the current user.

```json
// Supported query params: page, pageSize, sort (e.g. "stake:asc"), filter fields
// Example request
// GET /v1/users/me/bets?page=1&pageSize=20&sort=createdAt:desc

// Example response
{
  "success": true,
  "data": [ { "id": 123, "matchId": 45, "stake": 100, "predTeamId": 5 } ],
  "pagination": { "page": 1, "pageSize": 20, "total": 5 }
}
```

- `POST /me/bets`: (requireAuth) Place a new bet.

```json
// Request (body)
{ "matchId": 45, "predTeamId": 5, "stake": 100 }

// Example response (201)
{
  "success": true,
  "data": { "id": 124, "userId": 12, "matchId": 45, "predTeamId": 5, "stake": 100 }
}
```

- `GET /me/transactions`: (requireAuth) Get the transaction history for the current user.

```json
// Supported query params: page, pageSize, source
// Example request: GET /v1/users/me/transactions?page=1&pageSize=10&source=DEPOSIT

// Example response
{
  "success": true,
  "data": [ { "id": 11, "amount": 500, "source": "DEPOSIT", "issueDate": "2025-12-24" } ],
  "pagination": { "page": 1, "pageSize": 10, "total": 1 }
}
```

- `GET /me/bets/:matchId`: (requireAuth) Get a specific bet for the current user by match id.

```json
// Path param: matchId
// Optional body field: include (match, user, predTeam)
// Example: GET /v1/users/me/bets/45 with body { "include": ["match"] }

// Example response
{ "success": true, "data": { "id": 123, "matchId": 45, "predTeamId": 5 } }
```

- `GET /top`: Get the leaderboard of top users by points.

```json
// Optional query: limit
// Example: GET /v1/users/top?limit=10

// Example response
{ "success": true, "data": [ { "id": 3, "username": "bob", "points": 1200 } ] }
```

- `GET /`: (Admin) Get a list of all users.

```json
// Supported query params: q, role, isActive, page, pageSize, sort
// Example: GET /v1/users?q=alice&role=USER&page=1

// Example response
{ "success": true, "data": [ { "id":12, "username":"alice" } ], "pagination": { "page":1, "pageSize":20, "total":1 } }
```

- `GET /:id`: (Admin) Get a specific user by ID.

```json
// Path param: id
// Example: GET /v1/users/12

// Example response
{ "success": true, "data": { "id": 12, "username": "alice" } }
```

### Matches (`/matches`)

- `GET /`: Get a list of all matches. Supports filtering and pagination.

```json
// Supported query params: date, sportId, page, pageSize
// Example request: GET /v1/matches?date=2025-12-24&sportId=1&page=1

// Example response
{
  "success": true,
  "data": [ { "id": 45, "teamIds": [1,2], "startDate": "2025-12-24T15:00:00Z" } ],
  "pagination": { "page": 1, "pageSize": 20, "total": 1 }
}
```

- `POST /`: (Admin) Create a new match.

```json
// Request (body)
{ "teamIds": [1,2], "startDate": "2025-12-24T15:00:00Z", "endDate": "2025-12-24T17:00:00Z", "sportId": 1 }

// Example response (201)
{
  "success": true,
  "data": { "id": 46, "teamIds": [1,2], "sportId": 1 }
}
```

- `GET /:id`: Get details for a specific match.

```json
// Path param: id
// Optional query param: include=teams
// Example: GET /v1/matches/45?include=teams

// Example response
{ "success": true, "data": { "id": 45, "teams": [ { "id": 1, "name": "Team A" } ] } }
```

- `PUT /:id/results`: (Admin) Record the results for a settled match.

```json
// Path param: id
// Request (body): map of teamId -> score
// Example body: { "1": 3, "2": 1 }

// Example response
{ "success": true, "data": { "id": 45, "scores": { "1": 3, "2": 1 } } }
```

### Teams (`/teams`)

- `GET /`: Get a list of all teams.

```json
// Supported query params: sportId, matchId, q, page, pageSize
// Example: GET /v1/teams?sportId=1&q=united

// Example response
{ "success": true, "data": [ { "id": 1, "name": "Team A" } ], "pagination": { "page":1, "pageSize":20, "total":1 } }
```

- `POST /`: (Admin) Create a new team.

```json
// Request (body)
{ "name": "Team A", "members": ["alice","bob"], "sportId": 1 }

// Example response (201)
{ "success": true, "data": { "id": 10, "name": "Team A" } }
```

- `GET /:id`: Get details for a specific team.

```json
// Path param: id
// Optional query param: include=sport
// Example: GET /v1/teams/1?include=sport

// Example response
{ "success": true, "data": { "id": 1, "name": "Team A", "sport": { "id":1, "name":"Football" } } }
```

- `PATCH /:id`: (Admin) Update a team's details.

```json
// Request (body) - any field optional
{ "name": "New Team Name", "members": ["alice","charlie"] }

// Example response
{ "success": true, "data": { "id": 1, "name": "New Team Name" } }
```

- `DELETE /:id`: (Admin) Delete a team.

```json
// Path param: id

// Example response
{ "success": true, "data": { "id": 1 } }
```

### Bets (`/bets`)

- `GET /`: (Admin) Get a list of all bets.

```json
// Supported query params: userId, matchId, sort, page, pageSize
// Example: GET /v1/bets?userId=12&matchId=45

// Example response
{ "success": true, "data": [ { "id": 123, "userId": 12, "matchId": 45 } ], "pagination": { "page":1, "pageSize":20, "total":1 } }
```

- `GET /:id`: (Admin) Get a specific bet by ID.

```json
// Path param: id
// Optional body field: include (match,user,predTeam)
// Example: GET /v1/bets/123 with body { "include": ["match","user"] }

// Example response
{ "success": true, "data": { "id": 123, "match": { "id": 45 }, "user": { "id": 12 } } }
```

### Transactions (`/transactions`)

- `GET /`: (Admin) Get a list of all transactions.

```json
// Supported query params: userId, source, page, pageSize
// Example: GET /v1/transactions?userId=12&source=DEPOSIT

// Example response
{ "success": true, "data": [ { "id": 11, "amount": 500, "source": "DEPOSIT" } ], "pagination": { "page":1, "pageSize":20, "total":1 } }
```

- `GET /:id`: (Admin) Get a specific transaction by ID.

```json
// Path param: id
// Optional body field: include (user)
// Example: GET /v1/transactions/11 with body { "include": ["user"] }

// Example response
{ "success": true, "data": { "id": 11, "amount": 500, "user": { "id": 12 } } }
```

*** End Patch

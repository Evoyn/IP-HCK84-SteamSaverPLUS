# SteamSaver+ API Documentation

## Base URL

```
https://goat.nebux.site/
```

## Models

### User

```txt
- id : integer, auto increment, primary key
- username : string, required, unique
- email : string, required, unique, valid email format
- password : string, required
- createdAt : date
- updatedAt : date
```

### GameList

```txt
- id : integer, primary key
- title : string, required
- thumbnail : string
- short_description : text
- game_url : string
- genre : string
- platform : string
- publisher : string
- developer : string
- release_date : date (YYYY-MM-DD)
- freetogame_profile_url : string
- createdAt : date
- updatedAt : date
```

### Genre

```txt
- id : integer, auto increment, primary key
- name : string, required, unique
- description : text
- createdAt : date
- updatedAt : date
```

### Wishlist

```txt
- id : integer, auto increment, primary key
- UserId : integer, required
- GameListId : integer, required
- createdAt : date
- updatedAt : date
```

### UserGenres (Junction Table)

```txt
- UserId : integer, required
- GenreId : integer, required
```

## Relations

- User belongsToMany GameList through Wishlist
- User belongsToMany Genre through UserGenres
- GameList belongsToMany User through Wishlist
- Genre belongsToMany User through UserGenres

## Endpoints

### Public Endpoints

- `GET /` - Hello endpoint
- `POST /register` - User registration
- `POST /login` - User login
- `POST /login/google` - Google OAuth login
- `GET /pub-games` - Get all games (public, with filtering/pagination)
- `GET /pub-games/:id` - Get game by ID (public)

### Protected Endpoints (Require Authentication)

- `GET /games` - Get all games (admin)
- `GET /games/:id` - Get game by ID (admin)
- `POST /games` - Create new game (admin)
- `PUT /games/:id` - Update game (admin)
- `DELETE /games/:id` - Delete game (admin)
- `GET /games/genre` - Get all genres
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `GET /wishlist` - Get user's wishlist
- `POST /wishlist/:gameId` - Add game to wishlist
- `DELETE /wishlist/:gameId` - Remove game from wishlist
- `GET /recommendations` - Get AI-powered game recommendations

---

## 1. GET /

Description:

- Hello world endpoint

_Response (200 - OK)_

```json
{
  "message": "Hello world!"
}
```

---

## 2. POST /register

Description:

- Register a new user with favorite genres

Request:

- body:

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "genres": ["integer array", "1-3 genre IDs", "between 1-18"]
}
```

_Response (201 - Created)_

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string"
  }
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Username is required"
}
OR
{
  "message": "Email is required"
}
OR
{
  "message": "Email must be unique"
}
OR
{
  "message": "Username must be unique"
}
OR
{
  "message": "Genres must be an array with at least 1 item."
}
OR
{
  "message": "You can only select up to 3 genres."
}
OR
{
  "message": "Genre IDs must be numbers between 1 and 18"
}
```

---

## 3. POST /login

Description:

- User login with email and password

Request:

- body:

```json
{
  "email": "string",
  "password": "string"
}
```

_Response (200 - OK)_

```json
{
  "access_token": "string"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Email is required"
}
OR
{
  "message": "Password is required"
}
```

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid email/password"
}
```

---

## 4. POST /login/google

Description:

- Google OAuth login

Request:

- body:

```json
{
  "googleToken": "string"
}
```

_Response (200 - OK)_

```json
{
  "Login": "Google login successful",
  "access_token": "string"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Invalid Google token"
}
```

---

## 5. GET /pub-games

Description:

- Get all games (public endpoint with filtering, sorting, pagination)

Request:

- query parameters:
  - `filter`: string (filter by genre)
  - `sort`: string (sort by createdAt, use "-" prefix for DESC)
  - `search`: string (search by title)
  - `page[size]`: integer (items per page, default: 10)
  - `page[number]`: integer (page number, default: 1)

_Response (200 - OK)_

```json
{
  "page": "integer",
  "data": [
    {
      "id": "integer",
      "title": "string",
      "thumbnail": "string",
      "short_description": "string",
      "game_url": "string",
      "genre": "string",
      "platform": "string",
      "publisher": "string",
      "developer": "string",
      "release_date": "string",
      "freetogame_profile_url": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "totalData": "integer",
  "totalPage": "integer",
  "dataPerPage": "integer"
}
```

---

## 6. GET /pub-games/:id

Description:

- Get game by ID (public)

Request:

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "id": "integer",
  "title": "string",
  "thumbnail": "string",
  "short_description": "string",
  "game_url": "string",
  "genre": "string",
  "platform": "string",
  "publisher": "string",
  "developer": "string",
  "release_date": "string",
  "freetogame_profile_url": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Game not found"
}
```

---

## 7. GET /games/genre

Description:

- Get all available genres

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": "integer",
    "name": "string",
    "description": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

---

## 8. GET /games

Description:

- Get all games (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "id": "integer",
    "title": "string",
    "thumbnail": "string",
    "short_description": "string",
    "game_url": "string",
    "genre": "string",
    "platform": "string",
    "publisher": "string",
    "developer": "string",
    "release_date": "string",
    "freetogame_profile_url": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

---

## 9. GET /games/:id

Description:

- Get game by ID (admin only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "id": "integer",
  "title": "string",
  "thumbnail": "string",
  "short_description": "string",
  "game_url": "string",
  "genre": "string",
  "platform": "string",
  "publisher": "string",
  "developer": "string",
  "release_date": "string",
  "freetogame_profile_url": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Game not found"
}
```

---

## 10. GET /users/:id

Description:

- Get user profile by ID

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

_Response (200 - OK)_

```json
{
  "id": "integer",
  "username": "string",
  "email": "string",
  "createdAt": "string",
  "updatedAt": "string",
  "genres": [
    {
      "id": "integer",
      "name": "string"
    }
  ]
}
```

_Response (404 - Not Found)_

```json
{
  "message": "User not found"
}
```

---

## 11. PUT /users/:id

Description:

- Update user profile (own profile only)

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "id": "integer"
}
```

- body:

```json
{
  "username": "string",
  "genres": ["integer array", "1-3 genre IDs", "between 1-18"]
}
```

_Response (200 - OK)_

```json
{
  "message": "User updated successfully",
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string",
    "Genres": [
      {
        "id": "integer",
        "name": "string"
      }
    ]
  }
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Username is already taken"
}
OR
{
  "message": "At least 1 genre must be selected"
}
OR
{
  "message": "You can only select up to 3 genres"
}
OR
{
  "message": "Genre IDs must be numbers between 1 and 18"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "You can only update your own profile"
}
```

---

## 12. GET /wishlist

Description:

- Get current user's wishlist

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
[
  {
    "UserId": "integer",
    "GameListId": "integer",
    "createdAt": "string",
    "updatedAt": "string",
    "GameList": {
      "id": "integer",
      "title": "string",
      "thumbnail": "string",
      "short_description": "string",
      "game_url": "string",
      "genre": "string",
      "platform": "string",
      "publisher": "string",
      "developer": "string",
      "release_date": "string",
      "freetogame_profile_url": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
]
```

---

## 13. POST /wishlist/:gameId

Description:

- Add game to user's wishlist

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "gameId": "integer"
}
```

_Response (201 - Created)_

```json
{
  "message": "Game added to wishlist",
  "wishlist": {
    "UserId": "integer",
    "GameListId": "integer",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Game not found"
}
```

_Response (400 - Bad Request)_

```json
{
  "message": "Game already in wishlist"
}
```

---

## 14. DELETE /wishlist/:gameId

Description:

- Remove game from user's wishlist

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

- params:

```json
{
  "gameId": "integer"
}
```

_Response (200 - OK)_

```json
{
  "message": "Game removed from wishlist"
}
```

_Response (404 - Not Found)_

```json
{
  "message": "Game not in wishlist"
}
```

---

## 15. GET /recommendations

Description:

- Get AI-powered game recommendations based on user's favorite genres

Request:

- headers:

```json
{
  "Authorization": "Bearer <access_token>"
}
```

_Response (200 - OK)_

```json
{
  "success": true,
  "data": {
    "userId": "integer",
    "favoriteGenres": ["string array"],
    "recommendations": [
      {
        "id": "integer",
        "title": "string",
        "thumbnail": "string",
        "game_url": "string",
        "genre": "string",
        "platform": "string",
        "publisher": "string",
        "developer": "string",
        "release_date": "string",
        "freetogame_profile_url": "string",
        "rating": "integer",
        "fromDatabase": "boolean"
      }
    ]
  }
}
```

_Response (404 - Not Found)_

```json
{
  "success": false,
  "message": "No favorite genres found for user"
}
```

_Response (500 - Internal Server Error)_

```json
{
  "success": false,
  "message": "Failed to generate game recommendations"
}
```

---

## Global Error Responses

_Response (401 - Unauthorized)_

```json
{
  "message": "Invalid token"
}
```

_Response (403 - Forbidden)_

```json
{
  "message": "You are not authorized"
}
```

_Response (500 - Internal Server Error)_

```json
{
  "message": "Internal server error"
}
```

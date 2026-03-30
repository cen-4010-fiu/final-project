# Profile Management Feature

User account creation and profile management.

## Endpoints

| Method | Path                 | Description         |
| ------ | -------------------- | ------------------- |
| POST   | /api/users           | Create user account |
| GET    | /api/users/:username | Get user profile    |
| PATCH  | /api/users/:username | Update user profile |

## Sprint 3 TODO

- [ ] POST /api/users/:username/creditcards - Add credit card
- [ ] GET /api/users/:username/creditcards - List credit cards

## Notes

- Passwords hashed with bcrypt
- Email cannot be updated after creation (per spec)
- Password never returned in API responses

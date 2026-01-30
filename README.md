# Final Project

CEN 4010 Spring 2026 Final Project

## Necessary

```bash
cp .env.example .env
docker compose up -d

bun run db:push
bun run db:seed

bun run dev
```

- Check out logs in terminal
- See api docs and client [locally](http://localhost:3000/docs).

## Extras

```
bun run db:studio
docker logs -f swe-db-container
```

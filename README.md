# Initial setup

Note that the following files must be provided externally, e.g. with a soft link to files hosted in a different git repository:

```
/src/lib/components/results
/src/routes/(registered)/+page.svelte
```

Furthermore, the database must contain a sensible default configuration in order for this tool to work.

# Docker

Create .env.production based on env.sample. Run:

```bash
docker compose -f "docker-compose.yml" up -d --build
```

To inspect logs:

```bash
docker logs docker_container_name
```

See running containers:

```bash
docker ps -a
```

# Working with prisma

Format the prisma schema file:
```bash
npx prisma format
```

Update schema while prototyping:
```bash
npx prisma db push
```

Create migration:
```bash
npx prisma migrate dev --name name_of_migration
```

Migrate in production. Note that this requires prisma as dependency, either in a separate docker container with the prisma schema files or added to the main SvelteKit application.
```bash
npx prisma migrate deploy
```

# Developing

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

# Testing

For testing, Playwright is used.

To run all tests, first start a local instance of the app configured with questionnaire Dramadreieck and then execute:

```bash
npx playwright test
```

In Visual Studio Code, you can run and debug tests with the extension described in https://playwright.dev/docs/getting-started-vscode.

# Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

# personal notes

Note that currently, prisma migrations are not applied automatically.

Run the following to migrate the database:

```bash
docker exec -it docker_container_name npx prisma migrate deploy
```

To load dump.sql in docker container:

```bash
docker cp dump.sql db-container-name:/dump.sql
docker exec -it db-container-name bash
cat dump.sql | psql -U username -d prisma_database
```

## Database inspection

```sql
SELECT rs.id, rs."createdAt", u.name, t.name 
FROM "ResultSet" rs
LEFT JOIN "User" u ON rs."userId" = u.id
LEFT JOIN "_resultSetToTeams" rstt ON rstt."A" = rs.id
LEFT JOIN "Team" t ON t.id = rstt."B"
ORDER BY rs."createdAt" DESC;
```
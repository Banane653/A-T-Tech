# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. Always use the App Router (`src/app/`) and never the Pages Router.
# Prisma Database Workflow
When modifying the database structure:
1. Always update the `prisma/schema.prisma` file first.
2. Ensure relationships between models are correctly bidirectional.
3. REMINDER: You cannot run `npx prisma db push` or `npx prisma migrate dev` yourself if the environment is locked. Always instruct the user to run these commands in their local terminal after a schema change.

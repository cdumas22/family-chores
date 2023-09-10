# base node image
FROM node:16-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /family-chores

ADD package.json .npmrc ./
RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps

WORKDIR /family-chores

COPY --from=deps /family-chores/node_modules /family-chores/node_modules
ADD package.json .npmrc ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

WORKDIR /family-chores

COPY --from=deps /family-chores/node_modules /family-chores/node_modules

ADD prisma .
RUN npx prisma generate

ADD . .
RUN npm run build

# Finally, build the production image with minimal footprint
FROM base

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT="8080"
ENV NODE_ENV="production"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /family-chores

COPY --from=production-deps /family-chores/node_modules /family-chores/node_modules
COPY --from=build /family-chores/node_modules/.prisma /family-chores/node_modules/.prisma

COPY --from=build /family-chores/build /family-chores/build
COPY --from=build /family-chores/public /family-chores/public
COPY --from=build /family-chores/package.json /family-chores/package.json
COPY --from=build /family-chores/start.sh /family-chores/start.sh
COPY --from=build /family-chores/prisma /family-chores/prisma

ENTRYPOINT [ "./start.sh" ]
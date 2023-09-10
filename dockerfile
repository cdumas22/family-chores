# base node image
FROM node:16-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /app

ADD package.json .npmrc ./
RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps

WORKDIR .

COPY --from=deps ./node_modules ./node_modules
ADD package.json .npmrc ./
RUN npm prune --omit=dev

# Build the app
FROM base as build

WORKDIR .

COPY --from=deps ./node_modules ./node_modules

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

WORKDIR .

COPY --from=production-deps ./node_modules ./node_modules
COPY --from=build ./node_modules/.prisma ./node_modules/.prisma

COPY --from=build ./build ./build
COPY --from=build ./public ./public
COPY --from=build ./package.json ./package.json
COPY --from=build ./start.sh ./start.sh
COPY --from=build ./prisma ./prisma

ENTRYPOINT [ "./start.sh" ]
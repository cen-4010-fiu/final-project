# NOTE: Update when we deploy (or if we even have to), this only comes into play
# with the "containerized" compose profile 

FROM oven/bun:1.3-slim AS base
WORKDIR /usr/src/swe-app

# Install dependencies
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Prerelease
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Runtime
FROM base AS release
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=prerelease /usr/src/swe-app .

USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "--hot", "run", "src/index.ts" ]

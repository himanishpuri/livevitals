# syntax=docker/dockerfile:1

ARG NODE_VERSION=26-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_REALTIME_URL=http://localhost:9000
ENV NEXT_PUBLIC_REALTIME_URL=$NEXT_PUBLIC_REALTIME_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
LABEL org.opencontainers.image.title="livevitals" \
      org.opencontainers.image.description="LiveVitals health and fitness web app" \
      org.opencontainers.image.source="https://github.com/himanishpuri/livevitals"
# Next.js writes to .next/cache at runtime (image optimization); the node user must own it.
RUN mkdir .next && chown node:node .next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
CMD ["node", "server.js"]

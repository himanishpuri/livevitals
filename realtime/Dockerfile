# syntax=docker/dockerfile:1

FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev
COPY src ./src
USER node
EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:9000/health >/dev/null || exit 1
CMD ["node", "src/index.ts"]

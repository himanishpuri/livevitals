# syntax=docker/dockerfile:1

FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production
LABEL org.opencontainers.image.title="livevitals-realtime" \
      org.opencontainers.image.description="LiveVitals realtime service (Socket.IO + PeerJS)" \
      org.opencontainers.image.source="https://github.com/himanishpuri/livevitals" \
      org.opencontainers.image.licenses="MIT"
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev
COPY src ./src
USER node
EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://127.0.0.1:9000/health >/dev/null || exit 1
CMD ["node", "src/index.ts"]

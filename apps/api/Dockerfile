FROM node:22-slim AS build
WORKDIR /repo
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile --filter @freitty/api...
RUN pnpm --filter @freitty/db build && pnpm --filter @freitty/api build
RUN pnpm deploy --filter @freitty/api --prod --legacy /app

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]

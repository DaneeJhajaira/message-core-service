FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

CMD ["sh", "-c", "node node_modules/typeorm/cli.js migration:run -d dist/infrastructure/persistence/postgres/typeorm.datasource.js && node dist/main"]

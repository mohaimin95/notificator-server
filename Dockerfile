# Stage 1: Build stage
FROM node:alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
COPY . .
RUN npm run build && rm -rf node_modules

# Stage 2: Production stage
FROM node:alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3030
CMD [ "npm", "start" ]

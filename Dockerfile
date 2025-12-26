# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY app/package.json ./
RUN npm install --omit=dev
COPY app/server.js ./

# Runtime stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 3000
USER node
CMD ["node", "server.js"]

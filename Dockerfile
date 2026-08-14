FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_DIRECTUS_URL
ARG VITE_GEMINI_API_KEY
ENV VITE_DIRECTUS_URL=$VITE_DIRECTUS_URL
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
EXPOSE ${PORT:-3000}
CMD ["npm", "start"]

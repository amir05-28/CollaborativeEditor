# build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY ./Frontend/package*.json ./
RUN npm install
COPY ./Frontend ./
RUN npm run build

# build the backend
FROM node:20-alpine
WORKDIR /app
COPY ./Backend/package*.json ./
RUN npm install --omit=dev
COPY ./Backend ./
COPY --from=frontend-builder /app/dist ./public

ENV NODE_ENV=production
CMD ["node", "server.js"]
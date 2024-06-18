# First image to compile typescript to javascript
FROM node:16.20.2-alpine AS build-image
WORKDIR /app
COPY . .
RUN npm ci && npm run build && npm run test

# Second image, that creates an image for production
FROM node:16.20.2-alpine AS prod-image
WORKDIR /app
COPY --from=build-image ./app/dist ./dist
COPY package* ./
ENV NODE_ENV=production
CMD [ "npm", "run", "start" ]
# First image to compile typescript to javascript
FROM node:20-alpine3.18 AS build-image
WORKDIR /app
COPY . .
RUN npm ci && npm run build && npm run test

# Second image, that creates an image for production
# Check for alpine version, prob check arranger-next for inspiration
FROM node:20-alpine3.18 AS prod-image
WORKDIR /app
COPY --from=build-image ./app/dist ./dist
COPY package* ./
# What is this
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3 && npm ci --omit=dev
ENV NODE_ENV=production
CMD [ "npm", "run", "start" ]
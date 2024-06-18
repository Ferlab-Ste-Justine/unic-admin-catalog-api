# First image to compile typescript to javascript
FROM node:20-alpine3.18 AS build-image
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Second image, that creates an image for production
FROM node:20-alpine3.18 AS prod-image
WORKDIR /app
COPY --from=build-image /app/dist ./dist
COPY --from=build-image /app/package*.json ./
RUN npm install
ENV NODE_ENV=production
CMD [ "npm", "run", "start" ]
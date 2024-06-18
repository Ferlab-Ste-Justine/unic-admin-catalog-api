# First image to compile typescript to javascript
FROM node:20-alpine3.18 AS build-image
WORKDIR /app
COPY . .
RUN npm ci && npm run build && npm run test

# Second image, that creates an image for production
FROM node:20-alpine3.18 AS prod-image
WORKDIR /app
COPY --from=build-image ./app/dist ./dist
COPY package* ./
ENV NODE_ENV=production
CMD [ "npm", "run", "start" ]

# First image to compile typescript to javascript
FROM node:18.19.1-alpine AS build-image
WORKDIR /code
COPY . .
RUN npm install
RUN npm run build

# Second image, that creates an image for production
FROM node:18.19.1-alpine AS prod-image
WORKDIR /code
COPY --from=build-image ./code/dist ./dist
COPY package* ./
COPY ./admin ./admin
RUN npm install --production

CMD [ "npm", "run", "start" ]
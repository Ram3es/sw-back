
FROM node:18-alpine as build
WORKDIR /app
COPY . ./
RUN npm i --location=global @nestjs/cli
RUN npm install --omit=dev
RUN npm run build

FROM node:18-alpine as production
WORKDIR /app
COPY package.json ./
COPY database.json ./
COPY migrations ./migrations
RUN npm install --omit=dev
COPY --from=build /app/dist/ ./dist/
EXPOSE 7000
CMD [ "node", "dist/main.js" ]

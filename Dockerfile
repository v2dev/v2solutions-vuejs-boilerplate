# build stage
FROM node:18-alpine  As build
# install simple http server for serving static content
RUN npm install -g http-server
# make the 'app' folder the current working directory
WORKDIR /app

# install and cache app dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g @vue/cli

COPY . .
RUN npm run build

#Final stage
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app /app

EXPOSE 8080
# start app
CMD ["npm", "run", "serve"]

# build stage
FROM node:lts-alpine
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
EXPOSE 8080
# start app
CMD ["npm", "run", "serve"]

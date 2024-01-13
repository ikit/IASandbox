# Stage I - Build dependencies
FROM node:20.10.0 as build
WORKDIR /app
COPY  . .
RUN npm install 
RUN npm run build

# Stage II - Serve
FROM node:20.10.0 as prod
RUN mkdir -p /app && chown -R node:node /app
WORKDIR /app
USER node

COPY --chown=node:node --from=build  ./app/dist ./dist
COPY --chown=node:node package*.json ./

RUN node --version
RUN npm install --production

EXPOSE 5010

CMD npm run start

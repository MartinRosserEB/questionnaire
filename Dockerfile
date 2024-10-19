ARG DATABASE_URL

FROM node:lts-alpine

WORKDIR /usr/src/app

ARG DATABASE_URL
ENV DATABASE_URL $DATABASE_URL

COPY ["package.json", "package-lock.json", "./"]
COPY ["prisma", "./prisma"]

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["node", "./build"]

FROM node:lts-alpine AS build

WORKDIR /app

RUN npm install -g pnpm@11.1.3

COPY package*.json ./
COPY pnpm*.yaml ./

RUN pnpm install --frozen-lockfile

COPY . ./

RUN pnpm run build

FROM node:lts-alpine

WORKDIR /app

RUN npm install -g pnpm@11.1.3

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/pnpm*.json ./

EXPOSE 3005
CMD ["npm", "run", "start"]

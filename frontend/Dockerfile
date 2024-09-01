FROM node:22-alpine3.19 as base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --target=dev
FROM base as dev
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base as build
RUN npm run build

# --target=prod
FROM nginx:1.27.1 as prod 
COPY --from=build /app/dist /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

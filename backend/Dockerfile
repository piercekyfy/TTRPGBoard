FROM node:18 as base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM base as dev
RUN echo "ran dev"
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM base as build
RUN npm run build

FROM build as prod
EXPOSE 5000
RUN echo "test"
CMD ["npm", "start"]
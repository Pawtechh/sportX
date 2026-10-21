FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build

EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

CMD ["npm", "start"]

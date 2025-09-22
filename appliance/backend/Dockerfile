FROM node:18
WORKDIR /app
COPY package.json ./
RUN npm install --build-from-source=bcrypt
COPY . .
EXPOSE 4000
CMD ["node","index.js"]

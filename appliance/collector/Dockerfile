FROM node:18
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 8081 514/udp
CMD ["node","index.js"]

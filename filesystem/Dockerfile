FROM node

#app configuration
WORKDIR /app

#copy in the application files
COPY . .

#install dependencies
RUN npm i

#system startup
EXPOSE 8100
CMD ["node", "app.js"]
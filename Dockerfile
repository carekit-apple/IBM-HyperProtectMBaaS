FROM node:10

# Create app directory
WORKDIR /usr/app/carekit-hyperprotect/

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
COPY certs/ /usr/app/carekit-hyperprotect/

EXPOSE 3000
EXPOSE 27017

CMD [ "npm", "start" ]

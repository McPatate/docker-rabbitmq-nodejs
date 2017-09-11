FROM node:boron

WORKDIR /usr/src/app

COPY package.json .

# For npm@5 or later, copy package-lock.json as well
# COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 4242
CMD [ "npm", "start" ]

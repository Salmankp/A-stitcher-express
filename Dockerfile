FROM node:16-alpine
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
WORKDIR /usr/src/app
COPY ./app ./
RUN yarn install
CMD ["npm", "run", "start"]
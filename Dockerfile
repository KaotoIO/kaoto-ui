FROM node:16

# set the working direction
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY . ./

RUN yarn install

RUN echo "REACT_APP_API_URL=http://localhost:80" > .env

EXPOSE 80

HEALTHCHECK --interval=3s --start-period=10s CMD curl --fail http://localhost:80/ || exit 1

# start app
CMD ["yarn", "prod"]


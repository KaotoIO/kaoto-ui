FROM node:16 as appbuild

WORKDIR /app

COPY .yarn/ .yarn/
COPY .yarnrc.yml .
COPY yarn.lock .
COPY package.json .

RUN yarn install --mode=skip-build

COPY . .

RUN echo "KAOTO_API=http://localhost:8081" > ./.env

HEALTHCHECK --interval=3s --start-period=10s CMD curl --fail http://localhost:8080/ || exit 1

RUN yarn run build

FROM nginx:latest
COPY --from=appbuild /app/dist/* /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

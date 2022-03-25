FROM node:16 as appbuild

WORKDIR /app

COPY .yarn/ .yarn/
COPY .yarnrc.yml .
COPY yarn.lock .
COPY package.json .

RUN yarn install --mode=skip-build

COPY . .

RUN yarn run build

FROM nginx:latest

COPY --from=appbuild /app/dist/* /usr/share/nginx/html/
COPY nginx/start_nginx.sh .

EXPOSE 80

HEALTHCHECK --interval=3s --start-period=10s CMD curl --fail http://localhost/ || exit 1

CMD ["./start_nginx.sh"]

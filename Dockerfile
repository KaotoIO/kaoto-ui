FROM node:16-alpine3.17 AS appbuild
ARG KAOTO_API_URL="/api"
WORKDIR /app

# Copy yarn configuration files
COPY .yarn/plugins ./.yarn/plugins
COPY .yarn/releases ./.yarn/releases
COPY .yarnrc.yml .

# Main entrypoint
COPY public ./public/

# Source code
COPY src ./src/

# Webpack and Typescript config files
COPY package.json yarn.lock webpack.* tsconfig.* ./

# Install dependencies
RUN yarn install --mode=skip-build --immutable

# Build Kaoto UI
RUN KAOTO_API=${KAOTO_API_URL} yarn run build

FROM nginxinc/nginx-unprivileged

COPY --from=appbuild /app/dist/* /usr/share/nginx/html/
COPY nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080

HEALTHCHECK --interval=3s --start-period=10s CMD curl --fail http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

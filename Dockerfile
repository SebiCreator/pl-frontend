FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npx", "serve", "-s", "dist", "-l", "8080"]


# Schritt 2: Richte den Webserver ein
# Verwende ein offizielles nginx-Basis-Image.
#FROM nginx:stable-alpine as production-stage

# Kopiere die gebauten Dateien vom build-stage in das Verzeichnis des Webservers.
#COPY --from=build-stage /app/dist /usr/share/nginx/html

# Leite Anfragen an den Single-Page-Application-Index um (für Browser-Routing).
#RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

# Exponiere Port 80 für den Zugriff auf den Container.
#EXPOSE 80

# Starte nginx im Vordergrund, um den Container am Laufen zu halten.
#CMD ["nginx", "-g", "daemon off;"]

FROM nginx:1.27-alpine
COPY frontend/index.html /usr/share/nginx/html/index.html
COPY frontend/app.js /usr/share/nginx/html/app.js
COPY frontend/styles.css /usr/share/nginx/html/styles.css
COPY frontend/mpce-logo.svg /usr/share/nginx/html/mpce-logo.svg
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80


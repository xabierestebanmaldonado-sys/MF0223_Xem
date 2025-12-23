FROM node:14-alpine AS builder
WORKDIR /app
COPY . .

FROM nginx:alpine

COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/css /usr/share/nginx/html/css
COPY --from=builder /app/js /usr/share/nginx/html/js
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
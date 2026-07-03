# Используем сверхлегкий официальный образ Nginx (весит всего ~10-15мб)
FROM nginx:alpine

# Копируем все файлы проекта в стандартную директорию Nginx для статики
COPY . /usr/share/nginx/html

# Nginx по умолчанию слушает порт 80
EXPOSE 80

# Запускаем Nginx в foreground-режиме
CMD ["nginx", "-g", "daemon off;"]

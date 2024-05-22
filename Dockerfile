FROM node:20.10.0-alpine3.19

RUN apk --no-cache add libaio libnsl libc6-compat curl && \
     cd /tmp && \
     curl -o instantclient-basiclite.zip https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linuxx64.zip -SL && \
     unzip instantclient-basiclite.zip && \
     mv instantclient*/ /usr/lib/instantclient && \
     rm instantclient-basiclite.zip && \
     ln -s /usr/lib/instantclient/libclntsh.so.21.1 /usr/lib/libclntsh.so && \
     ln -s /usr/lib/instantclient/libocci.so.21.1 /usr/lib/libocci.so && \
     ln -s /usr/lib/instantclient/libociicus.so /usr/lib/libociicus.so && \
     ln -s /usr/lib/instantclient/libnnz21.so /usr/lib/libnnz21.so && \
     ln -s /usr/lib/libnsl.so.2 /usr/lib/libnsl.so.1 && \
     ln -s /lib/libc.so.6 /usr/lib/libresolv.so.2 && \
     ln -s /lib64/ld-linux-x86-64.so.2 /usr/lib/ld-linux-x86-64.so.2

ENV LD_LIBRARY_PATH /usr/lib/instantclient

RUN mkdir /home/node/web 
WORKDIR /home/node/web
COPY web/package*.json ./
RUN npm install && npm cache clean --force --loglevel=error
COPY web ./

RUN mkdir /home/node/app 
RUN mkdir /home/node/app/db
WORKDIR /home/node/app
COPY api/package*.json ./
COPY api/.env* ./

ENV NODE_ENV=test
RUN npm install && npm cache clean --force --loglevel=error
COPY api ./

RUN npm run build
EXPOSE 3000

WORKDIR /home/node/web
ENV NODE_ENV=production
RUN npm run build

WORKDIR /home/node/app

COPY --chown=node:node api/src/web/*.png /home/node/app/dist/web/

CMD ["node", "./dist/index.js"]

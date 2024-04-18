# ทำการเลือก base image (จาก docker hub) มาเป็นตัว runtime เริ่มต้น เพื่อให้สามารถ run project ได้
# ในทีนี้เราทำการเลือก node image version 18 ออกมา
FROM node:18

# กำหนด directory เริ่มต้นใน container (ตอน run ขึ้นมา)
WORKDIR /usr/src/app

# ทำการ copy file package.json จากเครื่อง local เข้ามาใน container
COPY ./package.json ./

# ทำการลง dependency node
RUN npm install express mongodb body-parser nodemon cors dotenv bcrypt bcryptjs cookie-session ejs jsonwebtoken --save

# copy file index.js เข้ามาใน container
COPY ./app.js ./
COPY ./dashboard.js ./
COPY ./setting.js ./
COPY ./.env ./

# ทำการปล่อย port 8000 ออกมาให้ access ได้
EXPOSE 8000
EXPOSE 8100
EXPOSE 8200

# กำหนด command สำหรับเริ่มต้น run application (ตอน run container)
CMD ["node app.js", "node dashboard.js", "node setting.js"]

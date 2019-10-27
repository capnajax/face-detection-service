FROM justadudewhohacks/opencv-nodejs

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY index.js ./

EXPOSE 1031

ENV DEBUG=face
CMD [ "node", "index.js" ]


# docker build -t thomas/face-detection-service . ; docker run -p 1031:1031 thomas/face-detection-service & sleep 2 ; echo trying ; curl -X PUT http://localhost:1031 -H 'Content-Type: image/jpeg' --upload-file test/testimg.jpg-H 'Content-Type: image/jpeg' 
# docker kill $(docker ps | grep face-detection-service | awk '{print $1}') ; docker rm $(docker ps -a | grep face-detection-service | awk '{print $1}') ; docker rmi $(docker images | grep face-detection-service | awk '{print $3}')

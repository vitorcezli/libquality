FROM node:14-alpine

# Install dependencies.
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

# Copy execution files.
COPY config config
COPY data data
COPY routers routers
COPY services services
COPY main.js .

# Run NodeJS when container starts.
CMD npm start

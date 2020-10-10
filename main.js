const {
    mongo: {
        url: MONGO_URL,
        user: MONGO_USER,
        password: MONGO_PASSWORD,
    },
    port: PORT,
} = require('./config');

const mongoose = require('mongoose');
mongoose.connect(MONGO_URL, {
    user: MONGO_USER,
    pass: MONGO_PASSWORD,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

const app = require('express')();
const morgan = require('morgan');
const v1 = require('./routers/v1');
app.use(morgan('dev'));
app.use('/v1', v1);

const http = require('http');
const server = http.createServer(app);
server.listen(PORT);

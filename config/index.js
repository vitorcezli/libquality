const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    github: {
        token: process.env.GITHUB_TOKEN,
    },
    mongo: {
        url: process.env.MONGO_URL,
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASSWORD,
    },
    port: process.env.PORT | 8000,
};

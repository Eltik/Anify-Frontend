const express = require('express');
const axios = require("axios");

const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { join } = require("path");

const colors = require("colors");

const CryptoJS = require("crypto-js");
const config = require("./config.json");
const port = config.port;

const app = express();

app.use(require('express-domain-middleware'));

const corsOptions = {
    origin: '*',
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use('/scripts', express.static(join(__dirname, "./scripts")), (req, res) => {
    res.status(404).json("Not found").end();
});
app.use('/styles', express.static(join(__dirname, "./styles")), (req, res) => {
    res.status(404).json("Not found").end();
});
app.use('/images', express.static(join(__dirname, "./images")), (req, res) => {
    res.status(404).json("Not found").end();
});

app.use("/*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
})

// Routing
app.get("/", (req, res) => {
    res.sendFile("./index.html", { root: __dirname });
})

app.get("/anime*", (req, res) => {
    res.sendFile("./anime.html", { root: __dirname });
})

app.get("/manga*", (req, res) => {
    res.sendFile("./manga.html", { root: __dirname });
})

app.get("/novels*", (req, res) => {
    res.sendFile("./novels.html", { root: __dirname });
})

app.get("/info*", (req, res) => {
    res.sendFile("./info.html", { root: __dirname });
})

app.get("/watch*", (req, res) => {
    res.sendFile("./watch.html", { root: __dirname });
})

app.get("/read*", (req, res) => {
    res.sendFile("./read.html", { root: __dirname });
})

app.get("/discord*", (req, res) => {
    res.redirect("https://discord.gg/zBCvFken5W");
})

app.get("/admin*", (req, res) => {
    res.sendFile("./admin.html", { root: __dirname });
})

app.get("/dmca*", (req, res) => {
    res.sendFile("./dmca.txt", { root: __dirname });
})

app.get("/tos*", (req, res) => {
    res.sendFile("./tos.txt", { root: __dirname });
})

app.get("/subtitles", async(req, res) => {
    const url = req.query.url;
    if (!url) {
        res.status(400).json("Bad request").end();
    }
    
    const { data } = await axios.get(url);
    //res.header("Content-Type", "text/vtt");
    res.send(data).end();
});

app.get("/*", (req, res) => {
    res.send("404.").end();
})

app.listen(port, () => {
    console.log('Frontend server started '.green + "on port ".gray + port + "".white + '.'.gray);
});
const express = require('express');
const ejs = require("ejs");
const axios = require("axios");
const dotenv = require("dotenv");

const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const { join } = require("path");
const cheerio = require("cheerio");

const colors = require("colors");
dotenv.config();
const port = process.env.PORT || 3000;
const api = process.env.API || "https://api.anify.tv";

const app = express();

app.use(require('express-domain-middleware'));

const corsOptions = {
    origin: '*',
    methods: ['POST', 'GET', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.set("view engine", "ejs");

//app.use(compression);
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

app.use("/*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
})
app.use("/*", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    next();
})

app.use('/scripts', express.static(join(__dirname, "./scripts")), (req, res) => {
    res.status(404).json("Not found").end();
});
app.use('/styles', express.static(join(__dirname, "./styles")), (req, res) => {
    res.status(404).json("Not found").end();
});
app.use("/images*", async(req, res) => {
    res.redirect(`https://raw.githubusercontent.com/Eltik/Anify-Frontend/main${req.baseUrl}`);
});

// Routing
app.get("/", (req, res) => {
    res.sendFile("./index.html", { root: __dirname });
})

app.get("/api*", (req, res) => {
    res.json({ api: api }).status(200).end();
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

app.get("/info/:id", async(req, res) => {
    const id = req.params["id"];
    const { data } = await axios.post(api + "/info", { id: id }).catch((err) => {
        console.log("Error. Not found " + id);
        res.status(404).send("Not found").end();
        return {
            data: null
        }
    });
    if (!data) {
        return;
    }

    const info = data;
    const title = info.title.english || info.title.romaji || info.title.native;
    const description = info.description.replace(/<br>/g, "");
    const cover = info.coverImage.large;

    //const relations = await axios.post(config.api + "/relations", { id: id });
    const relations = {
        data: []
    };

    let relationsData = "";
    for (let i = 0; i < relations.data.length; i++) {
        relationsData += `
        <div class="relation">
            <a href="/info/${relations.data[i].data.data.id}" class="relation_wrapper">
                ${relations.data[i].type === "MANGA" ? `
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="transition-all decoration-neutral-150 ease-linear"><path d="M22 16.74V4.67c0-1.2-.98-2.09-2.17-1.99h-.06c-2.1.18-5.29 1.25-7.07 2.37l-.17.11c-.29.18-.77.18-1.06 0l-.25-.15C9.44 3.9 6.26 2.84 4.16 2.67 2.97 2.57 2 3.47 2 4.66v12.08c0 .96.78 1.86 1.74 1.98l.29.04c2.17.29 5.52 1.39 7.44 2.44l.04.02c.27.15.7.15.96 0 1.92-1.06 5.28-2.17 7.46-2.46l.33-.04c.96-.12 1.74-1.02 1.74-1.98ZM12 5.49v15M7.75 8.49H5.5M8.5 11.49h-3" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>` : 
                relations.data[i].type === "ANIME" ? `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="transition-all decoration-neutral-150 ease-linear"><path d="M11.97 22c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10Z" stroke="inherit" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.74 12.23v-1.67c0-2.08 1.47-2.93 3.27-1.89l1.45.84 1.45.84c1.8 1.04 1.8 2.74 0 3.78l-1.45.84-1.45.84c-1.8 1.04-3.27.19-3.27-1.89v-1.69Z" stroke="inherit" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path></svg>` :
                ""}
                <span class="relation_text">${relations.data[i].type === "MANGA" ? "Read" : relations.data[i].type === "ANIME" ? "Watch" : "See" } the ${relations.data[i].type.toLowerCase()}</span>
            </a>
        </div>
        `;
    }

    let bannerImage = info.bannerImage;
    let coverImage = info.coverImage.extraLarge;
    const request = await axios.post(api + "/tmdb", { id: id }).catch((err) => {
        return null;
    });
    const $ = cheerio.load(description);
    const parsed = $("<div>" + description + "</div>").text();

    let header = `
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${parsed}" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://anify.tv/info/${id}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${parsed}" />
    <meta property="og:image" content="${cover}" />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://anify.tv/info/${id}" />
    <meta property="twitter:title" content="${title}"/>
    <meta property="twitter:description" content="${parsed}" />
    <meta property="twitter:image" content="${coverImage}" />
    `;
    if (!request) {
        res.render("info", {
            header: header,
            info: info,
            stringifiedInfo: JSON.stringify(info),
            relations: relationsData
        })
        return;
    }
    const json = request.data;
    bannerImage = json.backdrop_path ? json.backdrop_path : bannerImage;

    info.bannerImage = bannerImage;

    header = `
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${parsed}" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://anify.tv/info/${id}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${parsed}" />
    <meta property="og:image" content="${cover}" />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://anify.tv/info/${id}" />
    <meta property="twitter:title" content="${title}"/>
    <meta property="twitter:description" content="${parsed}" />
    <meta property="twitter:image" content="${coverImage}" />
    `;

    res.render("info", {
        header: header,
        info: info,
        relations: relationsData,
        stringifiedInfo: JSON.stringify(data),
    })
})

app.get("/novel/:id", async(req, res) => {
    const id = req.params["id"];
    const { data } = await axios.post(api + "/novel", { id: id }).catch((err) => {
        console.log("Error. Not found ID " + id);
        res.status(404).send("Not found").end();
        return {
            data: null
        }
    });
    if (!data) {
        return;
    }

    const info = data;
    const title = info.title.english || info.title.romaji || info.title.native;
    const description = info.description.replace(/<br>/g, "");
    const cover = info.coverImage.alt ?? info.coverImage.extraLarge ?? info.coverImage.large ?? info.coverImage.medium ?? info.coverImage.small;

    const coverImage = info.coverImage.extraLarge;
    const $ = cheerio.load(description);
    const parsed = $("<div>" + description + "</div>").text();

    const header = `
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${parsed}" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://anify.tv/info/${id}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${parsed}" />
    <meta property="og:image" content="${cover}" />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://anify.tv/info/${id}" />
    <meta property="twitter:title" content="${title}"/>
    <meta property="twitter:description" content="${parsed}" />
    <meta property="twitter:image" content="${coverImage}" />
    `;

    const connectors = data.connectors.map((connector, index) => {
        return `
        <a href="${api + connector.id}" target="_blank">
            <div class="chapter" id="chapter-${index}">${connector.title}</div>
        </a>
        `
    })
    res.render("novel", {
        header: header,
        info: info,
        connectors: connectors
    })
    return;
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

app.get("/profile*", (req, res) => {
    res.sendFile("./profile.html", { root: __dirname });
})

app.get("/admin*", (req, res) => {
    res.sendFile("./admin.html", { root: __dirname });
})

app.get("/dmca*", (req, res) => {
    res.sendFile("./dmca.html", { root: __dirname });
})

app.get("/contact*", (req, res) => {
    res.sendFile("./contact.html", { root: __dirname });
})

app.get("/tos*", (req, res) => {
    res.sendFile("./tos.txt", { root: __dirname });
})

app.get("/subtitles", async(req, res) => {
    const url = req.query.url;
    if (!url) {
        res.status(400).json("Bad request").end();
    }
    
    const { data } = await axios.get("https://cors.consumet.stream/" + url).catch((err) => {
        return {
            data: ""
        }
    });
    res.header("Content-Type", "text/vtt");
    res.send(data).end();
});

app.get("/login", (req, res) => {
    if (req.cookies.token) {
        res.redirect("/");
    } else {
        res.redirect(api + "/login");
    }
})

app.get("/auth", (req, res) => {
    const token = req.query.token;
    if (!token) {
        res.status(400).json({ error: "No token provided." }).end();
    }
    res.cookie("token", token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
    res.redirect("/");
})

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
})

app.get("/token", (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(400).json({ error: "No token found." }).end();
        return;
    }
    res.send({ token: token }).end();
})

app.get("/*", (req, res) => {
    res.send("404.").end();
})

app.listen(port, () => {
    console.log(colors.gray("Backend: ") + colors.white(api));
    console.log('Frontend server started '.green + "on port ".gray + port + "".white + '.'.gray);
});
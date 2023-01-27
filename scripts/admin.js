let path = "";

function insertPanel() {
    const pwd = document.getElementById("password");

    fetch(api_server + "/admin/manga/html/home", { method: "POST", body: JSON.stringify({ password: pwd["value"] }), headers: { "Content-Type": "application/json" }}).then(async res => {
        const value = await res.json();
        if (res.status === 403) {
            alert(value.error);
        } else {
            path = value.path;

            document.getElementsByClassName("header")[0].querySelector("h1").textContent = "Insert Panel";
            
            const toAppend = `
            <br />
            <div class="fields">
                <button type="button" class="button" onclick="fetchAniList()">Fetch AniList Data</button>
                <input class="input" type="text" id="aniList" placeholder="https://anilist.co/manga/85486/My-Hero-Academia/" />
                <input class="input" type="text" id="title" placeholder="Title..." />
                <textarea class="textarea" id="description" placeholder="Description..." rows="4" cols="100"></textarea>
                <input class="input" type="text" id="tags" placeholder="Romance,Comedy,Slice of Life" />
                <input class="input" type="text" id="path" placeholder="https://mangadex.org/title/4f3bcae4-2d96-4c9d-932c-90181d9c873e/boku-no-hero-academia" />
                <div class="cover_wrapper">
                    <input class="input" type="text" id="cover" placeholder="https://meo.comick.pictures/QZNq0.jpg?width=1920" onchange="updateImage()" onkeypress="this.onchange();" onpaste="this.onchange();" oninput="this.onchange();" />
                    <img src="https://meo.comick.pictures/QZNq0.jpg?width=1920" id="img_cover" />
                </div>
                <button type="button" class="button" onclick="insertManga()" id="insert" disabled>Insert Manga</button>
            </div>
            `;

            document.getElementsByClassName("content")[0].innerHTML = toAppend;
        }
    }).catch((err) => {
        handleError(err);
        alert(err);
    });
}

function updateImage() {
    const data = document.getElementById("cover")["value"];
    if (!data || data.length === 0) {
        document.getElementById("img_cover").src = "https://meo.comick.pictures/QZNq0.jpg?width=1920";
    } else {
        document.getElementById("img_cover").src = data;
    }
}

function fetchAniList() {
    const url = document.getElementById("aniList")["value"];
    if (!url || url.length === 0) {
        alert("You must provide a AniList URL!");
        return;
    }
    
    const aniId = parseAniListId(url);
    if (!aniId) {
        alert("You must provide a valid AniList URL! Ex. https://anilist.co/manga/85486/My-Hero-Academia/");
        return;
    }
    const query = `
    query ($id: Int) {
        Media (id: $id) {
            id
            description(asHtml: false)
            title {
                english
                romaji
            }
            coverImage {
                extraLarge
                large
                medium
                color
            }
            genres
            siteUrl
        }
    }
    `;
    const variables = {
        id: aniId
    };

    const json = JSON.stringify({ query: query, variables: variables });
    fetch("https://graphql.anilist.co/", { method: "POST", body: json, headers: { "Content-Type": "application/json" }}).then(async(res) => {
        const data = await res.json();
        if (!data || !data.data.Media) {
            alert("You must provide a valid AniList URL! Ex. https://anilist.co/manga/85486/My-Hero-Academia/")
            return;
        }
        const aniList = data.data.Media;
        let genres = "";
        aniList ? (aniList.genres ? aniList.genres.map((element, index) => {
            genres.length === 0 ? genres = element : genres += "," + element;
        }) : "") : "";

        document.getElementById("title")["value"] = aniList ? (aniList.title && aniList.title.english ? aniList.title.english : aniList.title.romaji) : "";
        document.getElementById("description")["value"] = aniList ? aniList.description : "";
        document.getElementById("tags")["value"] = genres;

        document.getElementById("insert")["disabled"] = false;
    }).catch((err) => {
        console.error(err);
    });
}

function insertManga() {
    const title = document.getElementById("title")["value"];
    const description = document.getElementById("description")["value"];
    const cover = document.getElementById("cover")["value"];
    const tags = document.getElementById("tags")["value"];
    const manga = document.getElementById("path")["value"];
    const aniList = document.getElementById("aniList")["value"];
    const pass = document.getElementById("password")["value"];

    if (title.length === 0 || description.length === 0 || cover.length === 0 || tags.length === 0 || manga.length === 0 || aniList.length === 0) {
        alert("You must fill out all the information!");
        return;
    }

    if (!pass) {
        alert("Error fetching the password. Please refresh and try again.");
        return;
    }

    if (!path || path.length === 0) {
        alert("Error fetching the path. Please refresh and try again.");
        return;
    }

    fetch(path, { method: "POST", body: JSON.stringify({ title: title, description: description, path: manga, cover: cover, tags: tags, password: pass, anilist: aniList }), headers: { "Content-Type": "application/json" }}).then(async res => {
        const value = await res.text();
        if (res.status === 403 || res.status === 400) {
            alert(value);
        } else {
            alert(JSON.parse(value)["success"]);
            document.getElementById("title")["value"] = "";
            document.getElementById("description")["value"] = "";
            document.getElementById("cover")["value"] = "";
            document.getElementById("tags")["value"] = "";
            document.getElementById("path")["value"] = "";
            document.getElementById("aniList")["value"] = "";
        }
    }).catch((err) => {
        alert(err.message);
    });
}
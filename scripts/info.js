let providerIndex = 0;
let maxProviders = 0;

function load(id) {
    const args = {
        id: id
    };

    fetch(api_server + "/info", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }}).then(async(res) => {
        let data = await res.json();
        if (data.error) {
            handleError(data);
            alert(data.error);
            return;
        }

        const info = data.anilist;
        const connectors = data.connectors;

        const id = info.id;
        const englishTitle = info.title.english;
        const nativeTitle = info.title.native;
        const romajiTitle = info.title.romaji;

        const averageScore = info.averageScore;
        const favorites = info.favourites;
        const licensed = info.isLicensed;
        const status = info.status;
        const episodes = info.episodes;
        const chapters = info.chapters;
        const volumes = info.volumes;
        const format = info.format;
        const source = info.source;
        const season = info.season;
        const seasonYear = info.seasonYear;
        const countryOfOrigin = info.countryOfOrigin;
        const isAdult = info.isAdult;
        const startDate = info.startDate;
        const endDate = info.endDate;

        const rawDesc = info.description.length > 500 ? info.description.substring(0, 500) + "..." : info.description;
        const cover = info.coverImage.extraLarge;

        const parser = new DOMParser();
        const description = parser.parseFromString(rawDesc,"text/html").body.textContent;
    
        document.querySelector(".mangatitle").textContent = englishTitle;
        document.querySelector(".cover").src = cover;
        document.querySelector(".mangadescription").querySelector("span").textContent = description;
    
        let bannerImage = info.bannerImage;
        let tmdbId = null;
        for (let i = 0; i < connectors.length; i++) {
            const connector = connectors[i];
            if (connector.provider === "TMDB") {
                tmdbId = connector.data.id;
            }
        }
        if (tmdbId != null) {
            const req = await fetch(api_server + "/tmdb", { method: "POST", body: JSON.stringify({ id: tmdbId }), headers: { "Content-Type": "application/json" }});
            const json = await req.json();
            bannerImage = json.backdrop_path ? json.backdrop_path : bannerImage;
        }

        if (!bannerImage) {
            bannerImage = info.coverImage.extraLarge;
        }

        const genres = info.genres;
        document.querySelector(".bannerimage").style = `background-image: url("${bannerImage}");`;
        
        const genresList = document.querySelector(".genres");
        for (let i = 0; i < genres.length; i++) {
            const genreDOM = document.createElement("span");
            genreDOM.className = "genre";
            genreDOM.textContent = genres[i];
            
            genresList.append(genreDOM);
        }

        document.querySelector(".mangatitle").textContent = romajiTitle;
        document.querySelector(".native").textContent = nativeTitle;
        document.querySelector(".english").textContent = englishTitle;

        let content = null;
        if (info.type === "ANIME") {
            const req = await fetch(api_server + "/episodes", { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" }});
            const json = await req.json();
            content = json;
            document.querySelector(".chaptersheader span").textContent = "Episodes";
        } else if (info.type === "MANGA") {
            const req = await fetch(api_server + "/chapters", { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" }});
            const json = await req.json();
            content = json;
            document.querySelector(".chaptersheader span").textContent = "Chapters";
        }

        if (content != null) {
            const chaptersList = document.querySelector(".chapterslist");
            if (content.length > 0) {
                const button = document.createElement("button")
                button.type = "button";
                button.className = "button";
                button.id = "switchProvider";
                button.onclick = () => {
                    const providerList = document.querySelectorAll(".providerlist");

                    providerList[providerIndex].classList.add("hidden");
                    if (providerIndex === maxProviders - 1) {
                        providerIndex = 0;
                    } else {
                        providerIndex++;
                    }

                    providerList[providerIndex].classList.remove("hidden");
                }
                button.textContent = "Switch Provider";
                document.querySelector(".chapters").insertBefore(button, chaptersList);
            }

            for (let i = 0; i < content.length; i++) {
                const provider = document.createElement("div");
                provider.className = "providerlist";
                const header = document.createElement("div");
                header.className = "chaptersheader";
                const headerSpan = document.createElement("span");
                headerSpan.textContent = content[i].provider + " - " + (content[i].provider_data.title ? content[i].provider_data.title : content[i].provider_data.romaji);
                header.append(headerSpan);
                provider.appendChild(header);

                if (i != 0) {
                    provider.classList.add("hidden");
                }

                const providerChapters = document.createElement("div");
                providerChapters.className = "providerchapters";

                if (content[i].episodes && content[i].episodes.length > 0) {
                    for (let j = 0; j < content[i].episodes.length; j++) {
                        const item = content[i].episodes[j];
            
                        item.title = item.title && item.title.length > 0 ? item.title : "Ep. " + j;
            
                        const chapter = document.createElement("a");
                        const readingId = `/watch/${id}/${content[i].provider}/${encrypt(item.id)}`;
                        chapter.href = readingId;
                        chapter.className = "chapter_wrapper";
                        
                        const chapterText = document.createElement("div");
                        chapterText.className = "chapter";
                        chapterText.textContent = item.title;
                        chapterText.id = "chapter-" + i;
                        chapter.appendChild(chapterText);
                        providerChapters.appendChild(chapter);
                    }
                    provider.appendChild(providerChapters);
                    chaptersList.append(provider);
                    maxProviders++;
                } else if (content[i].chapters && content[i].chapters.length > 0) {
                    for (let j = 0; j < content[i].chapters.length; j++) {
                        const item = content[i].chapters[j];
            
                        item.title = item.title && item.title.length > 0 ? item.title : "Oneshot";
                        if (item.title.includes(englishTitle + " chapter ")) {
                            item.title = item.title.split(englishTitle + " chapter ")[1];
                        }
            
                        const chapter = document.createElement("a");
                        const readingId = `/read/${id}/${content[i].provider}/${encrypt(item.id ? item.id : item.url)}`;
                        chapter.href = readingId;
                        chapter.className = "chapter_wrapper";
                        
                        const chapterText = document.createElement("div");
                        chapterText.className = "chapter";
                        chapterText.textContent = item.title;
                        chapterText.id = "chapter-" + i;
                        chapter.appendChild(chapterText);
                        providerChapters.appendChild(chapter);
                    }
                    provider.appendChild(providerChapters);
                    chaptersList.append(provider);
                    maxProviders++;
                }
            }
            if (maxProviders === 1) {
                document.getElementById("switchProvider").remove();
                document.querySelector(".providerlist .chaptersheader").remove();
            }
        }
    }).catch((err) => {
        handleError(err);
    });
}
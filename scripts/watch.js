function load(id, provider, watchId) {
    watchId = decrypt(watchId);

    const args = {
        id: id,
        provider: provider,
        watchId: watchId,
    };
    fetch(api_server + "/sources", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }}).then(async(res) => {
        let data = await res.json();

        if (data.error) {
            return;
        }

        sources = data.sources;
        subtitles = data.subtitles;
        intro = data.intro;

        if (sources.length === 0) {
            alert("There are no sources available for this connector. Please try a different provider.");
        }

        const episodeArgs = {
            id: id
        }
        fetch(api_server + "/episodes", { method: "POST", body: JSON.stringify(episodeArgs), headers: { "Content-Type": "application/json" }}).then(async(res) => {
            const data = await res.json();
            for (let i = 0; i < data.length; i++) {
                if (data[i].provider.toLowerCase() === provider.toLowerCase()) {
                    const episodes = data[i].episodes;
                    const episodeList = document.getElementsByClassName("episodelist")[0];
    
                    for (let j = 0; j < episodes.length; j++) {
                        const epLink = document.createElement("a");
                        epLink.href = `/watch/${id}/${provider}/${encrypt(episodes[j].id)}`;
            
                        const epDOM = document.createElement("div");
                        epDOM.className = "episode";
                        epDOM.textContent = episodes[j].title;
                
                        epLink.append(epDOM);
                        episodeList.append(epLink);
                    }
                }
            }
        })

        const infoArgs = {
            id: id
        }
        fetch(api_server + "/info", { method: "POST", body: JSON.stringify(infoArgs), headers: { "Content-Type": "application/json" }}).then(async(res) => {
            const data = await res.json();
            info = data;

            const show = data.anilist;

            const script = document.createElement("script");
            script.src = "../../../scripts/player.js";
            const styles = document.createElement("link");
            styles.rel = "stylesheet";
            styles.href = "../../../styles/player.css";
            document.querySelector("body").append(script);
            document.querySelector("head").append(styles);
        
            const coverImage = show.coverImage.large;
            const bannerImage = show.bannerImage;
            const genres = show.genres;
            
            const englishTitle = show.title.english;
            const nativeTitle = show.title.native;
            const romajiTitle = show.title.romaji;
            
            const rawDesc = show.description;
            const parser = new DOMParser();
            const description = parser.parseFromString(rawDesc,"text/html").body.textContent;
            
            const status = show.status;
    
            document.getElementsByClassName("coverimage")[0].src = coverImage;
            document.getElementsByClassName("bannerimage")[0].src = bannerImage;
            
            const genresList = document.getElementsByClassName("genres")[0];
            for (let i = 0; i < genres.length; i++) {
                const genreDOM = document.createElement("span");
                genreDOM.className = "genre";
                genreDOM.textContent = genres[i];
                
                genresList.append(genreDOM);
            }
    
            document.getElementsByClassName("showtitle")[0].textContent = romajiTitle;
            document.getElementsByClassName("native")[0].textContent = nativeTitle;
            document.getElementsByClassName("english")[0].textContent = englishTitle;
            document.getElementsByClassName("showdescription")[0].querySelector("span").textContent = description;
            document.getElementsByClassName("status")[0].querySelector("span.stattext").textContent = status;
        }).catch((err) => {
            handleError(err);
        })
    }).catch((err) => {
        handleError(err);
    });
}
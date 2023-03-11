function load(id, provider, watchId) {
    watchId = decrypt(watchId);

    fetch(api_server + "/episode_covers", { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" }}).then(async(data) => {
        const res = await data.json();
        episodeCovers = res;
    }).catch((err) => {
        return null;
    });

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
        sources.map((source) => {
            if (source.isM3U8 && source.url.includes("vizcloud")) {
                source.url = `https://m3u8.eltik.net/m3u8_proxy?url=${encodeURIComponent(source.url)}&headers=${encodeURIComponent(JSON.stringify({ "Referer": "https://9anime.pl" }))}`;
                console.log(source.url);
            } else {
                if (source.isM3U8) {
                    // CORS proxy
                    source.url = `https://cors.eltik.net/${source.url}`;
                }
            }
        })
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
            episodes = data;

            let episodeNumber = -1;
            for (let i = 0; i < episodes.length; i++) {
                const provider = episodes[i];
                for (let j = 0; j < provider.episodes.length; j++) {
                    const episode = provider.episodes[j];
                    if (episode?.id === watchId || episode?.url === watchId) {
                        episodeNumber = episode.number ?? i;
                        break;
                    }
                }
            }
            if (episodeNumber != -1 && intro.end === 0) {
                fetch(api_server + "/skip_times", { method: "POST", body: JSON.stringify({ id: id, episodeNumber: episodeNumber }), headers: { "Content-Type": "application/json" }}).then(async(data) => {
                    const res = await data.json();
                    if (res.statusCode === 500) {
                        console.log("Unable to fetch skip times.");
                        return;
                    }
                    for (let i = 0; i < res.length; i++) {
                        if (res[i].skipType === "op") {
                            intro.start = res[i].interval.startTime;
                            intro.end = res[i].interval.endTime;
                        }
                    }
                }).catch((err) => {
                    handleError(err);
                    console.log("Unable to fetch skip times.");
                });
            }

            const infoArgs = {
                id: id
            }
            fetch(api_server + "/info", { method: "POST", body: JSON.stringify(infoArgs), headers: { "Content-Type": "application/json" }}).then(async(res) => {
                const data = await res.json();
                info = data;
    
                const styles = document.createElement("link");
                styles.rel = "stylesheet";
                styles.href = "../../../styles/player.css";
                document.querySelector("head").append(styles);
                
                setTimeout(() => {
                    console.log("Loading player...");
                    loadPlayer();
                    console.log("Loaded player.");
                }, 1200);
            }).catch((err) => {
                handleError(err);
            })
        })
    }).catch((err) => {
        handleError(err);
    });
}
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
            if (source.isM3U8) {
                // CORS proxy
                source.url = `https://proxy.vnxservers.com/proxy/base/${source.url}`;
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

            const infoArgs = {
                id: id
            }
            fetch(api_server + "/info", { method: "POST", body: JSON.stringify(infoArgs), headers: { "Content-Type": "application/json" }}).then(async(res) => {
                const data = await res.json();
                info = data;
    
                const script = document.createElement("script");
                script.src = "../../../scripts/player.js";
                const styles = document.createElement("link");
                styles.rel = "stylesheet";
                styles.href = "../../../styles/player.css";
                document.querySelector("body").append(script);
                document.querySelector("head").append(styles);
                
                setTimeout(() => {
                    loadPlayer();
                }, 1200);
            }).catch((err) => {
                handleError(err);
            })
        })
    }).catch((err) => {
        handleError(err);
    });
}
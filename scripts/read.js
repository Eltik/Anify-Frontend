function load(id, provider, readId) {
    readId = decrypt(readId);
    if (readId.startsWith("https://") && provider === "Mangakakalot") {
        readId = readId.split("https://")[1];
    }
    const args = {
        id: id,
        provider: provider,
        readId: readId
    };

    fetch(api_server + "/pages", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }}).then(async(res) => {
        document.querySelector(".pages_temp").remove();
        const data = await res.json().catch((err) => {
            alert("Couldn't fetch pages! Please contact Eltik ASAP.");
        });
        const pages = data;
        if (pages.length === 0) {
            alert("Couldn't fetch pages! Please contact Eltik ASAP.");
        } else {
            pages.map((element, index) => {
                const page = document.createElement("img");
                page.src = element.url;
                page.className = "page";
                page.loading = "lazy";
                page.alt = "Page " + (index + 1);
                document.getElementsByClassName("pages")[0].appendChild(page);
            });
        }

        const chapterArgs = {
            id: id
        }
        let chapters = [];
        fetch(api_server + "/chapters", { method: "POST", body: JSON.stringify(chapterArgs), headers: { "Content-Type": "application/json" }}).then(async(res) => {
            const data = await res.json();

            for (let i = 0; i < data.length; i++) {
                if (data[i].provider.toLowerCase() === provider.toLowerCase()) {
                    const temp = data[i].chapters;
                    chapters = temp;
                }
            }

            const infoArgs = {
                id: id
            }
            fetch(api_server + "/info", { method: "POST", body: JSON.stringify(infoArgs), headers: { "Content-Type": "application/json" }}).then(async(res) => {
                const data = await res.json();
    
                const manga = data.data;
    
                chapters.map((element, index) => {
                    if (element.id === readId) {
                        const hasPrevious = chapters[index + 1] !== undefined;
                        const hasNext = chapters[index - 1] !== undefined;
                        
                        document.getElementsByClassName("top_bar_left_title_text")[0].textContent = manga.title.english ? manga.title.english : manga.title.romaji;
                        document.getElementsByClassName("title_href")[0].href = "/info/" + (id);
                        document.getElementsByClassName("top_bar_left_chapter")[0].textContent = element.title;
        
                        if (!hasPrevious) {
                            document.getElementsByClassName("top_bar_right_prev")[0].classList.add("bar_disabled");
                        } else {
                            document.getElementsByClassName("prev_href")[0].href = "/read/" + id + "/" + provider + "/" + (encrypt(chapters[index + 1].id));
                        }
                        if (!hasNext) {
                            document.getElementsByClassName("top_bar_right_next")[0].classList.add("bar_disabled");
                        } else {
                            document.getElementsByClassName("next_href")[0].href = "/read/" + id + "/" + provider + "/" + (encrypt(chapters[index - 1].id));
                        }
                    }
                });
            }).catch((err) => {
                handleError(err);
            });
        }).catch((err) => {
            handleError(err);
        });
    }).catch((err) => {
        console.error(err);
    });
}
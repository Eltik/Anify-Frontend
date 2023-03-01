let x = window.matchMedia("(max-width: 1000px)");

window.onresize = function(event) {
    if (x.matches) {
        const descEl = document.getElementsByClassName("result_slideshow_description");
        for (let i = 0; i < descEl.length; i++) {
            if (descEl[i].textContent.length > 204) {
                descEl[i].textContent = descEl[i].textContent.substring(0, 200) + "...";
            }
        }
    }
};

async function fetchTrending() {
    const args = {
        season: "trending"
    };
    const req = await fetch(api_server + "/seasonal/anime", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }}).catch((err) => {
        handleError(err);
        return { "error": "Could not fetch trending data!" };
    });
    const data = await req.json();
    return data;
}

async function fetchRecentEpisodes() {
    const req = await fetch(api_server + "/recent-episodes?page=1", { method: "GET", headers: { "Content-Type": "application/json" }}).catch((err) => {
        handleError(err);
        return { "error": "Could not fetch recent episodes!" };
    });

    const data = await req.json();
    const req2 = await fetch(api_server + "/recent-episodes?page=2", { method: "GET", headers: { "Content-Type": "application/json" }}).catch((err) => {
        handleError(err);
        return { "error": "Could not fetch recent episodes!" };
    });

    const data2 = await req2.json();
    return data.concat(data2);
}

async function fetchSchedule() {
    const req = await fetch(api_server + "/schedule", { method: "GET", headers: { "Content-Type": "application/json" }}).catch((err) => {
        handleError(err);
        return { "error": "Could not fetch schedule data!" };
    });
    const data = await req.json();
    return data;
}

async function displayTrending(data) {
    const swiper = new Swiper('.swiper', {
        direction: 'horizontal',
        pagination: {
            el: '.swiper-pagination',
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        }
    });
    
    const promises = [];

    for (let i = 0; i < data.length; i++) {
        const promise = new Promise(async(resolve, reject) => {
            if (!data[i]) {
                resolve();
                return;
            }
            const show = data[i];

            let tmdbId = null;
            for (let j = 0; j < data[i].connectors.length; j++) {
                const connector = data[i].connectors[j];
                if (connector.provider === "TMDB") {
                    tmdbId = connector.data.id;
                }
            }

            const id = show.id;
            const title = show.title.english ?? show.title.romaji;
            const romaji = show.title.romaji;
            const native = show.title.native;
            let description = show.description && show.description.length > 300 ? show.description.substring(0, 300) + "..." : (show.description && show.description.length > 0 ? show.description : "No description");
            if (x.matches) {
                description = description.length > 150 ? description.substring(0, 150) + "..." : description;
            }
            let bannerImage = show.bannerImage ? show.bannerImage : show.coverImage.extraLarge;
            const genres = show.genres;

            if (tmdbId != null) {
                const req = await fetch(api_server + "/tmdb", { method: "POST", body: JSON.stringify({ id: tmdbId }), headers: { "Content-Type": "application/json" }});
                const json = await req.json();
                bannerImage = json.backdrop_path ? json.backdrop_path : bannerImage;
            }
            
            let genresText = "";
            genres.map((genre, index) => {
                if (index < 4) {
                    genresText += `<span class="result_slideshow_genre">${genre}</span>`;
                }
            });
    
            const mangaDOM = document.createElement("div");
            mangaDOM.classList.add("swiper-slide");
            
            mangaDOM.innerHTML = `
            <div class="result_slideshow">
                <a href="/info/${id}" class="result_slideshow_link">
                    <img src="${bannerImage}" alt="${title}" class="cover_blur">
                    <div class="banner"></div>
                    <div class="result_slideshow_content_wrapper">
                        <div class="result_slideshow_text">
                            <div class="result_slideshow_title">${title}</div>
                            <div class="result_slideshow_subtitle">${romaji}, ${native}</div>
                            <div class="result_slideshow_description">${description}</div>
                        </div>
                    </div>
                </a>
            </div>
            `;
            swiper.appendSlide(mangaDOM);
            resolve();
        });
        promises.push(promise);
    }

    await Promise.all(promises);
}

async function displayRecentEpisodes(data, listData) {
    const popularDOM = document.querySelector(".latest_items .slideshow_grid");
    const promises = [];
    for (let i = 0; i < data.length; i++) {
        const promise = new Promise(async(resolve, reject) => {
            const show = data[i];

            const id = show.id;

            const list = {
                name: ""
            };
            for (let j = 0; j < listData.length; j++) {
                const currentList = listData[j];
                for (let k = 0; k < currentList.media.length; k++) {
                    if (currentList.media[k].id === id) {
                        list.name = currentList.name;
                    }
                }
            }
            
            const title = show.title.english ?? show.title.romaji;
            const native = show.title.native;
            let description = show.description && show.description.length > 250 ? show.description.substring(0, 250) + "..." : (show.description && show.description.length > 0 ? show.description : "No description");

            const episodeNum = data[i].episodeNumber;

            if (x.matches) {
                description = description.length > 200 ? description.substring(0, 200) + "..." : description;
            }

            const bannerImage = show.bannerImage ? show.bannerImage : show.coverImage.extraLarge;
            const genres = show.genres;

            let genresText = "";
            genres.map((genre, index) => {
                if (index < 3) {
                    genresText += `<span class="result_slideshow_genre result_item_genre">${genre}</span>`;
                }
            });
    
            const mangaDOM = document.createElement("div");
            mangaDOM.classList.add("result_item");
            
            mangaDOM.innerHTML = `
            <div class="result">
                <a href="/info/${id}" class="result_item_link">
                    <div class="result_item_content">
                        ${list.name ? `<div class="result_item_status ${list.name === "Completed" ? "status_green" : list.name === "Watching" ? "status_blue" : list.name === "Dropped" ? "status_red" : "status_orange"}"></div>` : ""}
                        <img src="${bannerImage}" alt="${title}" class="bannerImage">
                        <div class="result_item_gradient"></div>
                        <div class="result_item_episode">
                            <div class="result_item_episode_num">${episodeNum}</div>
                        </div>
                        <div class="result_item_text">
                            <div class="result_item_title">${title}</div>
                            <div class="result_item_subtitle">${native}</div>
                            <div class="result_slideshow_genres result_item_genres">
                                ${genresText}</div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            `;
            popularDOM.appendChild(mangaDOM);
            resolve();
        });
        promises.push(promise);
    }

    await Promise.all(promises);
    setTimeout(() => {
        anime({
            targets:[".result_item"],
            opacity: 1,
            filter: "blur(0px)",
            translateY: "10px",
            delay: anime.stagger(100, { from: "center", easing: "linear" })
        })
    }, 100);
}

async function displayWatching(list) {
    let watching = [];
    for (let i = 0; i < list.length; i++) {
        if (list[i].name === "Watching") {
            watching = list[i].media;
        }
    }
    if (watching.length > 0) {
        document.querySelector(".watching_items").classList.remove("hidden");
    } else {
        document.querySelector(".watching_items").innerHTML = "";
    }
    const popularDOM = document.querySelector(".watching_items .slideshow_grid");
    const promises = [];
    for (let i = 0; i < watching.length; i++) {
        const promise = new Promise(async(resolve, reject) => {
            const show = watching[i];
            const id = show.id;

            const list = {
                name: ""
            };
            for (let j = 0; j < listData.length; j++) {
                const currentList = listData[j];
                for (let k = 0; k < currentList.media.length; k++) {
                    if (currentList.media[k].id === id) {
                        list.name = currentList.name;
                    }
                }
            }

            const title = show.title.english ? show.title.english : show.title.romaji;
            let description = show.description && show.description.length > 250 ? show.description.substring(0, 250) + "..." : (show.description && show.description.length > 0 ? show.description : "No description");

            if (x.matches) {
                description = description.length > 200 ? description.substring(0, 200) + "..." : description;
            }

            const bannerImage = show.bannerImage ? show.bannerImage : show.coverImage.extraLarge;
            const genres = show.genres;

            let genresText = "";
            genres.map((genre, index) => {
                if (index < 3) {
                    genresText += `<span class="result_slideshow_genre">${genre}</span>`;
                }
            });
    
            const mangaDOM = document.createElement("div");
            mangaDOM.classList.add("result_item");
            
            mangaDOM.innerHTML = `
            <div class="result">
                <a href="/info/${id}" class="result_item_link">
                    <div class="result_item_content">
                        ${list.name ? `<div class="result_item_status ${list.name === "Completed" ? "status_green" : list.name === "Watching" ? "status_blue" : list.name === "Dropped" ? "status_red" : "status_orange"}"></div>` : ""}
                        <img src="${bannerImage}" alt="${title}" class="bannerImage">
                        <div class="result_item_gradient"></div>
                        <div class="result_item_text">
                            <div class="result_item_title">${title}</div>
                            <div class="result_slideshow_genres">
                                ${genresText}
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            `;
            popularDOM.appendChild(mangaDOM);
            resolve();
        });
        promises.push(promise);
    }

    await Promise.all(promises).then(() => {
        setTimeout(() => {
            anime({
                targets:[".search_item"],
                opacity: 1,
                filter: "blur(0px)",
                translateY: "10px",
                delay: anime.stagger(100, { from: "center", easing: "linear" })
            })
        }, 100);
    })
}

async function displaySchedule(data, listData) {
    const promises = [];
    data = data.reverse();

    const popularDOM = document.querySelector(".schedule_items .schedule_grid");
    for (let i = 0; i < data.length; i++) {
        const promise = new Promise(async(resolve, reject) => {
            const show = data[i];
            const id = show.id;

            const dateAiring = timeSince(data[i].date);

            const list = {
                name: ""
            };
            for (let j = 0; j < listData.length; j++) {
                const currentList = listData[j];
                for (let k = 0; k < currentList.media.length; k++) {
                    if (currentList.media[k].id === id) {
                        list.name = currentList.name;
                    }
                }
            }

            const title = show.title.english ?? show.title.romaji;
            let description = show.description && show.description.length > 250 ? show.description.substring(0, 250) + "..." : (show.description && show.description.length > 0 ? show.description : "No description");
            
            const cover = show.coverImage.alt ?? show.coverImage.extraLarge;

            if (x.matches) {
                description = description.length > 200 ? description.substring(0, 200) + "..." : description;
            }

            const genres = show.genres;
            
            let genresText = "";
            genres.map((genre, index) => {
                if (index < 3) {
                    genresText += `<span class="result_slideshow_genre">${genre}</span>`;
                }
            });
    
            const mangaDOM = document.createElement("div");
            mangaDOM.classList.add("result_item");
            mangaDOM.classList.add("search_item");
            
            mangaDOM.innerHTML = `
            <div class="result_search">
                <a href="/info/${id}" class="result_search_link">
                    <div class="result_search_content">
                        <div class="result_search_image">
                            <img src="${cover}" alt="${title}" class="cover">
                        </div>
                        <div class="result_search_text">
                            <div class="result_search_title">${title}</div>
                            ${list.name ? `<div class="result_item_status ${list.name === "Completed" ? "status_green" : list.name === "Watching" ? "status_blue" : list.name === "Dropped" ? "status_red" : "status_orange"}"></div>` : ""}
                            <div class="result_slideshow_genres">
                                ${genresText}
                            </div>
                            <div class="result_slideshow_airing">
                                <span class="result_slideshow_airing_title">Next Ep.</span> <span class="result_slideshow_airing_highlight">${dateAiring}</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            `;
            popularDOM.appendChild(mangaDOM);
            resolve();
        });
        promises.push(promise);
    }

    await Promise.all(promises).then(() => {
        setTimeout(() => {
            anime({
                targets:[".schedule_item"],
                opacity: 1,
                filter: "blur(0px)",
                translateY: "10px",
                delay: anime.stagger(100, { from: "center", easing: "linear" })
            })
        }, 100);
    })
}

async function handleSearch(data, listData) {
    if (!data || data.length === 0) {
        // Need to update
        alert("No results.");
    }

    document.querySelector(".search_items").style = "display:block";
    document.querySelector(".search_items").style = "opacity: 1";
    document.querySelector(".search_items .search_grid").innerHTML = "";
    anime({
        targets:[".popular_items", ".latest_items", ".watching_items", ".schedule_items"],
        opacity: 0,
        translateY: "50px",
        duration: 500,
        easing: "easeInOutQuad",
        complete: () => {
            document.querySelector(".popular_items").style = "display:none";
            document.querySelector(".latest_items").style = "display:none";
            document.querySelector(".schedule_items").style = "display:none";
            document.querySelector(".watching_items").style = "display:none";
        }
    })

    const promises = [];

    const popularDOM = document.querySelector(".search_items .search_grid");
    for (let i = 0; i < data.length; i++) {
        const promise = new Promise(async(resolve, reject) => {
            const show = data[i];
            const id = show.id;

            const list = {
                name: ""
            };
            for (let j = 0; j < listData.length; j++) {
                const currentList = listData[j];
                for (let k = 0; k < currentList.media.length; k++) {
                    if (currentList.media[k].id === id) {
                        list.name = currentList.name;
                    }
                }
            }

            const title = show.title.english ? show.title.english : show.title.romaji;
            let description = show.description && show.description.length > 250 ? show.description.substring(0, 250) + "..." : (show.description && show.description.length > 0 ? show.description : "No description");
            
            const cover = show.coverImage.alt ?? show.coverImage.extraLarge;

            if (x.matches) {
                description = description.length > 200 ? description.substring(0, 200) + "..." : description;
            }

            const genres = show.genres;
            
            let genresText = "";
            genres.map((genre, index) => {
                if (index < 3) {
                    genresText += `<span class="result_slideshow_genre">${genre}</span>`;
                }
            });
    
            const mangaDOM = document.createElement("div");
            mangaDOM.classList.add("result_item");
            mangaDOM.classList.add("search_item");
            
            mangaDOM.innerHTML = `
            <div class="result_search">
                <a href="/info/${id}" class="result_search_link">
                    <div class="result_search_content">
                        <div class="result_search_image">
                            <img src="${cover}" alt="${title}" class="cover">
                        </div>
                        <div class="result_search_text">
                            <div class="result_search_title">${title}</div>
                            ${list.name ? `<div class="result_item_status ${list.name === "Completed" ? "status_green" : list.name === "Watching" ? "status_blue" : list.name === "Dropped" ? "status_red" : "status_orange"}"></div>` : ""}
                            <div class="result_slideshow_genres">
                                ${genresText}
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            `;
            popularDOM.appendChild(mangaDOM);
            resolve();
        });
        promises.push(promise);
    }

    await Promise.all(promises).then(() => {
        console.log("Finished fetching episodes.");
        setTimeout(() => {
            anime({
                targets:[".search_item"],
                opacity: 1,
                filter: "blur(0px)",
                translateY: "10px",
                delay: anime.stagger(100, { from: "center", easing: "linear" })
            })
        }, 100);
    })
}

function checkIfEmpty() {
    const searchValue = document.getElementsByClassName("search")[0]["value"];
    if (!searchValue || searchValue.length === 0) {
        document.querySelector(".search_items").style = "display:none";
        document.querySelector(".popular_items").style = "display:block";
        document.querySelector(".latest_items").style = "display:flex";
        document.querySelector(".schedule_items").style = "display:flex";
        document.querySelector(".watching_items").style = "display:block";
        anime({
            targets:[".popular_items", ".latest_items", ".schedule_items", ".watching_items"],
            opacity: 1,
            translateY: "0px",
            duration: 1000,
            easing: "easeInOutQuad"
        })
    }
}
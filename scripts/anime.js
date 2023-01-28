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

async function fetchPopular() {
    const args = {
        season: "season"
    };
    const req = await fetch(api_server + "/seasonal/anime", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }}).catch((err) => {
        handleError(err);
        return { "error": "Could not fetch seasonal data!" };
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
            const show = data[i].anilist;

            let tmdbId = null;
            for (let j = 0; j < data[i].connectors.length; j++) {
                const connector = data[i].connectors[j];
                if (connector.provider === "TMDB") {
                    tmdbId = connector.data.id;
                }
            }

            const id = show.id;
            const title = show.title.english;
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
                            <div class="result_slideshow_genres">
                                ${genresText}
                            </div>
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

async function displayPopular(data) {
    const popularDOM = document.getElementsByClassName("slideshow_grid")[0];
    const promises = [];
    for (let i = 0; i < data.length; i++) {
        const promise = new Promise(async(resolve, reject) => {
            const show = data[i].anilist;

            const id = show.id;
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

function slideshowHover() {

}

async function handleSearch(data) {
    if (!data || data.length === 0) {
        // Need to update
        alert("No results.");
    }

    document.querySelector(".search_items").style = "display:block";
    document.querySelector(".search_items").style = "opacity: 1";
    document.querySelector(".search_items .slideshow_grid").innerHTML = "";
    anime({
        targets:[".popular_items", ".latest_items"],
        opacity: 0,
        translateY: "50px",
        duration: 500,
        easing: "easeInOutQuad",
        complete: () => {
            document.querySelector(".popular_items").style = "display:none";
            document.querySelector(".latest_items").style = "display:none";
        }
    })

    const promises = [];

    const popularDOM = document.querySelector(".search_items .slideshow_grid");
    for (let i = 0; i < data.length; i++) {
        const promise = new Promise(async(resolve, reject) => {
            const show = data[i].anilist;
            const id = show.id;
            const title = show.title.english ? show.title.english : show.title.romaji;
            let description = show.description && show.description.length > 250 ? show.description.substring(0, 250) + "..." : (show.description && show.description.length > 0 ? show.description : "No description");
            
            const cover = show.coverImage.large;
            const duration = show.duration;
            const favorites = show.favourites > 1000 ? numeral(show.favourites).format("0.0a") : numeral(show.favourites).format("0a");

            if (x.matches) {
                description = description.length > 200 ? description.substring(0, 200) + "..." : description;
            }

            const genres = show.genres;
            
            let genresText = "";
            genres.map((genre, index) => {
                if (index < 4) {
                    genresText += `<span class="result_slideshow_genre">${genre}</span>`;
                }
            });
    
            const mangaDOM = document.createElement("div");
            mangaDOM.classList.add("result_item");
            mangaDOM.classList.add("search_item");
            
            mangaDOM.innerHTML = `
            <div class="result">
                <a href="/info/${id}" class="result_item_link">
                    <div class="result_item_content">
                        <img src="${cover}" alt="${title}" class="cover">
                        <div class="result_item_text">
                            <div class="result_item_title">${title}</div>
                            <div class="result_slideshow_stats">
                                <span class="result_slideshow_stat">~${duration} minutes</span>
                                <span class="result_slideshow_stat">${favorites} favorites</span>
                            </div>
                            <div class="result_slideshow_genres">
                                ${genresText}
                            </div>
                            <div class="result_item_description">
                                ${description}
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
        document.querySelector(".latest_items").style = "display:block";
        anime({
            targets:[".popular_items", ".latest_items"],
            opacity: 1,
            translateY: "0px",
            duration: 1000,
            easing: "easeInOutQuad"
        })
    }
}
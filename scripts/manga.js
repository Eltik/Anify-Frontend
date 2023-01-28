let slideIndex = 1;
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

showSlide(slideIndex);

function nextSlide(n) {
    showSlide(slideIndex += n);
}

function showSlide(n) {
    let i;
    const x = document.getElementsByClassName("popular_item");
    if (n > x.length) {
        slideIndex = 1
    }
    if (n < 1) {
        slideIndex = x.length
    }
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";  
    }
    x[slideIndex-1] ? x[slideIndex-1].style.display = "block" : "";
}

async function fetchTrending() {
    const args = {
        season: "trending"
    };
    const req = await fetch(api_server + "/seasonal/manga", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }}).catch((err) => {
        handleError(err);
        return { "error": "Could not fetch popular data!" };
    });

    const data = await req.json();
    return data;
}

async function fetchPopular() {
    const args = {
        season: "popular"
    };
    const req = await fetch(api_server + "/seasonal/manga", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }}).catch((err) => {
        handleError(err);
        return { "error": "Could not fetch latest data!" };
    });

    const data = await req.json();
    return data;
}

function displayTrending(data) {
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

    for (let i = 0; i < data.length; i++) {
        const manga = data[i].anilist;
        const id = manga.id;
        const title = manga.title.english;
        const romaji = manga.title.romaji;
        const native = manga.title.native;
        let description = manga.description.length > 250 ? manga.description.substring(0, 250) + "..." : manga.description;
        if (x.matches) {
            description = description.length > 150 ? description.substring(0, 150) + "..." : description;
        }
        const bannerImage = manga.bannerImage ? manga.bannerImage : manga.coverImage.extraLarge;
        const genres = manga.genres;
        
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
            <a href="/info/${(id)}" class="result_slideshow_link">
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
    }
}

function displayPopular(data) {
    const popularDOM = document.getElementsByClassName("slideshow_grid")[0];
    for (let i = 0; i < data.length; i++) {
        const manga = data[i].anilist;
        const id = manga.id;
        const title = manga.title.english ? manga.title.english : manga.title.romaji;
        let description = manga.description.length > 250 ? manga.description.substring(0, 250) + "..." : manga.description;
        
        if (x.matches) {
            description = description.length > 200 ? description.substring(0, 200) + "..." : description;
        }

        const cover = manga.coverImage.large;

        const genres = manga.genres;
        
        let genresText = "";
        genres.map((genre, index) => {
            if (index < 4) {
                genresText += `<span class="result_slideshow_genre">${genre}</span>`;
            }
        });

        const mangaDOM = document.createElement("div");
        mangaDOM.classList.add("result_item");
        mangaDOM.innerHTML = `
        <div class="result">
            <a href="/info/${id}" class="result_item_link">
                <div class="result_item_content">
                    <img src="${cover}" alt="${title}" class="cover">
                    <div class="result_item_text">
                        <div class="result_item_title">${title}</div>
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
    }
    
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

function handleSearch(data) {
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
    const popularDOM = document.querySelector(".search_items .slideshow_grid");
    for (let i = 0; i < data.length; i++) {
        const manga = data[i].anilist;
        const id = manga.id;
        const title = manga.title.english ? manga.title.english : manga.title.romaji;
        let description = manga.description?.length > 250 ? manga.description.substring(0, 250) + "..." : manga.description;
        
        if (x.matches) {
            description = description.length > 200 ? description.substring(0, 200) + "..." : description;
        }
        
        const cover = manga.coverImage.large;

        const genres = manga.genres;
        
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
            <a href="/info/${(id)}" class="result_item_link">
                <div class="result_item_content">
                    <img src="${cover}" alt="${title}" class="cover">
                    <div class="result_item_text">
                        <div class="result_item_title">${title}</div>
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
    }

    setTimeout(() => {
        anime({
            targets:[".search_item"],
            opacity: 1,
            filter: "blur(0px)",
            translateY: "10px",
            delay: anime.stagger(100, { from: "center", easing: "linear" })
        })
    }, 100);
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
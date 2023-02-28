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

function handleSearch(data) {
    if (!data || data.length === 0) {
        // Need to update
        alert("No results.");
    }
    
    document.querySelector(".search_items").style = "display:block";
    document.querySelector(".search_items").style = "opacity: 1";
    document.querySelector(".search_items .search_grid").innerHTML = "";
    
    const popularDOM = document.querySelector(".search_items .search_grid");
    const promises = [];
    for (let i = 0; i < data.length; i++) {
        const promise = new Promise(async(resolve, reject) => {
            const show = data[i];
            const id = show.id;

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
                <a href="/novel/${id}" class="result_search_link">
                    <div class="result_search_content">
                        <div class="result_search_image">
                            <img src="${cover}" alt="${title}" class="cover">
                        </div>
                        <div class="result_search_text">
                            <div class="result_search_title">${title}</div>
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
    setTimeout(() => {
        anime({
            targets: [".slideshow_item"],
            translateY: "0px",
            opacity: 1,
            duration: 1000,
            easing: "easeInOutQuad",
            delay: anime.stagger(100)
        });
    }, 50);
}

function checkIfEmpty() {
    const searchValue = document.getElementsByClassName("search")[0]["value"];
    if (!searchValue || searchValue.length === 0) {
        document.querySelector(".search_items").style = "display:none";
    }
}
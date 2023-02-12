function handleSearch(data) {
    if (!data || data.length === 0) {
        // Need to update
        alert("No results.");
    }
    
    document.querySelector(".search_items").style = "display:block";
    document.querySelector(".search_items").style = "opacity: 1";
    document.querySelector(".search_items .search_grid").innerHTML = "";
    
    const popularDOM = document.querySelector(".search_items .search_grid");
    for (let i = 0; i < data.length; i++) {
        const manga = data[i];
        const id = manga.id;
        const title = manga.title;
        const cover = manga.cover;

        const mangaDOM = document.createElement("div");
        mangaDOM.classList.add("result_item");
        mangaDOM.classList.add("search_item");
        
        mangaDOM.innerHTML = `
        <div class="result_search">
            <a href="${api_server}/pdf/${id}" target="_blank" class="result_search_link">
                <div class="result_search_content">
                    <div class="result_search_image">
                        <img src="${api_server}/cover/${cover}" alt="${title}" class="cover">
                    </div>
                    <div class="result_search_text">
                        <div class="result_search_title">${title}</div>
                        <div class="result_item_description">
                            English
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
            targets: [".slideshow_item"],
            translateY: "0px",
            opacity: 1,
            duration: 1000,
            easing: "easeInOutQuad",
            delay: anime.stagger(100)
        });
    }, 50);
}
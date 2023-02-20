let providerIndex = 0;
let maxProviders = 0;

function showOptions() {
    if (document.querySelector(".providers_selector .options").classList.contains("hidden")) {
        document.querySelector(".providers_selector .options").style.opacity = 0;
        document.querySelector(".providers_selector .options").classList.remove("hidden");
        anime({
            targets: ".providers_selector .options",
            opacity: 1,
            translateY: 0,
            duration: 200,
            easing: "easeInOutQuad"
        });
    } else {
        anime({
            targets: ".providers_selector .options",
            opacity: 0,
            translateY: -10,
            duration: 200,
            easing: "easeInOutQuad",
            complete: () => {
                document.querySelector(".providers_selector .options").classList.add("hidden");
            }
        });
    }
}

function switchProvider(index) {
    const providerList = document.querySelectorAll(".providerlist");

    providerList[providerIndex]?.classList.add("hidden");
    if (index != undefined) {
        providerIndex = index;
    } else {
        if (providerIndex === maxProviders - 1) {
            providerIndex = 0;
        } else {
            providerIndex = providerIndex + 1;
        }
    }

    document.querySelector(".providers_selector .value-placeholder").textContent = providerList[providerIndex]?.getAttribute("data-provider");
    providerList[providerIndex]?.classList.remove("hidden");
}

async function load(id, type) {
    let content = null;

    let tnails = [];
    console.log(info);
    if (info.id && info.data != undefined) {
        info = info.data;
    }

    const parser = new DOMParser();
    const parsed = parser.parseFromString(info.description, "text/html").body.textContent;
    document.querySelector(".mangadescription").textContent = parsed;

    if (type === "ANIME") {
        const req = await fetch(api_server + "/episodes", { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" }});
        const json = await req.json();

        console.log("Received episode response.");
        content = json;

        const tnailReq = await fetch(api_server + "/episode_covers", { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" }}).catch((err) => {
            return null;
        });
        if (tnailReq != null) {
            tnails = await tnailReq.json();
        }
    } else if (type === "MANGA") {
        const req = await fetch(api_server + "/chapters", { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" }});
        const json = await req.json();
        console.log("Received chapters response.");
        content = json;
    }

    if (content != null) {
        const chaptersList = document.querySelector(".chapters_content");

        document.querySelector(".providers_selector .value-placeholder").textContent = content[0]?.provider;

        for (let i = 0; i < content.length; i++) {
            const provider = document.createElement("div");
            provider.className = "providerlist";
            provider.setAttribute("data-provider", content[i].provider);

            const providerAppend = document.createElement("div");
            providerAppend.innerHTML = `
            <div data-v-e3e1e202="" class="option" onclick="switchProvider(${i})">
                <div data-v-e3e1e202="" class="option-label">
                    <div data-v-e3e1e202="" class="option-name">${content[i].provider}</div>
                </div>
            </div>
            `
            document.querySelector(".providers_selector .options .option-group").append(providerAppend);

            if (i != 0) {
                provider.classList.add("hidden");
            }

            const providerChapters = document.createElement("div");
            providerChapters.className = "chapterslist";

            if (content[i].episodes && content[i].episodes.length > 0) {
                for (let j = 0; j < content[i].episodes.length; j++) {
                    const item = content[i].episodes[j];
        
                    item.title = item.title && item.title.length > 0 ? item.title : "Ep. " + j;
                    item.title = item.number ? item.number + " - " + item.title : item.title;
        
                    const chapter = document.createElement("a");
                    const readingId = `/watch/${id}/${content[i].provider}/${encrypt(item.id)}`;
                    chapter.href = readingId;
                    chapter.className = "chapter_wrapper";
                    
                    const episodeWrapper = document.createElement("div");
                    episodeWrapper.className = "episode_wrapper";

                    const episode = document.createElement("div");
                    episode.className = "episode";
                    episode.id = "chapter-" + i;

                    let episodeThumbnail = null;
                    for (let k = 0; k < tnails.length; k++) {
                        if (k === j) {
                            episodeThumbnail = tnails[k].thumbnail;
                        }
                    }
                    episodeThumbnail = episodeThumbnail ?? info.coverImage.alt ?? info.coverImage.extraLarge;

                    const episodeImg = document.createElement("img");
                    episodeImg.src = episodeThumbnail;
                    episodeImg.className = "episode_image";

                    const episodeBlur = document.createElement("div");
                    episodeBlur.className = "banner";

                    episode.append(episodeImg);

                    const episodePlay = document.createElement("svg");
                    episodePlay.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                    episodePlay.setAttribute("viewBox", "0 0 24 24");
                    episodePlay.setAttribute("fill", "none");
                    episodePlay.className = "play_icon";
                    episodePlay.innerHTML = `
                        <path opacity=".4"
                            d="M11.969 22c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10Z"
                            fill="currentColor"></path>
                        <path
                            d="m14.97 10.231-2.9-1.67c-.72-.42-1.59-.42-2.31 0s-1.15 1.16-1.15 2v3.35c0 .83.43 1.58 1.15 2a2.285 2.285 0 0 0 2.3 0l2.9-1.67c.72-.42 1.15-1.16 1.15-2 .01-.84-.42-1.58-1.14-2Z"
                            fill="currentColor"></path>
                    `;
                    episode.append(episodePlay);

                    const episodeDescription = document.createElement("div");
                    episodeDescription.className = "episode_info";
                    episodeDescription.textContent = `${item.title}`;

                    episodeWrapper.append(episode);

                    chapter.appendChild(episodeWrapper);
                    chapter.append(episodeDescription);
                    providerChapters.appendChild(chapter);
                }
                provider.appendChild(providerChapters);
                chaptersList.append(provider);
                maxProviders++;
            } else if (content[i].chapters && content[i].chapters.length > 0) {
                for (let j = 0; j < content[i].chapters.length; j++) {
                    const item = content[i].chapters[j];
        
                    item.title = item.title && item.title.length > 0 ? item.title : "Oneshot";
        
                    const chapter = document.createElement("a");
                    const readingId = `/read/${id}/${content[i].provider}/${encrypt(item.id ? item.id : item.url)}`;
                    chapter.href = readingId;
                    chapter.className = "chapter_wrapper";
                    chapter.setAttribute("data-chapter", true);
                    
                    const chapterText = document.createElement("div");
                    chapterText.className = "chapter";

                    const chapterTitle = document.createElement("div");
                    chapterTitle.className = "chapter_title";

                    const p = document.createElement("p");
                    p.textContent = item.title;

                    chapterTitle.appendChild(p);
                    chapterText.appendChild(chapterTitle);

                    chapterText.id = "chapter-" + i;
                    chapter.appendChild(chapterText);
                    providerChapters.appendChild(chapter);
                }
                provider.appendChild(providerChapters);
                chaptersList.append(provider);
                maxProviders++;
            }
        }
    }

    const relationsReq = await fetch(api_server + "/relations", { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" }});
    const relations = await relationsReq.json();

    const relationDOM = document.querySelector(".relations");
    relations.map((relation) => {
        const dom = document.createElement("div");
        dom.className = "relation";

        const wrapper = document.createElement("a");
        wrapper.className = "relation_wrapper";
        wrapper.href = `/info/${relation.data.id}`;

        if (relation.type === "MANGA") {
            const span = document.createElement("span");
            span.className = "relation_text";
            span.textContent = "Manga";
            wrapper.append(span);
        } else if (relation.type === "ANIME") {
            const span = document.createElement("span");
            span.textContent = "Anime";
            span.className = "relation_text";
            wrapper.append(span);
        }

        dom.append(wrapper);

        relationDOM.append(dom);
    })
}
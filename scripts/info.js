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

    providerList[providerIndex].classList.add("hidden");
    if (providerIndex === maxProviders - 1) {
        providerIndex = 0;
    } else {
        providerIndex = index || providerIndex + 1;
    }

    document.querySelector(".providers_selector .value-placeholder").textContent = providerList[providerIndex].querySelector(".chaptersheader").textContent;
    providerList[providerIndex].classList.remove("hidden");
}

async function load(id, type) {
    let content = null;
    if (type === "ANIME") {
        const req = await fetch(api_server + "/episodes", { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" }});
        const json = await req.json();
        content = json;
        document.querySelector(".chaptersheader span").textContent = "Episodes";
    } else if (type === "MANGA") {
        const req = await fetch(api_server + "/chapters", { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" }});
        const json = await req.json();
        content = json;
        document.querySelector(".chaptersheader span").textContent = "Chapters";
    }

    if (content != null) {
        const chaptersList = document.querySelector(".chapterslist");
        if (content.length > 0) {
            const button = document.createElement("button")
            button.type = "button";
            button.className = "button";
            button.id = "switchProvider";
            button.onclick = () => {
                switchProvider()
            }
            button.textContent = "Switch Provider";
            document.querySelector(".chapters").insertBefore(button, chaptersList);
        }

        for (let i = 0; i < content.length; i++) {
            const provider = document.createElement("div");
            provider.className = "providerlist";
            const header = document.createElement("div");
            header.className = "chaptersheader";
            const headerSpan = document.createElement("span");
            headerSpan.textContent = content[i].provider;

            document.querySelector(".providers_selector .value-placeholder").textContent = content[i].provider;
            const providerAppend = document.createElement("div");
            providerAppend.innerHTML = `
            <div data-v-e3e1e202="" class="option" onclick="switchProvider(${i})">
                <div data-v-e3e1e202="" class="option-label">
                    <div data-v-e3e1e202="" class="option-name">${content[i].provider}</div>
                </div>
            </div>
            `
            document.querySelector(".providers_selector .options .option-group").append(providerAppend);

            header.append(headerSpan);
            provider.appendChild(header);

            if (i != 0) {
                provider.classList.add("hidden");
            }

            const providerChapters = document.createElement("div");
            providerChapters.className = "providerchapters";

            if (content[i].episodes && content[i].episodes.length > 0) {
                for (let j = 0; j < content[i].episodes.length; j++) {
                    const item = content[i].episodes[j];
        
                    item.title = item.title && item.title.length > 0 ? item.title : "Ep. " + j;
                    item.title = item.number ? item.number + " - " + item.title : item.title;
        
                    const chapter = document.createElement("a");
                    const readingId = `/watch/${id}/${content[i].provider}/${encrypt(item.id)}`;
                    chapter.href = readingId;
                    chapter.className = "chapter_wrapper";
                    
                    const chapterText = document.createElement("div");
                    chapterText.className = "chapter";
                    chapterText.textContent = item.title;
                    chapterText.id = "chapter-" + i;
                    chapter.appendChild(chapterText);
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
                    
                    const chapterText = document.createElement("div");
                    chapterText.className = "chapter";
                    chapterText.textContent = item.title;
                    chapterText.id = "chapter-" + i;
                    chapter.appendChild(chapterText);
                    providerChapters.appendChild(chapter);
                }
                provider.appendChild(providerChapters);
                chaptersList.append(provider);
                maxProviders++;
            }
        }
        if (maxProviders === 1) {
            document.getElementById("switchProvider").remove();
            document.querySelector(".providerlist .chaptersheader").remove();
        }
    }
}
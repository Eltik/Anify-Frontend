let providerIndex = 0;
let maxProviders = 0;

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
                const providerList = document.querySelectorAll(".providerlist");

                providerList[providerIndex].classList.add("hidden");
                if (providerIndex === maxProviders - 1) {
                    providerIndex = 0;
                } else {
                    providerIndex++;
                }

                providerList[providerIndex].classList.remove("hidden");
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
            headerSpan.textContent = content[i].provider + " - " + (content[i].provider_data.title ? content[i].provider_data.title : content[i].provider_data.romaji);
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
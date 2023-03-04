/* Menu */
// Credit to Enimax
let menuCon;
let isOpen = false;
let temp = false;
let chapterMenu = false;

let DMenu;

let x = window.matchMedia("(min-height: 800px)");

function createElement(x) {
    let temp;
    if ("element" in x) {
        temp = document.createElement(x.element);

    } else {
        temp = document.createElement("div");

    }
    let attributes = x.attributes;

    for (value in attributes) {
        temp.setAttribute(value, attributes[value]);
    }



    for (value in x.style) {
        temp.style[value] = x.style[value];
    }


    if ("id" in x) {
        temp.id = x.id;
    }

    if ("class" in x) {
        temp.className = x.class;
    }

    if ("innerText" in x) {
        temp.textContent = x.innerText;
    }

    if ("innerHTML" in x) {
        temp.innerHTML = x.innerHTML;
    }

    let listeners = x.listeners;

    for (value in listeners) {
        temp.addEventListener(value, listeners[value]);
    }

    return temp;

}

class Toggle {
    constructor(element) {
        this.element = element;
    }

    turnOn() {
        if (!this.isOn()) {
            this.element.click();
        }
    }

    turnOff() {
        if (this.isOn()) {
            this.element.click();
        }
    }

    isOn() {
        return this.element.classList.contains("active");
    }

    toggle() {
        if (this.isOn()) {
            this.turnOff();
        } else {
            this.turnOn();
        }
    }
}

class Selectables {
    constructor(element) {
        this.element = element;
    }

    select() {
        this.element.click();
    }
}

class Scene {
    constructor(config, dropDownMenuInstance) {
        this.data = config;
        this.DDMinstance = dropDownMenuInstance;
    }

    addItem(config, isHeading = false) {
        this.element.querySelector(".scene").append(this.DDMinstance.makeItem(config, isHeading, this.data.id));

        if (this.element.classList.contains("active")) {
            this.DDMinstance.menuCon.style.height = this.element.querySelector(".scene").offsetHeight + "px";
            if (x.matches) {
                this.DDMinstance.menuCon.style.height = (this.element.querySelector(".scene").offsetHeight * 2) + "px";
            }
        }
    }

    delete() {
        this.deleteItems();
        this.data = null;
        this.DDMinstance = null;
        this.element.remove();
    }

    deleteItems() {
        this.element.querySelector(".scene").innerHTML = "";

        if (this.data.id in this.DDMinstance.selectedValues) {
            this.DDMinstance.selectedValues[this.data.id] = "";
        }

        this.DDMinstance.updateSelectVals(this.data.id);
        this.DDMinstance.deleteSceneFromHistory(this.data.id);

        for (let item of this.data.items) {
            this.DDMinstance.deleteItem(item);
        }
        this.data.items = [];
    }
}

class dropDownMenu {
    constructor(scenes, menuCon) {
        this.scenes = {};
        this.menuCon = menuCon;
        this.history = [];
        this.toggles = {};
        this.selections = {};
        this.selectedValues = {};
        this.selectedValuesDOM = {};
        for (let scene of scenes) {
            this.scenes[scene.id] = new Scene(scene, this);
        }

        for (let scene of scenes) {
            if (!this.scenes[scene.id].element) {
                this.makeScene(scene);
            }
        }

        menuCon.onscroll = function () {
            menuCon.scrollLeft = 0;
        };



    }

    open(id) {
        if (id in this.scenes) {
            if (!this.history.length || (this.history.length && this.history[this.history.length - 1] != id)) {
                this.history.push(id);
            }

            for (let sceneID in this.scenes) {
                if (sceneID === id) {
                    this.scenes[sceneID].element.classList.add("active");
                    this.menuCon.style.height = this.scenes[sceneID].element.querySelector(".scene").offsetHeight + "px";
                } else {
                    this.scenes[sceneID].element.classList.remove("active");
                }
            }

        }
    }

    back() {
        if (this.history.length > 1) {
            let lastHistory = this.history.pop();
            this.open(this.history.pop());
        }else{
            this.closeMenu();
        }
    }


    openMenu(){
        this.menuCon.style.display = "block";
    }

    closeMenu(){
        this.menuCon.style.display = "none";
    }


    makeItem(item, isHeading = false, sceneID) {
        item.selectedValue = this.selectedValues[item.open];


        let shouldShowValue = false;
        if(this.scenes[item.open] instanceof Scene){
            shouldShowValue = this.scenes[item.open].data.selectableScene === true
        }


        let menuItem = createElement({
            "class": isHeading ? "menuHeading" : "menuItem",
            "attributes": item.attributes ? item.attributes : {},
        })

        if (!isHeading && "iconID" in item) {
            let menuItemIcon = createElement({
                "class": "menuItemIcon",
                "id": item.iconID
            });

            menuItem.append(menuItemIcon);
        }

        if (item.open) {
            menuItem.addEventListener("click", () => {
                this.open(item.open);
            });
        }



        if (isHeading && item.hideArrow !== true) {
            let menuItemIcon = createElement({
                "class": "menuItemIcon menuItemIconBack",
            });

            menuItem.addEventListener("click", () => {
                this.back();
            });

            menuItem.append(menuItemIcon);
        }

        let self = this;

        if (item.callback) {
            menuItem.addEventListener("click", () => {
                item.callback.bind(menuItem)();
            });
        }

        if (item.selected) {
            menuItem.classList.add("selected");
            if (sceneID) {
                this.selectedValues[sceneID] = item.text;
                this.updateSelectVals(sceneID);
            }
        }


        if (item.highlightable) {

            if (item.id) {
                this.selections[item.id] = new Selectables(menuItem);
            }

            menuItem.setAttribute("highlightable", "true");
            menuItem.addEventListener("click", function () {
                let siblings = menuItem.parentElement.children;

                for (let child of siblings) {
                    if (child.getAttribute("highlightable") === "true") {
                        child.classList.remove("selected");
                    }
                }

                menuItem.classList.add("selected");

                if (sceneID) {
                    self.selectedValues[sceneID] = menuItem.innerText;
                    self.updateSelectVals(sceneID);

                }

            });
        }


        let menuItemText = createElement({
            "class": "menuItemText",
            "innerText": item.text
        });


        menuItem.append(menuItemText);

        if (item.textBox) {
            let textBox = createElement({
                "element": "input",
                "class": "textBox",
                "attributes": {
                    "type": "text"
                }
            });

            if (item.value) {
                textBox.value = item.value;
            }

            textBox.addEventListener("keyup", function() {
                isFocused = false;
            }, false);
            textBox.addEventListener("keydown", function() {
                isFocused = true;
            }, false);
            textBox.addEventListener("keypress", function() {
                isFocused = true;
            }, false);
            

            textBox.addEventListener("input", item.onInput);

            // if(item.id){
            //     this.toggles[item.id] = new Toggle(toggle);
            // }
            menuItem.append(textBox);
        }


        if (shouldShowValue) {
            // menuItem.classList.add("menuItemToggle");

            let valueDOM = createElement({
                "innerText": item.selectedValue,
                "class": "menuItemValue"
            });
            menuItem.append(valueDOM);

            item.valueDOM = valueDOM;
            if (!this.selectedValuesDOM[item.open]) {
                this.selectedValuesDOM[item.open] = {};
            }

            let sValue = this.selectedValuesDOM[item.open];


            if (sValue.elements) {
                sValue.elements.push(valueDOM);
            } else {
                sValue.elements = [valueDOM];
            }
        }


        if (item.open) {
            menuItem.append(createElement({
                "class": "menuItemIcon menuItemIconSub",
                "style": {
                    "marginLeft": item.selectedValue ? "3px" : "auto"
                }
            }))
        }
        if (item.toggle) {
            menuItem.classList.add("menuItemToggle");
            let toggle = null;
            if (item.toggled) {
                toggle = createElement({
                    "class": `toggle active`,
                    "listeners": {
                        "click": function () {
                            this.classList.toggle("active");
                            if (this.classList.contains("active")) {
                                item.toggleOn();
                            } else {
                                item.toggleOff();
                            }
                        },
                    }
                });
                item.toggled = false;
            } else {
                toggle = createElement({
                    "class": `toggle ${item.on ? " active" : ""}`,
                    "listeners": {
                        "click": function () {
                            this.classList.toggle("active");
                            if (this.classList.contains("active")) {
                                item.toggleOn();
                            } else {
                                item.toggleOff();
                            }
                        },
                    }
                });
            }

            if (item.id) {
                this.toggles[item.id] = new Toggle(toggle);
            }
            menuItem.append(toggle);
        }

        return menuItem;
    }

    updateSelectVals(sceneID) {
        if (this.selectedValuesDOM[sceneID]) {
            for (let elems of this.selectedValuesDOM[sceneID].elements) {
                elems.innerText = this.selectedValues[sceneID];
            }
        }
    }
    makeScene(config) {
        let scene = createElement({
            "class": "scene"
        });

        let sceneCon = createElement({
            "class": "sceneCon"
        });


        let openScene = this.scenes[config.id];
        if (openScene.element) {
            return;
        }

        if(config.heading){
            scene.append(this.makeItem(config.heading, true));
        }
        for (let item of config.items) {
            if (item.open) {
                let openScene = this.scenes[item.open];
                if (!openScene.element && openScene.data.selectableScene) {
                    this.makeScene(this.scenes[item.open].data);
                }
            }

            scene.append(this.makeItem(item, false, config.id));
        }

        sceneCon.append(scene);
        this.scenes[config.id].element = sceneCon;
        this.menuCon.append(sceneCon);

        return sceneCon;
    }

    addScene(config) {
        let sceneDIV = this.makeScene(config);
        this.menuCon.append(sceneDIV);
        config.element = sceneDIV;
        this.scenes[config.id] = config;
    }

    deleteScene(id) {
        if (id in this.scenes) {
            this.scenes[id].delete();
            delete this.scenes[id];
        }
    }

    deleteItem(item) {
        if (item.id in this.selections) {
            delete this.selections[item.id];
        }

        if (item.id in this.toggles) {
            delete this.toggles[item.id];
        }

        if (item.open) {
            let elem = this.selectedValuesDOM[item.open];
            if (elem) {
                let elements = elem.elements;
                let idx = elements.indexOf(item.valueDOM);
                if (idx > -1) {
                    elements.splice(idx, 1);
                }
            }
        }
    }

    deleteSceneFromHistory(val) {
        for (var i = this.history.length - 1; i >= 0; i--) {
            if (this.history[i] == val) {
                this.history.splice(i, 1);
            }
        }
    }


    getToggle(id) {
        if (id in this.toggles) {
            return this.toggles[id];
        }

        return null;
    }

    getScene(id) {
        if (id in this.scenes) {
            return this.scenes[id];
        }

        return null;
    }
}


/* Player Settings */
let skipOp = true;
let opStart = intro.start ? intro.start : 0;
let opEnd = intro.end ? intro.end : 0;

/* Subtitles */
let isAnimated = false;
let backgroundColor = "none";
let fontFamily = `"Kanit", sans-serif`;
let subtitleColor = "rgb(255, 255, 255)";
let removeSub = true;

/* Check if Menu is focused or not */
let isFocused = false;

const body = document.querySelector("body");
const player = document.querySelector(".player");

const allSources = [];
const subs = [];

function changeEpisode(provider, episodeId) {
    window.location.replace("/watch/" + id + "/" + provider + "/" + episodeId);
}

function toggleChapters() {
    const menu = document.querySelector(".chapters-panel-content");
    if (chapterMenu) {
        chapterMenu = false;
        menu.style.opacity = "0";
        menu.style.pointerEvents = "none";
    } else {
        chapterMenu = true;
        menu.style.opacity = "1";
        menu.style.pointerEvents = "all";
    }
}

async function loadPlayer() {
    /**
     * Get Sources and Subtitles
    */
    sources.map((element, index) => {
        allSources.push({
            name: element.quality,
            url: element.url,
        });
    })

    const promises = [];
    for (let i = 0; i < subtitles.length; i++) {
        const subtitleSrc = subtitles[i].url;
        const subtitleLabel = subtitles[i].lang;
        if (!subtitleLabel || !subtitleSrc) {
            continue;
        }

        const promise = new Promise((resolve, reject) => {
            fetch("/subtitles?url=" + (subtitleSrc)).then(async(data) => {
                const subtitle = await data.text();
                const parser = new WebVTTParser();
                const tree = parser.parse(subtitle, 'metadata');
                subs.push({
                    tree: tree,
                    name: subtitleLabel
                })
                resolve();
            }).catch((err) => {
                reject(err);
            })
        });
        promises.push(promise);
    }

    await Promise.all(promises);

    let chapters = "";
    
    episodes.map((element, index) => {
        const provider = element;
        let a = `<div class="chapter-item-header">${provider.provider}</div>`;
        provider.episodes.map((element, index) => {
            const episode = element;
            episode.title = episode.number ? episode.number + " - " + episode.title : episode.title;
            a += `
            <div class="chapter-item" onclick="changeEpisode('${provider.provider}', '${encrypt(episode.id)}')">
                <div class="chapter-item-title"><h1>${episode.title}</h1></div>
            </div>
            `;
        });
        chapters += `<div class="chapter-item-wrapper">` + a + `</div>`;
    })

    document.querySelector("media-player.videoplayer").src = allSources[allSources.length - 1].url ? allSources[allSources.length - 1].url : allSources[allSources.length - 1].file;    

    document.querySelector("div.media-header").innerHTML = `
    <div class="media-header-left ui">
        <div class="back-button" onclick="window.location.replace('/info/' + ${id})">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none" class="transition-all decoration-neutral-150 ease-linear"><path stroke="inherit" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3" d="M15 19.92L8.48 13.4c-.77-.77-.77-2.03 0-2.8L15 4.08"></path></svg>
        </div>
    </div>
    <div class="media-title ui">${info.title.english ? info.title.english : info.title.romaji}</div>
    <div class="media-header-right ui">
        <div class="chapters-panel">
            <div class="chapters-panel-button" onclick="toggleChapters()">
                <svg class="icon" width="20" height="18" viewBox="0 0 20 18" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M10.6061 17.1678C10.284 17.1678 10.0228 16.9066 10.0228 16.5844L10.0228 1.41778C10.0228 1.09561 10.284 0.834442 10.6061 0.834442L12.3561 0.834442C12.6783 0.834442 12.9395 1.09561 12.9395 1.41778L12.9395 16.5844C12.9395 16.9066 12.6783 17.1678 12.3561 17.1678H10.6061Z"></path><path d="M17.0228 17.1678C16.7006 17.1678 16.4395 16.9066 16.4395 16.5844L16.4395 1.41778C16.4395 1.09561 16.7006 0.834442 17.0228 0.834442L18.7728 0.834442C19.095 0.834442 19.3561 1.09561 19.3561 1.41778V16.5844C19.3561 16.9066 19.095 17.1678 18.7728 17.1678H17.0228Z"></path><path d="M0.796022 15.9481C0.71264 16.2593 0.897313 16.5791 1.2085 16.6625L2.89887 17.1154C3.21006 17.1988 3.52992 17.0141 3.61331 16.703L7.53873 2.05308C7.62211 1.74189 7.43744 1.42203 7.12625 1.33865L5.43588 0.885715C5.12469 0.802332 4.80483 0.987005 4.72144 1.29819L0.796022 15.9481Z"></path></svg>
            </div>
            <div class="chapters-panel-content">
                <div class="chapters-panel-content-header">
                    <div class="chapters-panel-content-header-title">Episodes</div>
                </div>
                <div class="chapters-panel-content-body">
                    ${chapters}
                </div>
            </div>
        </div>
    </div>
    `;

    setTimeout(() => {
        /* Menu-Related */
        const qualityItems = [];
        for (let i = 0; i < allSources.length; i++) {
            const selected = i === (allSources.length - 1) ? true : false;
            let canPush = true;

            for (let j = 0; j < qualityItems.length; j++) {
                if (qualityItems[j].text === allSources[i].name) {
                    canPush = false;
                }
            }

            if (canPush) {
                const item = {
                    text: allSources[i].name,
                    callback: () => changeQuality(allSources[i].url),
                    highlightable: true,
                    id: allSources[i].name,
                    selected: selected
                };
                qualityItems.push(item);
            }
        }
        menuCon = document.querySelector(".menuCon");
        DMenu = new dropDownMenu(
        [
            {
                "id": "initial",
                "items": [
                    {
                        "text": "Quality",
                        "iconID": "qualIcon",
                        "open": "quality",
                    },

                    {
                        "text": "Sources",
                        "iconID": "sourceIcon",
                        "open": "source"
                    },
                    {
                        "text": "Subtitles",
                        "iconID": "fillIcon",
                        "open": "subtitles"
                    },
                    {
                        "text": "Config",
                        "iconID": "configIcon",
                        "open": "config"
                    }
                ]
            },
            {
                "id": "quality",
                "selectableScene": true,
                "heading": {
                    "text": "Quality",
                },
                "items": qualityItems
            },

            {
                "id": "source",
                "selectableScene": true,
                "heading": {
                    "text": "Sources",
                },
                "items": [
                    {
                        "text": "HLS#sub",
                        "highlightable": true,
                        "selected": true,
                    },
                    {
                        "text": "HLS#dub",
                        "highlightable": true
                    }
                ]
            },

            {
                "id": "subtitles",
                "heading": {
                    "text": "Subtitles",
                },
                "items": [
                    {
                        "text": "Font Family",
                        "textBox": true,
                        "value": "Kanit",
                        "onInput": function (value) {
                            const font = value.target.value;
                            updateSubtitleFont(font);
                        }
                    },
                    {
                        "text": "Color Changer",
                        "textBox": true,
                        "value": "rgb(255, 255, 255)",
                        "onInput": function (value) {
                            const color = value.target.value;
                            updateSubtitleColor(color);
                        }
                    }
                ]
            },

            {
                "id": "config",
                "heading": {
                    "text": "Configuration",
                    "back": true
                },
                "items": [
                    {
                        "text": "Subtitles",
                        "iconID": "fillIcon",
                        "open": "subtitles"
                    },
                    {
                        "text": "Subtitle Background",
                        "toggle": true,
                        "toggleOn": () => updateSubtitleBackground("rgb(var(--black), 0.3)"),
                        "toggleOff": () => updateSubtitleBackground("none"),
                    },
                    {
                        "text": "Animate Subtitles",
                        "toggle": true,
                        "toggleOn": () => updateSubtitleAnimation(true),
                        "toggleOff": () => updateSubtitleAnimation(false),
                    },
                    {
                        "text": "Auto-Skip Intro",
                        "toggle": true,
                        "toggled": true,
                        "toggleOn": () => skipOp = true,
                        "toggleOff": () => skipOp = false,
                    }
                ]
            }
        ], menuCon);

        /* Subtitle Related */
        // The subtitle index. Checks all subtitles for which one is English.
        let currentSubtitle = 0;
        for (let i = 0; i < subs.length; i++) {
            if (subs[i].name.toLowerCase() === "english" || subs[i].name.toLowerCase() === "en" || subs[i].name.toLowerCase() === "en-us") {
                currentSubtitle = i;
            }
        }

        // The current subtitle.
        let sub = subs[currentSubtitle];
        if (!sub) {
            sub = subs[0];
        }

        // You need to fetch the video, then add event listeners.
        const provider = document.querySelector("media-player");
        const video = document.querySelector("media-player");

        // Media functions, such as seeking via arrow keys and playing/pausing
        function mediaKeys(event) {
            if (!isFocused) {
                // Playing/pausing via spacebar
                if (event.key === " ") {
                    if (provider.paused) {
                        provider.play();
                    } else {
                        provider.pause();
                    }
                } else if (event.key === "f") {
                    if (provider != null) {
                        if (provider.fullscreen) {
                            provider.exitFullscreen();
                        } else {
                            provider.requestFullscreen();
                        }
                    }
                } else if (event.key === "m") {
                    if (provider != null) {
                        if (video.muted) {
                            video.muted = false;
                        } else {
                            video.muted = true;
                        }
                    }
                } else if (event.key === "ArrowUp") {
                    //video.changeVolume(video.volume + 0.1)
                } else if (event.key === "ArrowDown") {
                    //video.changeVolume(video.volume - 0.1)
                } else if (event.key === "ArrowRight") {
                    video.currentTime = video.currentTime + 15;
                } else if (event.key === "ArrowLeft") {
                    video.currentTime = video.currentTime - 15;
                }
            }
        }
        document.addEventListener("keydown", mediaKeys);

        // Video timeupdate.
        video.addEventListener('time-update', (event) => {

            const time = video.currentTime;

            // Skip anime opening
            if (skipOp) {
                if (time > opStart && time < opEnd) {
                    console.log("Skipping OP");
                    // Seek to the end of the opening
                    video.currentTime = opEnd;
                }
            }

            if (!sub) {
                return;
            }

            const tree = sub.tree;
            const cues = tree.cues;

            let hasSub = false;

            // Get the subtitle container
            const subtitleDOM = document.querySelector(".subtitles");

            if (!subtitleDOM) {
                return;
            }
            // Add styles based on the config
            subtitleDOM.style = `background-color: ${backgroundColor};font-family: "${fontFamily}";opacity:1;`;
            // Loop through all subtitle cues
            for (let i = 0; i < cues.length; i++) {
                const cue = cues[i];
                const startTime = cue.startTime;
                const endTime = cue.endTime;
                const text = cue.text;

                const alignment = cue.alignment;
                
                // If the time is between the start and end time, then show the subtitle.
                if (time >= startTime && time <= endTime) {
                    hasSub = true;
                    subtitleDOM.innerHTML = "";

                    // Parsing \n
                    if (text.includes("\n")) {
                        const lines = text.split("\n");
                        subtitleDOM.style = `background-color: ${backgroundColor};font-family: "${fontFamily}";opacity:1;line-height:10px`;
                        
                        let stringedText = "";
                        for (let i = 0; i < lines.length; i++) {
                            const p = document.createElement("p");
                            // line-height will be 10px if there are multiple breaks
                            p.style = `color: ${subtitleColor};text-align:${alignment};line-height:10px;font-family:${fontFamily};`;
                            p.innerHTML = lines[i];
                            stringedText += p.outerHTML;
                        }
                        subtitleDOM.innerHTML = stringedText;
                    } else {
                        const p = document.createElement("p");
                        p.style = `color: ${subtitleColor};text-align:${alignment};line-height:0;font-family:${fontFamily};`;
                        p.innerHTML = text;
                        subtitleDOM.innerHTML = p.outerHTML;
                    }
                }
            }

            if (!hasSub && removeSub) {
                if (!isAnimated) {
                    subtitleDOM.innerHTML = "";
                } else {
                    // Basic opacity transition
                    subtitleDOM.style = `background-color: ${backgroundColor};font-family: "${fontFamily}";opacity: 0;`;
                }
            }
        });
    }, 200);
}

// Settings Menu
function openSettings() {
    console.log("Opening settings menu.");

    if (!isOpen) {
        if (!temp) {
            DMenu.open("initial");
            temp = true;
        } else {
            DMenu.openMenu();
        }
        isOpen = !isOpen;
    } else {
        DMenu.closeMenu();
        isOpen = !isOpen;
    }
}

function changeQuality(url) {
    // Change quality
    if (url.includes("master.m3u8") && !url.endsWith("master.m3u8")) {
        url = url.replace("master.m3u8", "")
    }
    console.log("Changing quality to " + url)
    const video = document.querySelector("media-player");

    const currentTime = video.currentTime;
    video.src = url;
    video.currentTime = currentTime;

    setTimeout(() => {
        video.play();
    }, 1000);
}

function updateSubtitleBackground(color) {
    backgroundColor = color;
}

function updateSubtitleAnimation(checked) {
    isAnimated = checked;
}

function updateSubtitleFont(font) {
    fontFamily = `"${font}", sans-serif`;
}

function updateSubtitleColor(color) {
    if (!color.startsWith("rgb") && !color.startsWith("hls")) {
        color = `"${color}"`;
    }
    subtitleColor = color;
}
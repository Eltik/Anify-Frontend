/* Menu */
// Credit to Enimax
let menuCon;
let isOpen = false;
let temp = false;

let DMenu;

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

/**
 * Get libraries
*/
const vidStackScript = document.createElement("script");
vidStackScript.src = "https://cdn.jsdelivr.net/npm/@vidstack/player@next/cdn/bundle.js";
vidStackScript.type = "module";

const vdsAspectRatio = document.createElement("script");
vdsAspectRatio.src = "https://cdn.jsdelivr.net/npm/@vidstack/player@next/cdn/define/vds-aspect-ratio.js";
vdsAspectRatio.type = "module";

const vdsHLS = document.createElement("script");
vdsHLS.src = "https://cdn.jsdelivr.net/npm/@vidstack/player@next/cdn/define/vds-hls.js";
vdsHLS.type = "module";

const vdsPlay = document.createElement("script");
vdsPlay.src = "https://cdn.jsdelivr.net/npm/@vidstack/player@next/cdn/define/vds-play-button.js";
vdsPlay.type = "module";

const vdsMute = document.createElement("script");
vdsMute.src = "https://cdn.jsdelivr.net/npm/@vidstack/player@next/cdn/define/vds-mute-button.js";
vdsMute.type = "module";

const vdsFullScreen = document.createElement("script");
vdsFullScreen.src = "https://cdn.jsdelivr.net/npm/@vidstack/player@next/cdn/define/vds-fullscreen-button.js";
vdsFullScreen.type = "module";

const vdsSlider = document.createElement("script");
vdsSlider.src = "https://cdn.jsdelivr.net/npm/@vidstack/player@next/cdn/define/vds-slider-value-text.js";
vdsSlider.type = "module";

const vdsGesture = document.createElement("script");
vdsGesture.src = "https://cdn.jsdelivr.net/npm/@vidstack/player@next/cdn/define/vds-gesture.js";
vdsGesture.type = "module";

const vdsToggle = document.createElement("script");
vdsToggle.src = "https://cdn.jsdelivr.net/npm/@vidstack/player@next/cdn/define/vds-toggle-button.js";
vdsToggle.type = "module";

const webVttParser = document.createElement("script");
webVttParser.src = "https://w3c.github.io/webvtt.js/parser.js";

body.append(vidStackScript);
body.append(vdsAspectRatio);
body.append(vdsHLS);
body.append(vdsPlay);
body.append(vdsMute);
body.append(vdsFullScreen);
body.append(vdsSlider);
body.append(vdsGesture);
body.append(vdsToggle);
body.append(webVttParser);

setTimeout(() => {
    setTimeout(async() => {
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

        const toAppend = `
        <vds-media class="videoplayer">
            <vds-aspect-ratio ratio="16/9">
                <vds-hls poster="${info.anilist.bannerImage ? info.anilist.bannerImage : "https://mcdn.wallpapersafari.com/medium/4/95/HSYiKZ.jpg"}">
                    <video class="main_video" preload="none" src="${allSources[allSources.length - 1].url ? allSources[allSources.length - 1].url : allSources[allSources.length - 1].file}"></video>
                    ${subtitles.map((element, index) => {
                        return `<track src="${"/subtitles?url=" + (element.url)}" label="${element.label}"></track>`;
                    })}
                </vds-hls>
            </vds-aspect-ratio>
            <vds-gesture type="click" action="toggle:paused"></vds-gesture>
            <vds-gesture type="click" repeat="1" priority="1" action="toggle:fullscreen"></vds-gesture>
            <vds-gesture class="seek-gesture left" type="click" repeat="1" priority="0" action="seek:-10"></vds-gesture>
            <vds-gesture class="seek-gesture right" type="click" repeat="1" priority="0" action="seek:10"></vds-gesture>
            <div class="media-buffering-container">
                <svg class="media-buffering-icon" fill="none" viewBox="0 0 120 120" aria-hidden="true">
                    <circle class="media-buffering-track" cx="60" cy="60" r="54" stroke="currentColor" stroke-width="8"></circle>
                    <circle class="media-buffering-track-fill" cx="60" cy="60" r="54" stroke="currentColor" stroke-width="10" pathLength="100"></circle>
                </svg>
            </div>
            <div class="media-controls-container">
                <div class="media-controls-group title"><h1></h1></div>
                <div class="media-controls-group"><!-- Middle --></div>
                <div class="media-controls-group controls">
                    <div class="left ui">
                        <vds-play-button>
                            <svg class="media-play-icon" aria-hidden="true" viewBox="0 0 384 512">
                                <path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                            </svg>

                            <svg class="media-pause-icon" aria-hidden="true" viewBox="0 0 320 512">
                                <path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"></path>
                            </svg>
                        </vds-play-button>
                        <vds-mute-button>
                            <svg class="media-mute-icon" aria-hidden="true" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M5.889 16H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L5.89 16zm14.525-4l3.536 3.536l-1.414 1.414L19 13.414l-3.536 3.536l-1.414-1.414L17.586 12L14.05 8.464l1.414-1.414L19 10.586l3.536-3.536l1.414 1.414L20.414 12z" />
                            </svg>
                            <svg class="media-unmute-icon" aria-hidden="true" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M5.889 16H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L5.89 16zm13.517 4.134l-1.416-1.416A8.978 8.978 0 0 0 21 12a8.982 8.982 0 0 0-3.304-6.968l1.42-1.42A10.976 10.976 0 0 1 23 12c0 3.223-1.386 6.122-3.594 8.134zm-3.543-3.543l-1.422-1.422A3.993 3.993 0 0 0 16 12c0-1.43-.75-2.685-1.88-3.392l1.439-1.439A5.991 5.991 0 0 1 18 12c0 1.842-.83 3.49-2.137 4.591z" />
                            </svg>
                        </vds-mute-button>
                    </div>
                    <div class="center">
                        <div class="subtitles">
                        </div>
                        <div class="slider ui">
                            <vds-time-slider>
                                <div class="slider-track"></div>
                                <div class="slider-track fill"></div>
                                <div class="slider-thumb-container">
                                    <div class="slider-thumb"></div>
                                </div>
                                <div class="media-time-container">
                                    <vds-slider-value-text type="pointer" format="time"></vds-slider-value-text>
                                </div>
                            </vds-time-slider>
                        </div>
                    </div>
                    <div class="right ui">
                        <vds-toggle-button aria-label="settings" classname="media-settings-button">
                            <svg class="media-settings-icon" viewBox="0 0 512 512" style="transform:rotate(0deg);transition:0.3s all ease" class="not-pressed" onclick="openSettings()">
                                <path fill="white" d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z"></path>
                            </svg>
                        </vds-toggle-button>
                        <div class="menu_wrapper">
                            <div class="menuCon"></div>
                        </div>
                        <vds-fullscreen-button>
                            <svg class="media-enter-fs-icon" aria-hidden="true" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z" />
                            </svg>
                            <svg class="media-exit-fs-icon" aria-hidden="true" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z" />
                            </svg>
                        </vds-fullscreen-button>
                    </div>
                </div>
            </div>
        </vds-media>
        `;
        player.innerHTML = toAppend;

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

            /* Subtitle Related */DMenu
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
            const provider = document.querySelector("vds-hls");
            const video = document.querySelector("vds-hls video");

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
                    }else if (event.key === "ArrowRight") {
                        //video.seek(video.currentTime + 15)
                        video.currentTime = video.currentTime + 15;
                    } else if (event.key === "ArrowLeft") {
                        //video.seek(video.currentTime - 15)
                        video.currentTime = video.currentTime - 15;
                    }
                }
            }
            document.addEventListener("keydown", mediaKeys);

            provider.addEventListener("vds-play", (event) => {
                const playRequestEvent = event.requestEvent;
                console.log("Now playing.");
            })

            // Video timeupdate.
            video.addEventListener('timeupdate', (event) => {
                if (!sub) {
                    return;
                }
                // Get the subtitle container
                const subtitleDOM = document.querySelector(".subtitles");

                // Add styles based on the config
                subtitleDOM.style = `background-color: ${backgroundColor};font-family: "${fontFamily}";opacity:1;`;

                const time = video.currentTime;

                const tree = sub.tree;
                const cues = tree.cues;

                let hasSub = false;

                // Skip anime opening
                if (skipOp) {
                    if (time > opStart && time < opEnd) {
                        // Seek to the end of the opening
                        video.currentTime = opEnd;
                    }
                }

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
    }, 1000);
}, 200);

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
    const video = document.querySelector("vds-hls video");

    const currentTime = video.currentTime;
    video.src = "https://cors.proxy.consumet.org/" + url;
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
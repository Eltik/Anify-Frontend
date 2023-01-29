//const api_server = "https://api.anify.tv";
const api_server = "http://localhost:3060";

var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64
            } else if (isNaN(i)) {
                a = 64
            }
            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
        }
        return t
    },
    decode: function(e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r)
            }
            if (a != 64) {
                t = t + String.fromCharCode(i)
            }
        }
        t = Base64._utf8_decode(t);
        return t
    },
    _utf8_encode: function(e) {
        e = e.replace(/\r\n/g, "\n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r)
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128)
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128)
            }
        }
        return t
    },
    _utf8_decode: function(e) {
        var t = "";
        var n = 0;
        var r = c1 = c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3
            }
        }
        return t
    }
}

let encryptionKey = "myheroacademia";

function loadSkeleton(selector, inCache) {
    if (inCache) {
        $(selector).scheletrone({
            inCache: true,
        });
    } else {
        $(selector).scheletrone();
    }
}

function unloadSkeleton(selector, subChild, unloadSelector) {
    if (unloadSelector) {
        $(selector).scheletrone("stopLoader");
    }
    if (subChild.length > 0) {
        const skeletonResults = document.querySelectorAll(subChild);
        for (let i = 0; i < skeletonResults.length; i++) {
            skeletonResults[i].remove();
        }
    }
}

async function fetchEncryptionKey(url) {
    return new Promise((resolve, reject) => {
        if (!url) {
            url = "";
        }
    
        if (encryptionKey.length > 0) {
            resolve(encryptionKey);
        }
        fetch(api_server + "/encrypt/" + url, { method: "GET", headers: { "Content-Type": "application/json" }}).then(async(res) => {
            const data = await res.json();
            encryptionKey = data.key;
            resolve({
                key: encryptionKey,
                result: data.result
            })
        }).catch((err) => {
            handleError(err);
            reject(err);
        });
    })
}

function encrypt(url) {
    if (!encryptionKey) {
        return null;
    }
    if (!url) {
        url = "";
    }
    const encodedString = Base64.encode(url);
    const encrypted = CryptoJS.AES.encrypt(encodedString, encryptionKey).toString();
    const b64 = CryptoJS.enc.Base64.parse(encrypted);
    return b64.toString(CryptoJS.enc.Hex);
}

function decrypt(url) {
    if (!encryptionKey) {
        return null;
    }
    const encrypted = CryptoJS.enc.Hex.parse(url);
    const b64 = encrypted.toString(CryptoJS.enc.Base64);
    const decrypted = CryptoJS.AES.decrypt(b64, encryptionKey);
    const decodedString = Base64.decode(decrypted.toString(CryptoJS.enc.Utf8));
    return decodedString;
}

function handleError(err) {
    console.error(err);
}

function timeSince(date, minified) {
    const seconds = Math.floor((new Date().valueOf() - date) / 1000);
    let interval = seconds / 31536000;

    if (minified) {
        if (interval > 1) {
            return Math.floor(interval) + "y";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + "m";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            interval = Math.floor(interval);
            return (interval > 1 ? interval + "d" : interval + "d");
        }
        interval = seconds / 3600;
        if (interval > 1) {
            interval = Math.floor(interval);
            return (interval > 1 ? interval + "h" : interval + "h");
        }
        interval = seconds / 60;
        if (interval > 1) {
            interval = Math.floor(interval);
            return (interval > 1 ? interval + "m" : interval + "m");
        }
        interval = Math.floor(interval);
        return (interval > 1 ? interval + "s" : interval + "s");
    } else {
        if (interval > 1) {
            return Math.floor(interval) + " years";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " months";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            interval = Math.floor(interval);
            return (interval > 1 ? interval + " days" : interval + " day");
        }
        interval = seconds / 3600;
        if (interval > 1) {
            interval = Math.floor(interval);
            return (interval > 1 ? interval + " hours" : interval + " hour");
        }
        interval = seconds / 60;
        if (interval > 1) {
            interval = Math.floor(interval);
            return (interval > 1 ? interval + " minutes" : interval + " minute");
        }
        interval = Math.floor(interval);
        return (interval > 1 ? interval + " seconds" : interval + " second");
    }
}

function displayNav() {
    const w = window.matchMedia("(max-width: 1000px)");
    if (w.matches) {
        const item = document.getElementById("navlogo");
        if (item) {
            item.remove();
        }
        const nav = document.getElementsByClassName("navlinks")[0];
        
        const navbar = document.getElementsByClassName("navbar")[0];
        navbar.classList.toggle("ani_change");
        if (nav.style.display === "none") {
            nav.classList.add("nav_animation");
            anime({
                targets: [".navlinks"],
                translateY: 100,
                opacity: 1,
                begin: function() {
                    nav.style.display = 'flex';
                    nav.style.opacity = "0";
                },
            });
        } else if (nav.style.display === "flex") {
            anime({
                targets: [".navlinks"],
                translateY: 0,
                opacity: 0,
                complete: function() {
                    nav.style.display = 'none';
                    nav.style.opacity = "0";
                },
            });
            nav.classList.remove("nav_animation");
        } else {
            anime({
                targets: [".navlinks"],
                translateY: 100,
                opacity: 1,
                begin: function() {
                    nav.style.display = 'flex';
                    nav.style.opacity = "0";
                },
            });
            nav.classList.add("nav_animation");
        }
    }
}

function parseAniListId(url) {
    url = new URL(url);
    if (url.origin === "https://anilist.co" && url.protocol === "https:" && url.pathname != null) {
        let path = url.pathname;
        path = path.split("/manga/")[1];
        if (!path) {
            return null;
        }
        if (path.includes("/")) {
            path = path.split("/")[0];
        }
        return path;
    } else {
        return null;
    }
}

async function getToken() {
    const req = await fetch("/token", { method: "GET", headers: { "Content-Type": "application/json" }});
    const data = await req.json();
    return data.token;
}

async function getLogin() {
    const token = await getToken();
    if (!token) {
        return null;
    }
    const req = await fetch(api_server + "/viewer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: token })});
    const data = await req.json();
    return data;
}

async function loadNav() {
    const nav = document.querySelector(".navlinks");
    const login = document.querySelector(".navlinks .login");
    
    const data = await getLogin();
    console.log(data);
    if (!data || data.error) {
        return;
    }
    const user = data.data.Viewer;
    const avatar = user.avatar.large;

    const toAppend = `
    <div class="dropdown">
        <div class="avatar" style="background-image: url(&quot;${avatar}&quot;);"></div>
        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="chevron-down" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="chevron svg-inline--fa fa-chevron-down fa-w-14 fa-fw"><path data-v-62eacfff="" fill="currentColor" d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z" class="avatar_icon"></path></svg>
        <div class="dropdown_content">
            <div class="dropdown_primary">
                <a href="/profile" class="primary-link"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="icon svg-inline--fa fa-user fa-w-14 fa-fw"><path data-v-04b245e6="" fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" class=""></path></svg> <div data-v-04b245e6="" class="label">Profile</div></a>
                <a href="/settings" class="primary-link"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="cog" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon svg-inline--fa fa-cog fa-w-16 fa-fw"><path data-v-04b245e6="" fill="currentColor" d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" class=""></path></svg> <div data-v-04b245e6="" class="label">Settings</div></a>
            </div>
            <div class="dropdown_footer">
                <a data-v-04b245e6="" class="secondary-link" href="/logout"><svg data-v-04b245e6="" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="sign-out-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-sign-out-alt fa-w-16 fa-fw"><path data-v-04b245e6="" fill="currentColor" d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z" class=""></path></svg>
                    Logout
                </a>
            </div>
        </div>
    </div>
    `;
    const dom = document.createElement("div");
    dom.classList.add("navtext");
    dom.classList.add("navavatar");
    dom.innerHTML = toAppend;

    dom.onclick = () => {
        const dropdown = document.querySelector(".dropdown_content");
        dropdown.classList.toggle("dropdown_show");
    };

    nav.appendChild(dom);

    login.remove();
}
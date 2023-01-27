const api_server = "https://api.anify.tv";

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
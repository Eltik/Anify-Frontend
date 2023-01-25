import styles from "./navigation.module.css";
import { NextComponentType } from "next";
import { FiHome, FiPlay } from "react-icons/fi";
import { BiBookAlt } from "react-icons/bi";
import { BsBookmarks } from "react-icons/bs";
import { SiDiscord } from "react-icons/si";
import { useState } from "react";
import anime from "animejs";

const Nav: NextComponentType = ({ index }) => {
    const [display, setDisplay] = useState(false);
    function displayNav() {
        const nav = document.querySelector("#" + styles.mobile);
        const button = document.querySelector("#nav_button");

        button.classList.toggle(styles.ani_change);
        if (display) {
            // Remove nav
            setDisplay(false);
            button.classList.remove(styles.animation);
            anime({
                targets: nav,
                opacity: [1, 0],
                translateY: [0, -50],
                duration: 500,
                easing: "easeInOutQuad",
                complete: function(anim) {
                    nav.style.display = "none";
                    nav.style.pointerEvents = "none";
                }
            })
        } else {
            // Show nav
            setDisplay(true);
            button.classList.add(styles.animation);
            anime({
                targets: nav,
                opacity: [0, 1],
                translateY: [-50, 0],
                duration: 500,
                easing: "easeInOutQuad",
                begin: function(anim) {
                    nav.style.display = "flex";
                    nav.style.pointerEvents = "all";
                }
            })
        }
    }

    return (
        <>
        <nav className={styles.navsticky}>
            <button type="button" id="nav_button" className={styles.navbutton} onClick={displayNav}>
                <div className={styles.bar1}></div>
                <div className={styles.bar2}></div>
                <div className={styles.bar3}></div>
            </button>
            <div id={styles.mobile}>
                <a href="/" className={styles.navtext} id={index === 0 ? styles.active : ""}><span className={styles.icon_text}><FiHome />Home</span></a>
                <a href="/anime" className={styles.navtext} id={index === 1 ? styles.active : ""}><span className={styles.icon_text}><FiPlay />Anime</span></a>
                <a href="/manga" className={styles.navtext} id={index === 2 ? styles.active : ""}><span className={styles.icon_text}><BiBookAlt />Manga</span></a>
                <a href="/novels" className={styles.navtext} id={index === 3 ? styles.active : ""}><span className={styles.icon_text}><BsBookmarks />Novels</span></a>
                <a href="/discord" className={styles.navtext} id={index === 4 ? styles.active : ""}><span className={styles.icon_text}><SiDiscord />Discord</span></a>
            </div>
            <div className={styles.navbar} id="nav_list">
                <div className={styles.anify_logo}>
                    <span className={styles.anify}>Anify</span>
                    <img className={styles.navlogo} src="/anify_logo.png"></img>
                </div>
                <div className={styles.navlinks}>
                    <a href="/" className={styles.navtext} id={index === 0 ? styles.active : ""}>Home</a>
                    <a href="/anime" className={styles.navtext} id={index === 1 ? styles.active : ""}>Anime</a>
                    <a href="/manga" className={styles.navtext} id={index === 2 ? styles.active : ""}>Manga</a>
                    <a href="/novels" className={styles.navtext} id={index === 3 ? styles.active : ""}>Novels</a>
                    <a href="/discord" className={styles.navtext} id={index === 4 ? styles.active : ""}>Discord</a>
                </div>
            </div>
        </nav>
        </>
    );
};
export default Nav;
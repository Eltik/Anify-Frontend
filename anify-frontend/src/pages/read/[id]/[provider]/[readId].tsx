import Head from "next/head";
import styles from "../../../read.module.css";
import * as CryptoJS from "crypto-js"
import Nav from "../../../../components/navigation";
import { useEffect, useState } from "react";
import ArrowKeysReact from "arrow-keys-react";
import Button from "../../../../components/button";
import anime from "animejs";
import { config } from "../../../../config";
import { AiOutlineClose } from "react-icons/ai";
import { IoIosOpen } from "react-icons/io";
import Select from "react-select";

export default function Read(props: any) {
    const [maxPages, setMaxPages] = useState(0);
    const [isLongStrip, setLongStrip] = useState(true);
    const [autoScroll, setAutoScroll] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    let encryptionKey = "myheroacademia";

    useEffect(() => {
        const allPages = document.getElementsByClassName(styles.page);
        setMaxPages(allPages.length);
    }, []);

    function encrypt(url:string) {
        if (!encryptionKey) {
            return null;
        }
        if (!url) {
            url = "";
        }
        const encodedString = Buffer.from(url, "utf-8").toString("base64");
        const encrypted = CryptoJS.AES.encrypt(encodedString, encryptionKey).toString();
        const b64 = CryptoJS.enc.Base64.parse(encrypted);
        return b64.toString(CryptoJS.enc.Hex);
    }

    function toggleScroll() {
        const toggleText = document.getElementById("toggle_scroll");
        if (autoScroll) {
            toggleText.textContent = "Auto-Scroll";
            setAutoScroll(false);
        } else {
            toggleText.textContent = "Manual Scroll";
            setAutoScroll(true);
        }
    }

    function togglePage() {
        const toggleText = document.getElementById("toggle_text");
        const allPages = document.getElementsByClassName(styles.page);

        if (isLongStrip) {
            toggleText.textContent = "Single Page";
            setLongStrip(false);
            updatePages(currentPage, false);
        } else {
            toggleText.textContent = "Long Strip";
            setLongStrip(true);
            for (let i = 0; i < allPages.length; i++) {
                const element = document.getElementsByClassName(styles.page)[i];
                if (element != undefined) {
                    element.classList.remove(styles.noDisplay);
                }
            }
            document.getElementById("page-" + currentPage)?.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
        }
    }

    function nextPage() {
        const allPages = document.getElementsByClassName(styles.page);
        if (currentPage < allPages.length - 1) {
            if (!isLongStrip) {
                setCurrentPage((state) => {
                    return updateState(state + 1);
                });
            }
        }
    }
    function previousPage() {
        if (currentPage > 0) {
            if (!isLongStrip) {
                setCurrentPage((state) => {
                    return updateState(state - 1);
                });
            }
        }
    }

    function updateState(state:any) {
        updatePages(state);
        if (autoScroll) {
            const element = document.querySelector("#page-" + state);
            element?.scrollIntoView({ behavior: "smooth" });
        }
        return state;
    }

    function updatePages(currentPage:any, isStrip?:boolean) {
        let isSinglePage = isLongStrip;
        if (isStrip != null && isStrip != undefined) {
            isSinglePage = isStrip;
        }
        const allPages = document.getElementsByClassName(styles.page);
        if (!isSinglePage) {
            for (let i = 0; i < allPages.length; i++) {
                const element = document.getElementsByClassName(styles.page)[i];
                if (element != undefined) {
                    if (i != currentPage) {
                        element.classList.add(styles.noDisplay);
                    } else {
                        element.classList.remove(styles.noDisplay);
                    }
                }
            }
        }
    }

    ArrowKeysReact.config({
        left: () => {
            previousPage();
        },
        right: () => {
            nextPage();
        }
    });

    function closePadding() {
        anime({
            targets: ["#" + styles.reader_button],
            opacity: "1",
        });
        anime({
            targets: ["." + styles.reader_header],
            translateX: "20vw",
            opacity: "0",
            easing: "spring(1, 80, 10, 0)",
            duration: 1500,
            begin: () => {
                document.querySelector("." + styles.reader_settings).style.pointerEvents = "none";
            }
        });
    }

    function openPadding() {
        anime({
            targets: ["#" + styles.reader_button],
            opacity: "0",
        });
        anime({
            targets: ["." + styles.reader_header],
            translateX: "0vw",
            opacity: "1",
            easing: "spring(1, 80, 10, 0)",
            duration: 1500,
            begin: () => {
                document.querySelector("." + styles.reader_settings).style.pointerEvents = "all";
            }
        });
    }

    function pageSize() {
        const value = document.querySelector("." + styles.slider)?.getAttribute("value");
        console.log(value);
    }

    function updatePage(data) {
        window.location.replace(`/read/${props.params.id}/${props.params.provider}/${encrypt(data.value)}`);
    }

    return (
    <>
        <Head>
            <title>{"Reading " + props.info.anilist.title.romaji}</title>
            <meta name="title" content={"Reading " + props.info.anilist.title.romaji}/>
            <meta name="description" content={props.info.anilist.description} />

            <meta property="og:type" content="website" />
            <meta property="og:url" content={`http://anify.tv/read/${props.params.id}/${props.params.provider}/${props.params.readId}`} />
            <meta property="og:title" content={"Reading " + props.info.anilist.title.romaji}/>
            <meta property="og:description" content={props.info.anilist.description}/>
            <meta property="og:image" content={props.info.anilist.coverImage.large}/>

            <meta property="twitter:card" content="summary_large_image"/>
            <meta property="twitter:url" content={`http://anify.tv/read/${props.params.id}/${props.params.provider}/${props.params.readId}`} />
            <meta property="twitter:title" content={"Reading " + props.info.anilist.title.romaji}/>
            <meta property="twitter:description" content={props.info.anilist.description}/>
            <meta property="twitter:image" content={props.info.anilist.coverImage.large}/>
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Nav index={2} />
        <main className={styles.main}>
            <div className={styles.pages_wrapper}>
                <div className={styles.pages} {...ArrowKeysReact.events} tabIndex={1}>
                    {props.pages ? props.pages.map((element:any, index:number) => {
                        return (
                            <img src={element.url} key={index} className={styles.page} loading={"lazy"} onClick={nextPage} id={"page-" + index} />
                        )
                    }) : ""}
                </div>
                <div className={styles.reader_settings}>
                    <Button id={styles.reader_button} style={{ fontSize: "1.6rem", padding: "0.5rem 1rem" }} onClick={openPadding}>
                        <IoIosOpen />
                    </Button>
                    <div className={styles.reader_header}>
                        <Button style={{ fontSize: "1.6rem", padding: "0.5rem 1rem" }} onClick={closePadding}>
                            <AiOutlineClose />
                        </Button>
                        {props.chapters ? props.chapters.map((element:any, index:number) => {
                            const provider = element;
                            const readingId = props.params.readId;
                            if (props.params.provider.toLowerCase() === provider.provider.toLowerCase()) {
                                const chapters = provider.chapters;
                                let chapter:any = null;
                                let chapterIndex:number = 0;
                                chapters.map((element:any, index:number) => {
                                    const url = element.url.split("https://")[1];
                                    if (element.id === readingId || url === readingId) {
                                        chapter = element;
                                        chapterIndex = index;
                                    }
                                })

                                const options = chapters.map((element:any, index:number) => {
                                    const id = element.id ? element.id : element.url;
                                    if (id === props.params.readId) {
                                        return {
                                            value: id,
                                            label: element.title,
                                            selected: true
                                        }
                                    }
                                    return {
                                        value: id,
                                        label: element.title
                                    }
                                });
                                return (
                                    <div className={styles.reader_header_info} key={index}>
                                        <h1>{provider.provider}</h1>
                                        <h3>{props.info.anilist.title.romaji}</h3>
                                        <Select options={options} className={styles.episode_select} styles={{
                                            container: (baseStyles, state) => ({
                                                ...baseStyles,
                                                color: "white",
                                                backgroundColor: "rgb(var(--blue-300);",
                                                border: "none"
                                            }),
                                            control: (baseStyles, state) => ({
                                                ...baseStyles,
                                                color: "white",
                                                backgroundColor: "rgb(var(--blue-300));",
                                                border: "none"
                                            }),
                                            input: (baseStyles, state) => ({
                                                ...baseStyles,
                                                color: "white",
                                                backgroundColor: "rgb(var(--blue-300));",
                                                border: "none"
                                            }),
                                            menu: (baseStyles, state) => ({
                                                ...baseStyles,
                                                color: "white",
                                                backgroundColor: "rgb(var(--blue-300));",
                                                border: "none",
                                            }),
                                            menuList: (baseStyles, state) => ({
                                                ...baseStyles,
                                                width: "100%",
                                                height: "100%",
                                            }),
                                            noOptionsMessage: (baseStyles, state) => ({
                                                ...baseStyles,
                                                color: "white",
                                            }),
                                            placeholder: (baseStyles, state) => ({
                                                ...baseStyles,
                                                color: "white",
                                            }),
                                            singleValue: (baseStyles, state) => ({
                                                ...baseStyles,
                                                color: "rgba(var(--grey-200))",
                                                position: "relative",
                                                overflow: "initial",
                                            }),
                                            valueContainer: (baseStyles, state) => ({
                                                ...baseStyles,
                                                color: "white"
                                            }),
                                            option: (baseStyles, state) => ({
                                                ...baseStyles,
                                                backgroundColor: "rgb(var(--blue-300));",
                                                color: "white",
                                                transition: "0.1s all",
                                                ":hover": {
                                                    backgroundColor: "rgb(var(--blue-200));"
                                                },
                                                ":active": {
                                                    color: "white",
                                                    backgroundColor: "rgb(var(--blue-200));"
                                                },
                                                lineHeight: "1.25rem",
                                                height: "100%"
                                            }),
                                            indicatorSeparator: (baseStyles, state) => ({
                                                ...baseStyles,
                                                display: "none"
                                            }),
                                            dropdownIndicator: (baseStyles, state) => ({
                                                ...baseStyles,
                                                backgroundColor: "rgb(var(--blue-300));",
                                                color: "white",
                                                transition: "0.1s all",
                                                ":hover": {
                                                    color: "rgba(255, 255, 255, 0.7)"
                                                },
                                                ":active": {
                                                    color: "rgba(255, 255, 255, 0.5)",
                                                }
                                            }),
                                        }} defaultValue={options[chapterIndex]} isSearchable={true} name="chapter_list" onChange={updatePage} />
                                    </div>
                                )
                            }
                        }) : ""}
                        <div className={styles.bottom}>
                            <Button key={"2"} id={"toggle_text"} onClick={togglePage}>Long Strip</Button>
                            <Button onClick={toggleScroll} id={"toggle_scroll"}>
                                Auto-Scroll
                            </Button>
                            <div className="slidecontainer">
                                <input type="range" min="1" max="100" defaultValue="50" className={styles.slider} onInput={pageSize} />
                            </div>
                            <p>{"Page: " + currentPage + " / " + (maxPages ? maxPages : "N/A")}</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </>
    );
}

export async function getServerSideProps(context: any) {
    const id = context.params.id;
    const provider = context.params.provider;
    let readId:any = decrypt(context.params.readId);

    if (readId.startsWith("https://") && provider === "Mangakakalot") {
        readId = readId.split("https://")[1];
    }

    const req = await fetch(`${config.api_server}/info`, { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" } });
    const data = await req.json();

    const pagesReq = await fetch(`${config.api_server}/pages`, { method: "POST", body: JSON.stringify({ id: id, provider: provider, readId: readId }), headers: { "Content-Type": "application/json" } });
    const pages = await pagesReq.json();

    const chaptersReq = await fetch(`${config.api_server}/chapters`, { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" } });
    const chapters = await chaptersReq.json();

    function decrypt(url:string) {
        const encrypted = CryptoJS.enc.Hex.parse(url);
        const b64 = encrypted.toString(CryptoJS.enc.Base64);
        const decrypted = CryptoJS.AES.decrypt(b64, "myheroacademia");
        const decodedString = Buffer.from(decrypted.toString(CryptoJS.enc.Utf8), "base64").toString("utf-8");
        return decodedString;
    }

    return {
        props: {
            params: {
                id: id,
                provider: provider,
                readId: readId,
            },
            info: data,
            pages: pages,
            chapters: chapters
        },
    };
}
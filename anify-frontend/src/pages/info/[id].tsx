import Head from "next/head";
import styles from "../../styles/info.module.css";
import Nav from "../../components/navigation";
import { parse } from 'node-html-parser';
import { useState } from "react";
import * as CryptoJS from "crypto-js"
import { config } from "../../config";
import Select from 'react-select';

export default function Info(props: any) {
    const [showMore, setShowMore] = useState(false);
    const [providerIndex, setProviderIndex] = useState(0);

    function timeSince(date:number, minified?:boolean) {
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

    let encryptionKey = "myheroacademia";

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

    const options = props.content.map((provider:Provider, index:number) => {
        return {
            value: index,
            label: provider.provider_data.title ? provider.provider + " - " + provider.provider_data.title : provider.provider + " - " + provider.provider_data.romaji
        }
    })

    function updateProviderIndex(data) {
        setProviderIndex(data.value);
    }

    return (
    <>
        <Head>
            <title>{props.data.anilist.title.romaji}</title>
            <meta name="title" content={props.data.anilist.title.romaji}/>
            <meta name="description" content={props.data.anilist.description} />

            <meta property="og:type" content="website" />
            <meta property="og:url" content={`http://anify.tv/info/${props.data.anilist.id}`} />
            <meta property="og:title" content={props.data.anilist.title.romaji}/>
            <meta property="og:description" content={props.data.anilist.description}/>
            <meta property="og:image" content={props.data.anilist.coverImage.large}/>

            <meta property="twitter:card" content="summary_large_image"/>
            <meta property="twitter:url" content={`http://anify.tv/info/${props.data.anilist.id}`} />
            <meta property="twitter:title" content={props.data.anilist.title.romaji}/>
            <meta property="twitter:description" content={props.data.anilist.description}/>
            <meta property="twitter:image" content={props.data.anilist.coverImage.large}/>
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Nav index={props.data.anilist.type === "ANIME" ? 1 : 2} />
        <main className={styles.main}>
            <div className={styles.info_wrapper}>
                <div className={styles.gradient}>
                </div>
                <div className={styles.banner}>
                    <img src={props.data.anilist.bannerImage ? props.data.anilist.bannerImage : "https://cdn.wallpapersafari.com/41/44/6Q9Nwh.jpg"} className={styles.bannerImage} />
                </div>
                <div className={styles.stats}>
                    <div className={styles.info}>
                        <img src={props.data.anilist.coverImage.large} alt={props.data.anilist.title.romaji} width={300} height={450} className={styles.coverImage} />
                        <div className={styles.info_text}>
                            <div className={styles.titles}>
                                <h2 className={styles.info_title}>{props.data.anilist.title.romaji}</h2>
                                <h2>{props.data.anilist.title.native}</h2>
                                <h3>{props.data.anilist.title.english}</h3>
                            </div>
                            <div className={styles.description} onClick={() => setShowMore(!showMore)}>
                                <p>{showMore ? parse(props.data.anilist.description).textContent : (parse(props.data.anilist.description).textContent.length > 400 ? parse(props.data.anilist.description).textContent.substring(0, 400) + "..." : parse(props.data.anilist.description).textContent)}</p>
                                <span className={styles.show_more}>{showMore ? "Show Less" : "Show More"}</span>
                            </div>
                            {props.content.length > 0 ? (
                                <div className={styles.episode_list}>
                                    {props.content.length > 1 ? (
                                        <div className={styles.episode_list_header}>
                                            <h2>{props.data.anilist.type === "ANIME" ? "Episodes" : "Chapters"}</h2>
                                            <h1>·</h1>
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
                                                    height: "100%",
                                                    position: "relative",
                                                    top: "50%",
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
                                            }} defaultValue={options[0]} isSearchable={true} name="chapter_list" onChange={updateProviderIndex} />
                                        </div>
                                    ) : (
                                        <div className={styles.episode_list_header}>
                                            <h2>{props.data.anilist.type === "ANIME" ? "Episodes" : "Chapters"}</h2>
                                        </div>
                                    )}
                                    <div className={styles.episodes}>
                                        {props.data.anilist.type === "ANIME" ? props.content[providerIndex]?.episodes.map((episode:Episode, index:number) => (
                                            <a href={`/watch/${props.data.id}/${props.content[providerIndex].provider}/${encrypt(episode.id ? episode.id : episode.url)}`}>
                                                <div key={episode.id} className={styles.episode}>
                                                    <div className={styles.episode_thumb}>
                                                        {episode.number ? episode.number : index + 1}
                                                    </div>
                                                    <p>{episode.title}</p>
                                                </div>
                                            </a>
                                        )) : props.content[providerIndex]?.chapters.map((episode:Episode, index:number) => (
                                            <a href={`/read/${props.data.id}/${props.content[providerIndex].provider}/${encrypt(episode.id ? episode.id : episode.url)}`}>
                                                <div key={episode.id} className={styles.episode}>
                                                    <div className={styles.episode_thumb}>
                                                        {episode.number ? episode.number : index + 1}
                                                    </div>
                                                    <p>{episode.title}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ) : ""}
                        </div>
                    </div>
                    <div className={styles.data}>
                        <div className={styles.genres}>
                            {props.data.anilist.genres.map((genre: any) => (
                                <span key={genre} className={styles.genre}>{genre}</span>
                            ))}
                        </div>
                        <div className={styles.stats_data}>
                            {props.data.anilist.type === "ANIME" ? (
                                <div className={styles.stats_data_item}>
                                    <h3>Next Airing:</h3>
                                    <p>{props.data.anilist.nextAiringEpisode ? timeSince(new Date(props.data.anilist.nextAiringEpisode.airingAt ? props.data.anilist.nextAiringEpisode.airingAt * 1000 : 0).getTime()) : "N/A"}</p>
                                </div>
                            ) : ""}
                            <div className={styles.stats_data_item}>
                                <h3>Score:</h3>
                                <p>{props.data.anilist.averageScore ? props.data.anilist.averageScore : "0%"}</p>
                            </div>
                            {props.data.anilist.type === "ANIME" ? (
                                <div className={styles.stats_data_item}>
                                    <h3>Episodes:</h3>
                                    <p>{props.data.anilist.episodes ? props.data.anilist.episodes : "0"}</p>
                                </div>
                            ) : (
                                <div className={styles.stats_data_item}>
                                    <h3>Chapters:</h3>
                                    <p>{props.data.anilist.chapters ? props.data.anilist.chapters : "0"}</p>
                                </div>
                            )}
                            {props.data.anilist.type === "ANIME" ? (
                                <div className={styles.stats_data_item}>
                                    <h3>Duration:</h3>
                                    <p>{props.data.anilist.duration ? props.data.anilist.duration : "0"}</p>
                                </div>
                            ) : ""}
                            <div className={styles.stats_data_item}>
                                <h3>Format:</h3>
                                <p>{props.data.anilist.format ? props.data.anilist.format : "N/A"}</p>
                            </div>
                            <div className={styles.stats_data_item}>
                                <h3>Status:</h3>
                                <p>{props.data.anilist.status ? props.data.anilist.status : "NOT_YET_RELEASED"}</p>
                            </div>
                            <div className={styles.stats_data_item}>
                                <h3>Season:</h3>
                                <p>{props.data.anilist.season && props.data.anilist.seasonYear ? props.data.anilist.season + " - " + props.data.anilist.seasonYear : "N/A"}</p>
                            </div>
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

    const req = await fetch(`${config.api_server}/info`, { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" } });
    const data = await req.json();

    let content = null;

    if (data.anilist.type === "ANIME") {
        const contentReq = await fetch(`${config.api_server}/episodes`, { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" }});
        const json = await contentReq.json();
        content = json;
    } else if (data.anilist.type === "MANGA") {
        const contentReq = await fetch(`${config.api_server}/chapters`, { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" }});
        const json = await contentReq.json();
        content = json;
    }

    return {
        props: {
            data,
            content
        },
    };
}

interface Provider {
    provider: string;
    provider_data: {
        id: string;
        title: string;
        romaji: string;
        native: string;
        img: string;
    };
    episodes: [Episode];
}

interface Episode {
    id: string;
    title: string;
    url: string;
    number?: number;
}
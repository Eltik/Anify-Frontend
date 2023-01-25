import styles from "./anime.module.css";
import { type NextPage } from "next";
import Head from "next/head";
import Nav from "../components/navigation";
import { config } from "../config";
import { useState } from "react";
import { parse } from 'node-html-parser';
import Search from "../components/search";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import Swiper from 'swiper';
import 'swiper/css';

const Anime: NextPage = ({ data, season }) => {
    const [requesting, setRequesting] = useState(false);
    const [searchData, setSearch] = useState(null);

    let timeout:any = null;

    setTimeout(() => {
        const swiper = new Swiper('.swiper', {
            speed: 400,
            spaceBetween: 100,
            slidesPerView: 1,
            centeredSlides: true,
            loop: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
        });
    }, 100)

    function search(e:any) {
        const input:string = e.target.value;
        setRequesting(true);

        clearTimeout(timeout);

        timeout = setTimeout(function () {
            if (input != undefined && input.length > 0) {
                searchRequest(input);
            } else {
                setRequesting(false);
                setSearch(null);
            }
        }, 1000);
    }

    function searchRequest(query:string) {
        setRequesting(true);
        const args = {
            query: query
        };
        fetch(config.api_server + "/search/anime", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }}).then(async(res) => {
            let data = await res.json();
            setSearch(data);
            setRequesting(false);
        }).catch((err) => {
            console.error(err);
        })
    }
    return (
    <>
        <Head>
            <title>Anify - Anime</title>
            <meta name="title" content="Anify - Anime"/>
            <meta name="description" content="Watch anime at HD quality with customizable subtitles." />

            <meta property="og:type" content="website" />
            <meta property="og:url" content={`http://anify.tv/anime`} />
            <meta property="og:title" content="Anify - Anime" />
            <meta property="og:description" content="Watch anime at HD quality with customizable subtitles." />

            <meta property="twitter:card" content="summary_large_image"/>
            <meta property="twitter:url" content={`http://anify.tv/anime`} />
            <meta property="twitter:title" content="Anify - Anime" />
            <meta property="twitter:description" content="Watch anime at HD quality with customizable subtitles."/>
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Nav index={1} />
        <main className={styles.main}>
            <div className="swiper" style={{
                    maxWidth: "95%",
                }}>
                <div className="swiper-wrapper">
                    {data.map((item:any, i:number) => (
                        <div className={`swiper-slide`}>
                            <div className={`${styles.trending_item}, ${styles.slide}`}>
                                <a href={`/info/${item.anilist.id}`} className={styles.slide_link}>
                                    <img className={styles.slide_banner} src={item.anilist.bannerImage
                                        ? item.anilist.bannerImage
                                        : "https://cdn.wallpapersafari.com/41/44/6Q9Nwh.jpg"
                                    } />
                                    <div className={styles.slide_info}>
                                        <h1>{item.anilist.title.romaji}</h1>
                                        <div className={styles.slide_info_stats}>
                                            <p>{item.anilist.averageScore ? item.anilist.averageScore : "0"}%</p>
                                            <p>·</p>
                                            <p>{item.anilist.episodes ? item.anilist.episodes : "0"} Episodes</p>
                                            <p>·</p>
                                            <p>{item.anilist.favourites ? item.anilist.favourites : "0"} favorites</p>
                                        </div>
                                        <p>{item.anilist.description ? parse(item.anilist.description).textContent : ""}</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="swiper-pagination"></div>
                <div className="swiper-button-prev"></div>
                <div className="swiper-button-next"></div>
            </div>
            <div className={styles.bottom}>
                <div className={styles.search_wrapper}>
                        <Search text={"Search for anime..."} onKeyUp={search} />
                    </div>
                    {requesting ? (
                        <div className={styles.loading}>
                            <Skeleton height={200} baseColor={"rgba(65, 85, 103, 0.5)"} highlightColor={"rgba(70, 90, 115, 0.7)"} />
                            <Skeleton height={200} baseColor={"rgba(65, 85, 103, 0.5)"} highlightColor={"rgba(70, 90, 115, 0.7)"} />
                            <Skeleton height={200} baseColor={"rgba(65, 85, 103, 0.5)"} highlightColor={"rgba(70, 90, 115, 0.7)"} />
                            <Skeleton height={200} baseColor={"rgba(65, 85, 103, 0.5)"} highlightColor={"rgba(70, 90, 115, 0.7)"} />
                        </div>
                    ) : ""}
                    {!requesting && searchData && searchData.length > 0 ? (
                        <div className={styles.search_results}>
                            {searchData.map((item:any, i:number) => (
                                <div className={styles.search_result}>
                                    <a href={`/info/${item.anilist.id}`} className={styles.search_result_link}>
                                        <img className={styles.search_result_cover} src={item.anilist.coverImage.extraLarge} />
                                        <div className={styles.gradient}></div>
                                        <div className={styles.search_result_info}>
                                            <h1>{item.anilist.title.romaji}</h1>
                                            <div className={styles.search_result_info_stats}>
                                                <p className={styles.seasonal_info_year}>{item.anilist.seasonYear ? item.anilist.seasonYear : "?"}</p>
                                                <div className={styles.genres}>
                                                    {item.anilist.genres.slice(0, 2).map((genre:any, i:number) => (
                                                        <div className={styles.genre}>{genre}</div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : ""}
                    {!requesting && (!searchData || searchData.length === 0) ? (
                        <div className={styles.seasonal_wrapper}>
                            <h2>This Season</h2>
                            <div className={styles.seasonal}>
                                {season.map((item:any, i:number) => (
                                    <div className={styles.seasonal_item}>
                                        <a href={`/info/${item.anilist.id}`} className={styles.seasonal_link}>
                                            <img className={styles.seasonal_banner} src={item.anilist.bannerImage ? item.anilist.bannerImage : "https://cdn.wallpapersafari.com/41/44/6Q9Nwh.jpg"} />
                                            <div className={styles.gradient}></div>
                                            <div className={styles.seasonal_info}>
                                                <h1>{item.anilist.title.english ? item.anilist.title.english : item.anilist.title.romaji}</h1>
                                                <div className={styles.seasonal_info_stats}>
                                                    <p className={styles.seasonal_info_year}>{item.anilist.seasonYear ? item.anilist.seasonYear : "?"}</p>
                                                    <div className={styles.genres}>
                                                        {item.anilist.genres.slice(0, 3).map((genre:any, i:number) => (
                                                            <div className={styles.genre}>{genre}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : ""}
            </div>
        </main>
    </>
    );
};

export async function getServerSideProps({ req, res }) {
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
    )
    const trending = await fetchTrending();
    const season = await fetchSeason();
    return {
        props: {
            data: trending,
            season: season
        }
    }
}

async function fetchTrending() {
    const args = {
        season: "trending"
    };
    const req = await fetch(config.api_server + "/seasonal/anime", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }});
    const data = await req.json();
    return data;
}

async function fetchSeason() {
    const args = {
        season: "season"
    };
    const req = await fetch(config.api_server + "/seasonal/anime", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }});
    const data = await req.json();
    return data;
}

export default Anime;
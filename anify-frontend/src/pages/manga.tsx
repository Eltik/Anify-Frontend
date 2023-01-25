import styles from "../styles/manga.module.css";
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

const Manga: NextPage = ({ data, season }) => {
    const [requesting, setRequesting] = useState(false);
    const [searchData, setSearch] = useState(null);

    let timeout:any = null;

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
        fetch(config.api_server + "/search/manga", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }}).then(async(res) => {
            let data = await res.json();
            setSearch(data);
            setRequesting(false);
        }).catch((err) => {
            console.error(err);
        })
    }
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

    return (
    <>
        <Head>
            <title>Anify - Manga</title>
            <meta name="title" content="Anify - Manga"/>
            <meta name="description" content="Browse an extensive library of manga to read." />

            <meta property="og:type" content="website" />
            <meta property="og:url" content={`http://anify.tv/manga`} />
            <meta property="og:title" content="Anify - Manga" />
            <meta property="og:description" content="Browse an extensive library of manga to read." />

            <meta property="twitter:card" content="summary_large_image"/>
            <meta property="twitter:url" content={`http://anify.tv/manga`} />
            <meta property="twitter:title" content="Anify - Manga" />
            <meta property="twitter:description" content="Browse an extensive library of manga to read."/>
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Nav index={2} />
        <main className={styles.main}>
            <div className="swiper">
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
                                            <p>{item.anilist.chapters ? item.anilist.chapters : "0"} Chapters</p>
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
                <div className={styles.seasonal}>
                    <h1>Popular Manga</h1>
                    <div className={styles.seasonal_list}>
                        {season.map((item:any) => (
                            <a href={`/info/${item.anilist.id}`} className={styles.seasonal_item}>
                                <img className={styles.seasonal_item_banner} src={item.anilist.bannerImage ? item.anilist.bannerImage : "https://cdn.wallpapersafari.com/41/44/6Q9Nwh.jpg"} />
                                <div className={styles.seasonal_item_info}>
                                    <h1>{item.anilist.title.romaji}</h1>
                                    <div className={styles.seasonal_item_info_stats}>
                                        <p>{item.anilist.averageScore ? item.anilist.averageScore : "0"}%</p>
                                        <p>·</p>
                                        <p>{item.anilist.chapters ? item.anilist.chapters : "0"} Chapters</p>
                                        <p>·</p>
                                        <p>{item.anilist.favourites ? item.anilist.favourites : "0"} favorites</p>
                                    </div>
                                    <p>{item.anilist.description ? parse(item.anilist.description).textContent : ""}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
                <div className={styles.trending}>
                    <div className={styles.search_wrapper}>
                        <Search text={"Search for manga..."} onKeyUp={search} />
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
                            <div className={styles.first_row}>
                                {searchData.map((item:any) => (
                                    <div className={styles.trending_item_wrapper}>
                                        <a href={`/info/${item.anilist.id}`} className={styles.trending_item}>
                                            <img className={styles.trending_item_cover} src={item.anilist.coverImage.extraLarge ? item.anilist.coverImage.extraLarge : "/icon_logo.png"} />
                                            <div className={styles.trending_item_info}>
                                                <h1>{item.anilist.title.romaji}</h1>
                                                <div className={styles.trending_item_info_stats}>
                                                    <p>{item.anilist.averageScore ? item.anilist.averageScore : "0"}%</p>
                                                    <p>·</p>
                                                    <p>{item.anilist.chapters ? item.anilist.chapters : "0"} Chapters</p>
                                                    <p>·</p>
                                                    <p>{item.anilist.favourites ? item.anilist.favourites : "0"} favorites</p>
                                                </div>
                                                <p>{item.anilist.description ? parse(item.anilist.description).textContent : ""}</p>
                                            </div>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                    <div className={styles.trending_list}>
                        <div className={styles.first_row}>
                            {data.map((item:any, i:number) => (
                                <div className={styles.trending_item_wrapper}>
                                    <a href={`/info/${item.anilist.id}`} className={styles.trending_item}>
                                        <img className={styles.trending_item_cover} src={item.anilist.coverImage.extraLarge ? item.anilist.coverImage.extraLarge : "/icon_logo.png"} />
                                        <div className={styles.trending_item_info}>
                                            <h1>{item.anilist.title.romaji}</h1>
                                            <div className={styles.trending_item_info_stats}>
                                                <p>{item.anilist.averageScore ? item.anilist.averageScore : "0"}%</p>
                                                <p>·</p>
                                                <p>{item.anilist.chapters ? item.anilist.chapters : "0"} Chapters</p>
                                                <p>·</p>
                                                <p>{item.anilist.favourites ? item.anilist.favourites : "0"} favorites</p>
                                            </div>
                                            <p>{item.anilist.description ? parse(item.anilist.description).textContent : ""}</p>
                                        </div>
                                    </a>
                                </div>                                
                            ))}

                            <a href={`/info/${data[1].anilist.id}`} className={styles.trending_item_long}>
                                <img className={styles.trending_item_banner} src={data[1].anilist.bannerImage ? data[1].anilist.bannerImage : "https://cdn.wallpapersafari.com/41/44/6Q9Nwh.jpg"} />
                                <div className={styles.trending_item_info}>
                                    <h1>{data[1].anilist.title.romaji}</h1>
                                    <div className={styles.trending_item_info_stats}>
                                        <p>{data[1].anilist.averageScore ? data[1].anilist.averageScore : "0"}%</p>
                                        <p>·</p>
                                        <p>{data[1].anilist.chapters ? data[1].anilist.chapters : "0"} Chapters</p>
                                        <p>·</p>
                                        <p>{data[1].anilist.favourites ? data[1].anilist.favourites : "0"} favorites</p>
                                    </div>
                                    <p>{data[1].anilist.description ? parse(data[1].anilist.description).textContent : ""}</p>
                                </div>
                            </a>
                        </div>
                    </div>
                    )}
                </div>
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
    const req = await fetch(config.api_server + "/seasonal/manga", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }});
    const data = await req.json();
    return data;
}

async function fetchSeason() {
    const args = {
        season: "popular"
    };
    const req = await fetch(config.api_server + "/seasonal/manga", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }});
    const data = await req.json();
    return data;
}

export default Manga;
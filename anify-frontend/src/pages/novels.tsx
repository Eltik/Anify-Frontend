import styles from "../styles/novels.module.css";
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

const Novels: NextPage = () => {
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
        fetch(config.api_server + "/search/novels", { method: "POST", body: JSON.stringify(args), headers: { "Content-Type": "application/json" }}).then(async(res) => {
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
            <title>Anify - Novels</title>
            <meta name="title" content="Anify - Novels"/>
            <meta name="description" content="Search for every officially translated light novel." />

            <meta property="og:type" content="website" />
            <meta property="og:url" content={`http://anify.tv/novels`} />
            <meta property="og:title" content="Anify - Novels" />
            <meta property="og:description" content="Search for every officially translated light novel." />

            <meta property="twitter:card" content="summary_large_image"/>
            <meta property="twitter:url" content={`http://anify.tv/novels`} />
            <meta property="twitter:title" content="Anify - Novels" />
            <meta property="twitter:description" content="Search for every officially translated light novel."/>
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Nav index={3} />
        <main className={styles.main}>
            <div className="swiper">
                <div className="swiper-wrapper">
                    <div className={`swiper-slide`}>
                        <div className={`${styles.trending_item}, ${styles.slide}`}>
                            <a href={`#`} className={styles.slide_link}>
                                <img className={styles.slide_banner} src={"https://cdn.wallpapersafari.com/41/44/6Q9Nwh.jpg"} />
                                <div className={styles.slide_info}>
                                    <h1>{"test"}</h1>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="swiper-pagination"></div>
                <div className="swiper-button-prev"></div>
                <div className="swiper-button-next"></div>
            </div>
            <div className={styles.bottom}>
                <div className={styles.search_wrapper}>
                        <Search text={"Search for novels..."} onKeyUp={search} />
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
                    ""
                ) : (
                ""
                )}
            </div>
        </main>
    </>
    );
};

export default Novels;
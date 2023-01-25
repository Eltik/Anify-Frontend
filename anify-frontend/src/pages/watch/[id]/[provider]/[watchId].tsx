import Head from "next/head";
import styles from "../../../watch.module.css";
import * as CryptoJS from "crypto-js"
import { config } from "../../../../config";
import { useEffect, useRef, useState } from "react";
import WebVTTParser from "webvtt-parser";
import { TbArrowBackUp } from "react-icons/tb";

import { type MediaElement } from 'vidstack';
import 'vidstack/styles/base.css';
import 'vidstack/styles/ui/buttons.css';
import 'vidstack/styles/ui/sliders.css';

import { AspectRatio, FullscreenButton, HLSVideo, Media, MuteButton, PlayButton, SliderValueText, TimeSlider, Video } from '@vidstack/react';

export default function Watch(props: any) {
    const [currentCue, setCurrentCue] = useState(0);

    const currentTime = 0; // Need to have it be the current time of the video
    const curSubtitle = 0;

    const media = useRef<MediaElement>(null);

    useEffect(() => {
      media.current!.startLoading();
    }, []);
  
    async function timeUpdate(event) {
        console.log(currentTime);

        if (props.trees[curSubtitle]?.cues[currentCue].startTime <= currentTime) {
            if (props.tree.cues[currentCue].endTime < currentTime) {
                setCurrentCue(currentCue + 1);
                return;
            }
        } else if (props.trees[curSubtitle]?.cues[currentCue].startTime > currentTime) {
            setCurrentCue(currentCue - 1 >= 0 ? currentCue - 1 : 0);
            return;
        }
    }
    return (
    <>
        <Head>
            <title>{"Watching " + props.info.anilist.title.romaji}</title>
            <meta name="title" content={"Watching " + props.info.anilist.title.romaji}/>
            <meta name="description" content={props.info.anilist.description} />

            <meta property="og:type" content="website" />
            <meta property="og:url" content={`http://anify.tv/watch/${props.params.id}/${props.params.provider}/${props.params.watchId}`} />
            <meta property="og:title" content={"Watching " + props.info.anilist.title.romaji}/>
            <meta property="og:description" content={props.info.anilist.description}/>
            <meta property="og:image" content={props.info.anilist.coverImage.large}/>

            <meta property="twitter:card" content="summary_large_image"/>
            <meta property="twitter:url" content={`http://anify.tv/watch/${props.params.id}/${props.params.provider}/${props.params.watchId}`} />
            <meta property="twitter:title" content={"Watching " + props.info.anilist.title.romaji}/>
            <meta property="twitter:description" content={props.info.anilist.description}/>
            <meta property="twitter:image" content={props.info.anilist.coverImage.large}/>
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.video_container}>
            <div className={styles.back}>
                <a href={`/info/${props.params.id}`}><TbArrowBackUp /> Back</a>
            </div>
            <Media load="custom" ref={media} poster={props.info.anilist.bannerImage ? props.info.anilist.bannerImage : props.info.anilist.coverImage.extraLarge} view="video" className={styles.videoplayer}>
                <AspectRatio ratio="16/9">
                    <HLSVideo>
                        <video src={props.sources?.sources[props.sources.sources.length - 1] ? props.sources?.sources[props.sources.sources.length - 1].url : "https://media-files.vidstack.io/720p.mp4"} preload="none" data-video="0" className={styles.main_video} />
                        {props.sources?.subtitles?.map((subtitle: any) => {
                            // NEED A PROXY
                            return <track kind="subtitles" src={subtitle.url} label={subtitle.language} default={subtitle.default} />
                        })}
                    </HLSVideo>
                    <div className={styles["media-buffering-container"]}>
                        <svg className={styles["media-buffering-icon"]} fill="none" viewBox="0 0 120 120" aria-hidden="true">
                            <circle className={styles["media-buffering-track"]} cx="60" cy="60" r="54" stroke="currentColor" stroke-width="8"></circle>
                            <circle className={styles["media-buffering-track-fill"]} cx="60" cy="60" r="54" stroke="currentColor" stroke-width="10" pathLength="100"></circle>
                        </svg>
                    </div>
                    <div className={styles["media-controls-container"]}>
                        <div className={`${styles["media-controls-group"]} ${styles.title}`}><h1></h1></div>
                        <div className={styles["media-controls-group"]}>{/* <!-- Middle --> */}</div>
                        <div className={`${styles["media-controls-group"]} ${styles.controls}`}>
                            <div className={`${styles.left} ${styles.ui}`}>
                                <PlayButton className={styles.playbutton}>
                                    <svg className={styles["media-play-icon"]} aria-hidden="true" viewBox="0 0 384 512">
                                        <path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                                    </svg>

                                    <svg className={styles["media-pause-icon"]} aria-hidden="true" viewBox="0 0 320 512">
                                        <path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"></path>
                                    </svg>
                                </PlayButton>
                                <MuteButton className={styles.mutebutton}>
                                    <svg className={styles["media-mute-icon"]} aria-hidden="true" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M5.889 16H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L5.89 16zm14.525-4l3.536 3.536l-1.414 1.414L19 13.414l-3.536 3.536l-1.414-1.414L17.586 12L14.05 8.464l1.414-1.414L19 10.586l3.536-3.536l1.414 1.414L20.414 12z" />
                                    </svg>
                                    <svg className={styles["media-unmute-icon"]} aria-hidden="true" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M5.889 16H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L5.89 16zm13.517 4.134l-1.416-1.416A8.978 8.978 0 0 0 21 12a8.982 8.982 0 0 0-3.304-6.968l1.42-1.42A10.976 10.976 0 0 1 23 12c0 3.223-1.386 6.122-3.594 8.134zm-3.543-3.543l-1.422-1.422A3.993 3.993 0 0 0 16 12c0-1.43-.75-2.685-1.88-3.392l1.439-1.439A5.991 5.991 0 0 1 18 12c0 1.842-.83 3.49-2.137 4.591z" />
                                    </svg>
                                </MuteButton>
                            </div>
                            <div className={styles.center}>
                                <div className={styles.slider}>
                                    <TimeSlider className={`${styles.timeslider} ${styles.ui}`}>
                                        <div className={styles["slider-track"]}></div>
                                        <div className={styles["slider-track fill"]}></div>
                                        <div className={styles["slider-thumb-container"]}>
                                            <div className={styles["slider-thumb"]}></div>
                                        </div>
                                        <div className={styles["media-time-container"]}>
                                            <SliderValueText type="pointer" format="time" className={styles.slider_value}></SliderValueText>
                                        </div>
                                    </TimeSlider>
                                </div>
                            </div>
                            <div className={`${styles.right} ${styles.ui}`}>
                                <FullscreenButton className={styles.fullscreenbutton}>
                                    <svg className={styles["media-enter-fs-icon"]} aria-hidden="true" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z" />
                                    </svg>
                                    <svg className={styles["media-exit-fs-icon"]} aria-hidden="true" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z" />
                                    </svg>
                                </FullscreenButton>
                            </div>
                        </div>
                    </div>
                </AspectRatio>
            </Media>
        </div>
    </>
    );
}

/*
<Media className={styles.videoplayer}>
    <AspectRatio ratio="16/9">
        <HLSVideo poster={props.info.anilist.bannerImage ? props.info.anilist.bannerImage : props.info.anilist.coverImage.extraLarge}>
            <video className={styles.main_video} preload="none" src={props.sources?.sources[props.sources.sources.length - 1].url ? props.sources?.sources[props.sources.sources.length - 1].url : "https://media-files.vidstack.io/720p.mp4"} controls></video>
            {props.sources?.subtitles?.map((subtitle: any) => {
                return <track kind="subtitles" src={subtitle.url} label={subtitle.language} default={subtitle.default} />
            })}
        </HLSVideo>
    </AspectRatio>
</Media>
*/

export async function getServerSideProps(context: any) {
    const id = context.params.id;
    const provider = context.params.provider;
    const watchId = decrypt(context.params.watchId);
    const req = await fetch(`${config.api_server}/info`, { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" } });
    const data = await req.json();

    const sourceReq = await fetch(`${config.api_server}/sources`, { method: "POST", body: JSON.stringify({ id: id, provider: provider, watchId: watchId }), headers: { "Content-Type": "application/json" } });
    const sources = await sourceReq.json();

    const episodeReq = await fetch(`${config.api_server}/episodes`, { method: "POST", body: JSON.stringify({ id: id }), headers: { "Content-Type": "application/json" } });
    const episodes = await episodeReq.json();

    function decrypt(url:string) {
        const encrypted = CryptoJS.enc.Hex.parse(url);
        const b64 = encrypted.toString(CryptoJS.enc.Base64);
        const decrypted = CryptoJS.AES.decrypt(b64, "myheroacademia");
        const decodedString = Buffer.from(decrypted.toString(CryptoJS.enc.Utf8), "base64").toString("utf-8");
        return decodedString;
    }
    const trees = [];
    const promises = [];

    sources.subtitles.map((element, index) => {
        const promise = new Promise(async (resolve, reject) => {
            const parser = new WebVTTParser();
            const req = await fetch(element.url);
            const text = await req.text();
            const tree = parser.parse(text);
            trees.push(tree);
            resolve(true);
        });
        promises.push(promise);
    })

    await Promise.all(promises);

    return {
        props: {
            params: {
                id: id,
                provider: provider,
                watchId: watchId,
            },
            info: data,
            sources: sources,
            episodes: episodes,
            trees: trees
        },
    };
}
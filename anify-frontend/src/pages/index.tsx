import styles from "../styles/index.module.css";
import { type NextPage } from "next";
import Head from "next/head";
import Nav from "../components/navigation";
import Button from "../components/button";
import { BsFillPlayCircleFill } from 'react-icons/bs';

const Home: NextPage = () => {
    return (
    <>
        <Head>
            <title>Anify</title>
            <meta name="title" content="Anify" />
            <meta name="description" content="The best Japanese media web-application." />

            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://anify.tv/" />
            <meta property="og:title" content="Anify" />
            <meta property="og:description" content="The best Japanese media web-application." />

            <meta property="twitter:card" content="summary_large_image"/>
            <meta property="twitter:url" content="https://anify.tv/" />
            <meta property="twitter:title" content="Anify" />
            <meta property="twitter:description" content="The best Japanese media web-application." />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Nav index={0} />
        <main className={styles.main}>
            <div className={styles.container}>
                <h1 className={styles.title}>
                    Welcome to Anify
                </h1>
                <h2 className={styles.subtitle}>
                    The best Japanese media web-application.
                </h2>
                <div className={styles.button_wrapper}>
                    <Button style={{ fontSize: "1.6rem", padding: "0.5rem 1rem" }}>
                        <a href="/anime" style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            textDecoration: "none",
                            width: "100%",
                            height: "100%",
                            gap: "5px"
                        }}>
                            <BsFillPlayCircleFill />
                            Browse
                        </a>
                    </Button>
                </div>
            </div>
        </main>
    </>
    );
};

export default Home;
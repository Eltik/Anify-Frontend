import { NextComponentType } from "next";
import styles from "./search.module.css";

const Search: NextComponentType = ({ text, children, ...props }) => {
    return(
        <>
            <input type={"search"} placeholder={text} className={styles.search} {...props}>
                {children}
            </input>
        </>
    )
};
export default Search;
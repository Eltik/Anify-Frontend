import { NextComponentType } from "next";
import styles from "./button.module.css";

const Button: NextComponentType = ({ size, children, ...props }) => {
    return(
        <>
            <button className={`w-${size ? size : "36"} ${styles.button}`}
                {...props}
            >
            {children}
            </button>
        </>
    )
};
export default Button;
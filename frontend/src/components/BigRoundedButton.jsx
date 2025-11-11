import styles from './BigRoundedButton.module.css';

export const BigRoundedButton = ({ children, icon, onClick }) => {
    return (
        <button className={styles.bigRoundedButton} onClick={onClick}>
            <div className={styles.iconContainer}>
                {icon}
            </div>
            <div className={styles.textContainer}>
                {children}
            </div>
        </button>
    );
};

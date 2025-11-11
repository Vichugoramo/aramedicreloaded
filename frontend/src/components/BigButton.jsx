import styles from './BigButton.module.css';

export const BigButton = ({ children, onClick }) => {
    return (
        <button className={styles.bigButton} onClick={onClick}>
            {children}
        </button>
    );
};
import styles from './CardOption.module.css';

export const CardOption = ({ title, description, isSelected = false, onClick = () => {} }) => {
    return (
        <div className={styles.cardOption} onClick={onClick}>
            <div className={styles.radioContainer}>
                <div className={`${styles.radio} ${isSelected && styles.radioSelected}`} />
            </div>
            <div className={styles.content}>
                <p className={styles.title}>{title}</p>
                <p className={description}>{description}</p>
            </div>
        </div>
    );
}
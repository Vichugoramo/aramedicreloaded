import styles from './Destination.module.css';

export const Destination = ({ destination }) => {
    return (
        <div className={styles.destination}>
            <p>Rumbo a</p>
            <p className={styles.destinationName}>{destination}</p>
        </div>
    );
}
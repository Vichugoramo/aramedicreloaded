import styles from './CounterpartHeader.module.css';

export const CounterpartHeader = ({ name, role }) => {
    return (
        <div className={styles.counterpartHeader}>
            <p>{role}</p>
            <p>{name}</p>
        </div>
    );
}
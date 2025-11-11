import styles from './EmergencyDetails.module.css';

export const EmergencyDetails = ({ emergencyType, reportTimestampInMs, notes}) => {
    const reportDate = new Date(reportTimestampInMs);
    const hr = reportDate.getHours();
    const min = reportDate.getMinutes();
    const amPm = hr >= 12 ? 'p.m.' : 'a.m.';
    const fHr = (hr % 12) || 12;
    const fMin = min < 10 ? `0${min}` : min;
    const time = `${fHr}:${fMin} ${amPm}`;

    return (
        <div className={styles.emergencyDetails}>
            <p className={styles.title}>Detalles de la emergencia</p>
            <div className={styles.details}>
                <p className={styles.type}>{emergencyType}</p>
                <p className={styles.time}>Reportada a las {time}</p>
            </div>
            <p className={styles.notes}>{ notes || 'Sin notas'}</p>
        </div>
    );
}
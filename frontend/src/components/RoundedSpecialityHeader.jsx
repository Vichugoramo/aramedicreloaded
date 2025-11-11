import styles from './RoundedSpecialityHeader.module.css';
import { SpecialityIcon } from '../components/SpecialityIcon';

export const RoundedSpecialityHeader = ({ speciality, name }) => {
    const specialityCodename = speciality && speciality.toLowerCase().replace(/[áéíóú]/g, c => (
        { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' }[c]
    ));
    const displayName = name && name.split(' ')[0];

    return (
        <div className={styles.roundedSpecialityHeader}>

            { speciality && (
                <div className={styles.iconContainer}>
                    <SpecialityIcon speciality={specialityCodename} />
                </div>
            )}

            { (speciality && name) && (
                <p className={styles.text}>{speciality} {displayName}</p>
            )}

            <div className={styles.ellipse} />
            <div className={styles.background} />
        </div>
    );
}
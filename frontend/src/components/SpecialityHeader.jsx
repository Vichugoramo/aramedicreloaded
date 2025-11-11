import styles from './SpecialityHeader.module.css';
import { SpecialityIcon } from './SpecialityIcon';

export const SpecialityHeader = ({ speciality, name }) => {
    const specialityCodename = speciality && speciality.toLowerCase().replace(/[áéíóú]/g, c => (
        { 'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u' }[c]
    ));
    const displayName = name && name.split(' ')[0];

    return (
        <div className={styles.specialityHeader}>
            { speciality && (
                <div className={styles.iconContainer}>
                    <SpecialityIcon speciality={specialityCodename} />
                </div>
            )}

            { (speciality && name) && (
                <p className={styles.text}>{speciality} {displayName}</p>
            )}
        </div>
    );
}
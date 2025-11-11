import styles from './CardOptionGroup.module.css';
import { CardOption } from './CardOption';

export const CardOptionGroup = ({ options = [], selectedTitle, onSelect = selectedTitle => {} }) => {
    return (
        <div className={styles.cardOptionGroup}>
            { options.map(opt => (
                <CardOption
                    key={opt.title}
                    title={opt.title}
                    description={opt.description}
                    isSelected={selectedTitle == opt.title}
                    onClick={() => onSelect(opt.title)}
                />
            ))}
        </div>
    );
}
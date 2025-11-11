import { useNavigate, useLocation } from 'react-router';
import styles from './NavigationItem.module.css';

export const NavigationItem = ({ label, path, IconComponent }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentSegment = location.pathname.split('/')[2];
    const isSelected = currentSegment == path;

    const handleClick = () => {
        navigate(path);
    }

    return (
        <div className={styles.navigationItem} onClick={handleClick}>
            <div className={styles.iconContainer}>
                <IconComponent />
            </div>
            <p className={isSelected ? styles.selected : ''}>{label}</p>
        </div>
    );
};
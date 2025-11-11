import styles from './LogOutButton.module.css';
import { useToken } from '../contexts/TokenContext';

export const LogOutButton = ({ children }) => {
    const { setToken } = useToken();

    return (
        <p
            className={styles.logOutButton}
            onClick={()=> setToken(undefined) }
        >
            {children || 'Cerrar sesión'}
        </p>
    );
}
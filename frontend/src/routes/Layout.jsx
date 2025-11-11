import { Outlet } from 'react-router';
import { Navigation } from '../components/Navigation';
import styles from './Layout.module.css';

export const Layout = () => {
    return (
        <div className={styles.layout}>
            <div className={styles.contentContainer}>
                <Outlet />
            </div>
            <Navigation />
        </div>
    );
}
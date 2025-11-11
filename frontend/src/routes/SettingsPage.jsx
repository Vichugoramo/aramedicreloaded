import styles from './SettingsPage.module.css';
import { PageTitle } from '../components/PageTitle';
import { BackButton } from '../components/BackButton';
import { Input } from '../components/Input';
import { useAPI } from '../contexts/APIContext';

export const SettingsPage = () => {
    const { apiUrl, setApiUrl } = useAPI();
    
    return (
        <main className={styles.settingsPage}>
            <div className={styles.titleContainer}>
                <div className={styles.backButtonContainer}>
                    <BackButton />
                </div>
                <PageTitle>Configuración de la aplicación</PageTitle>
            </div>
            <Input
                color='var(--secondary)'
                label='URL de la API'
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                setterFunction={()=>{}}
            />
        </main>
    );
}
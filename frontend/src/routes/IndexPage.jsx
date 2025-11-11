import { BigRoundedButton } from '../components/BigRoundedButton';
import PatientIcon from '../assets/material-symbols--medical-mask.svg?react';
import ClinicianIcon from '../assets/maki--doctor.svg?react';
import { useNavigate } from 'react-router';
import { BigButton } from '../components/BigButton';
import Logo from '../assets/logo.svg?react';
import styles from './IndexPage.module.css';
import SettingsIcon from '../assets/material-symbols--settings-rounded.svg?react';

export const IndexPage = () => {
    const navigate = useNavigate();

    return (
        <main className={styles.indexPage}>
            <div
                className={styles.settingsContainer}
                onClick={() => navigate('/app-settings')}
            >
                <SettingsIcon />
            </div>

            <div className={styles.logoSection}>
                <div className={styles.logoContainer}>
                    <Logo/>
                </div>
            </div>
            
            <div className={styles.contentSection}>
                <p className={styles.text}>¡Bienvenido! Crea una cuenta para comenzar</p>

                <BigRoundedButton
                    icon={<PatientIcon />}
                    onClick={() => navigate('signup-patient')}
                >
                    SOY PACIENTE
                </BigRoundedButton>

                <BigRoundedButton
                    icon={<ClinicianIcon/>}
                    onClick={() => navigate('signup-clinician')}
                >
                    SOY MÉDICO
                </BigRoundedButton>

                <p className={styles.text}>Si ya eres usuario</p>

                <BigButton
                    onClick={() => navigate('login')}
                >
                    INICIAR SESIÓN
                </BigButton>
            </div>
        </main>
    );
}
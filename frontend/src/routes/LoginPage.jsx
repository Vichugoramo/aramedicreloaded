import styles from './LoginPage.module.css';
import Logo from '../assets/logo.svg?react';
import DoctorsImage from '../assets/doctors-rafiki.svg?react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BackButton } from '../components/BackButton';
import { useState } from 'react';
import { Dialog } from '@capacitor/dialog';
import { useAPI } from '../contexts/APIContext';
import { useToken } from '../contexts/TokenContext';

export const LoginPage = () => {
    const { fetchApi } = useAPI();
    const { setToken } = useToken();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const onConfirm = () => {
        fetchApi('login', 'POST', formData)
            .then(async res => {
                setToken(res.token);
            })
            .catch(error => {
                console.log(error.message);
                Dialog.alert({
                    title: 'No ha sido posible iniciar sesión',
                    message: 'Verifica los datos y vuelve a intentarlo.'
                });
            });
    };

    return (
        <main className={styles.loginPage}>
            <div className={styles.backButtonContainer}>
                <BackButton />
            </div>

            <div className={styles.logoSection}>
                <div className={styles.logoContainer}>
                    <Logo />
                </div>
                <div className={styles.logoText}>
                    Aramedic
                </div>
            </div>

            <div className={styles.contentSection}>
                <div className={styles.imageContainer}>
                    <DoctorsImage />
                </div>

                <p className={styles.textBold}>
                    Inicio de sesión
                </p>

                <Input
                    label={'Correo electrónico'}
                    value={formData.email}
                    name={'email'}
                    setterFunction={setFormData}
                />

                <Input
                    label={'Contraseña'}
                    type={'password'}
                    value={formData.password}
                    name={'password'}
                    setterFunction={setFormData}
                />

                <Button onClick={onConfirm}>
                    Confirmar
                </Button>
            </div>
        </main>
    );
}
import styles from './PatientSignUpPage.module.css';
import { useState } from 'react';
import { Button } from '../components/Button';
import { BackButton } from '../components/BackButton';
import { Input } from '../components/Input';
import { SegmentedControl } from '../components/SegmentedControl';
import { Dialog } from '@capacitor/dialog';
import { useAPI } from '../contexts/APIContext';
import { useToken } from '../contexts/TokenContext';
import { useLocation } from 'react-router';

export const RecordPage = () => {
    const { fetchApi } = useAPI();
    const { setToken } = useToken();
    const location = useLocation();
    // token passed from PatientSignUpPage after creating the patient
    const tokenFromSignup = location?.state?.token;
    const boxoptions = ['Si', 'No'];
    const [formData, setFormData] = useState({
        question1: undefined,
        question2: undefined,
        question3: undefined,
        question4: undefined,
        questionwrite: ''
    });

    const isFormDataValid = (formData) => {
        return (
            formData.question1 &&
            formData.question2 &&
            formData.question3 &&
            formData.question4 &&
            formData.questionwrite
        );
    }

    const onConfirm = () => {
        if (!isFormDataValid(formData)) {
            Dialog.alert({
                title: 'Datos incorrectos',
                message: 'Verifica los datos y vuelve a intentarlo'
            });
            return;
        }

    const requestBody = { ...formData }
        requestBody.question1 = formData.question1.toLowerCase() == 'si' ? 'S' : 'N';
        requestBody.question2 = formData.question2.toLowerCase() == 'si' ? 'S' : 'N';
        requestBody.question3 = formData.question3.toLowerCase() == 'si' ? 'S' : 'N';
        requestBody.question4 = formData.question4.toLowerCase() == 'si' ? 'S' : 'N';

    // include the token obtained from the signup step so the backend
    // can associate the record to the just-created patient
    if (tokenFromSignup) requestBody.token = tokenFromSignup;

        fetchApi('record', 'POST', requestBody)
            .then(async res => {
                await Dialog.alert({
                    title: '¡Bienvenido!',
                    message: 'Registro exitoso.'
                });
                // If the backend returned a token here, prefer it; otherwise use the token passed from signup
                const tokenToSet = res?.token || tokenFromSignup;
                if (tokenToSet) {
                    setToken(tokenToSet);
                }
            })
            .catch(error => {
                console.log(error.message);
                Dialog.alert({
                    title: 'No ha sido posible hacer el registro',
                    message: 'Por favor, vuelve a intentarlo'
                });
            });
    };

    return (
        <main className={styles.patientSignUpPage}>
            <div className={styles.titleContainer}>
                <div className={styles.backButtonContainer}>
                    <BackButton />
                </div>
                <h1 className={styles.title}>Historial Medico</h1>
            </div>

            <SegmentedControl
                color='var(--secondary)'
                label='¿Padeces alguna enfermedad grave o cronica (diabetes, hipertesion , asma, etc)?'
                name='question1'
                value={formData.question1}
                setterFunction={setFormData}
                options={boxoptions}
            />
            <SegmentedControl
                color='var(--secondary)'
                label='¿ Te han realizado alguna cirugía con anterioridad?'
                name='question2'
                value={formData.question2}
                setterFunction={setFormData}
                options={boxoptions}
            />
            <SegmentedControl
                color='var(--secondary)'
                label='¿Tomas algun medicamento actualmente?'
                name='question3'
                value={formData.question3}
                setterFunction={setFormData}
                options={boxoptions}
            />
            <SegmentedControl
                color='var(--secondary)'
                label='¿Alergias algún medicamento?'
                name='question4'
                value={formData.question4}
                setterFunction={setFormData}
                options={boxoptions}
            />
            <Input
                color='var(--secondary)'
                label='¿Cuál?'
                name='questionwrite'
                type='text'
                value={formData.questionwrite}
                setterFunction={setFormData}
            />
        
            <Button onClick={onConfirm}>
                Confirmar
            </Button>
        </main>
    );
}
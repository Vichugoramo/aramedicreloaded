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
    
    const tokenFromSignup = location?.state?.token;
    const boxoptions = ['Si', 'No'];
    
    // 1. Actualizamos el estado para tener un campo de texto por cada pregunta
    const [formData, setFormData] = useState({
        question1: undefined, details1: '',
        question2: undefined, details2: '',
        question3: undefined, details3: '',
        question4: undefined, details4: '', // Este reemplaza al antiguo 'questionwrite'
    });

    // 2. Validación dinámica para cada par de Pregunta/Detalle
    const isFormDataValid = (data) => {
        // Función auxiliar para validar un par individual
        const validatePair = (answer, detail) => {
            if (!answer) return false; // La pregunta de Si/No es obligatoria
            if (answer === 'Si') {
                // Si es Si, el texto es obligatorio
                return detail && detail.trim() !== '';
            }
            return true; // Si es No, el texto no importa
        };

        return (
            validatePair(data.question1, data.details1) &&
            validatePair(data.question2, data.details2) &&
            validatePair(data.question3, data.details3) &&
            validatePair(data.question4, data.details4)
        );
    }

    const onConfirm = () => {
        if (!isFormDataValid(formData)) {
            Dialog.alert({
                title: 'Datos incompletos',
                message: 'Por favor, especifica "¿Cuál?" en las opciones donde marcaste "Si".'
            });
            return;
        }

        // Preparamos los datos. 
        // Convertimos 'Si'/'No' a 'S'/'N' para la base de datos
        const requestBody = {
            question1: formData.question1.toLowerCase() === 'si' ? 'S' : 'N',
            details1: formData.details1, // Se envía el texto (o vacío si fue No)
            
            question2: formData.question2.toLowerCase() === 'si' ? 'S' : 'N',
            details2: formData.details2,

            question3: formData.question3.toLowerCase() === 'si' ? 'S' : 'N',
            details3: formData.details3,

            question4: formData.question4.toLowerCase() === 'si' ? 'S' : 'N',
            details4: formData.details4,
        };

        if (tokenFromSignup) requestBody.token = tokenFromSignup;

        // IMPORTANTE: Tu API ahora recibirá estos campos nuevos (details1, details2...).
        // Asegúrate de actualizar el backend para recibirlos.
        fetchApi('record', 'POST', requestBody)
            .then(async res => {
                await Dialog.alert({
                    title: '¡Bienvenido!',
                    message: 'Registro exitoso.'
                });
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

            {/* --- BLOQUE 1: Enfermedades --- */}
            <SegmentedControl
                color='var(--secondary)'
                label='¿Padeces alguna enfermedad grave o cronica?'
                name='question1'
                value={formData.question1}
                setterFunction={setFormData}
                options={boxoptions}
            />
            {formData.question1 === 'Si' && (
                <Input
                    color='var(--secondary)'
                    label='¿Cuál enfermedad?'
                    name='details1'
                    type='text'
                    value={formData.details1}
                    setterFunction={setFormData}
                />
            )}

            {/* --- BLOQUE 2: Cirugías --- */}
            <SegmentedControl
                color='var(--secondary)'
                label='¿Te han realizado alguna cirugía con anterioridad?'
                name='question2'
                value={formData.question2}
                setterFunction={setFormData}
                options={boxoptions}
            />
            {formData.question2 === 'Si' && (
                <Input
                    color='var(--secondary)'
                    label='¿Cuál cirugía?'
                    name='details2'
                    type='text'
                    value={formData.details2}
                    setterFunction={setFormData}
                />
            )}

            {/* --- BLOQUE 3: Medicamentos --- */}
            <SegmentedControl
                color='var(--secondary)'
                label='¿Tomas algun medicamento actualmente?'
                name='question3'
                value={formData.question3}
                setterFunction={setFormData}
                options={boxoptions}
            />
            {formData.question3 === 'Si' && (
                <Input
                    color='var(--secondary)'
                    label='¿Cuál medicamento?'
                    name='details3'
                    type='text'
                    value={formData.details3}
                    setterFunction={setFormData}
                />
            )}

            {/* --- BLOQUE 4: Alergias --- */}
            <SegmentedControl
                color='var(--secondary)'
                label='¿Alergias algún medicamento?'
                name='question4'
                value={formData.question4}
                setterFunction={setFormData}
                options={boxoptions}
            />
            {formData.question4 === 'Si' && (
                <Input
                    color='var(--secondary)'
                    label='¿Cuál?'
                    name='details4'
                    type='text'
                    value={formData.details4}
                    setterFunction={setFormData}
                />
            )}
        
            <Button onClick={onConfirm}>
                Confirmar
            </Button>
        </main>
    );
}
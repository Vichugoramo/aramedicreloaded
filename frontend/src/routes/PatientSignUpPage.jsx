import styles from './PatientSignUpPage.module.css';
import { useState } from 'react';
import { Button } from '../components/Button';
import { BackButton } from '../components/BackButton';
import { Input } from '../components/Input';
import { SegmentedControl } from '../components/SegmentedControl';
import { Dialog } from '@capacitor/dialog';
import { useAPI } from '../contexts/APIContext';
import { useToken } from '../contexts/TokenContext';

export const PatientSignUpPage = () => {
    const { fetchApi } = useAPI();
    const { setToken } = useToken();
    const sexOptions = ['Masculino', 'Femenino'];
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        curp: '',
        sex: undefined,
        age: '',
        height: '',
        weight: '',
        telephone: '',
        email: '',
        password: ''
    });

    const isFormDataValid = (formData) => {
        return (
            formData.name &&
            formData.lastname &&
            formData.curp &&
            formData.sex &&
            formData.age &&
            formData.height &&
            formData.weight &&
            formData.telephone &&
            formData.email &&
            formData.password
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
        requestBody.sex = formData.sex.toLowerCase() == 'masculino' ? 'M' : 'F';
        requestBody.age = Number(formData.age);
        requestBody.weight = Number(formData.weight);
        requestBody.height = Number(formData.height);

        fetchApi('patients', 'POST', requestBody)
            .then(async res => {
                await Dialog.alert({
                    title: '¡Bienvenido!',
                    message: 'Registro exitoso.'
                });
                setToken(res.token);
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
                <h1 className={styles.title}>Soy paciente</h1>
            </div>

            <Input
                color='var(--secondary)'
                label='Nombre(s)'
                name='name'
                type='text'
                value={formData.name}
                setterFunction={setFormData}
            />
            <Input
                color='var(--secondary)'
                label='Apellido(s)'
                name='lastname'
                type='text'
                value={formData.lastname}
                setterFunction={setFormData}
            />
            <Input
                color='var(--secondary)'
                label='CURP'
                name='curp'
                type='text'
                value={formData.curp}
                setterFunction={setFormData}
            />
            <SegmentedControl
                color='var(--secondary)'
                label='Sexo'
                name='sex'
                value={formData.sex}
                setterFunction={setFormData}
                options={sexOptions}
            />
            <Input
                color='var(--secondary)'
                label='Edad'
                name='age'
                type='number'
                value={formData.age}
                setterFunction={setFormData}
            />
            <Input
                color='var(--secondary)'
                label='Estatura (metros)'
                name='height'
                type='number'
                value={formData.height}
                setterFunction={setFormData}
            />
            <Input
                color='var(--secondary)'
                label='Peso (kg)'
                name='weight'
                type='number'
                value={formData.weight}
                setterFunction={setFormData}
            />
            <Input
                color='var(--secondary)'
                label='Teléfono'
                name='telephone'
                type='text'
                value={formData.telephone}
                setterFunction={setFormData}
            />
            <Input
                color='var(--secondary)'
                label='Correo electrónico'
                name='email'
                type='email'
                value={formData.email}
                setterFunction={setFormData}
            />
            <Input
                color='var(--secondary)'
                label='Contraseña'
                name='password'
                type='password'
                value={formData.password}
                setterFunction={setFormData}
            />

            <Button onClick={onConfirm}>
                Confirmar
            </Button>
        </main>
    );
}
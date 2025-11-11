import styles from './ClinicianSignUpPage.module.css';
import { BackButton } from '../components/BackButton';
import { Input } from '../components/Input';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { InfoItem } from '../components/InfoItem';
import { Dialog } from '@capacitor/dialog';
import { useAPI } from '../contexts/APIContext';
import { useToken } from '../contexts/TokenContext';

export const ClinicianSignUpPage = () => {
    const { fetchApi } = useAPI();
    const { setToken } = useToken();
    const navigate = useNavigate();

    const [specialities, setSpecialities] = useState();
    const [formData, setFormData] = useState({
        name: '',
        lastname: '',
        licence: '',
        speciality: '',
        telephone: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        fetchApi('specialities')
            .then(res => {
                setSpecialities(res.specialities);
            })
            .catch(async error => {
                await Dialog.alert({
                    title: 'Error',
                    message: 'No se ha podido obtener la lista de especialidades, intenta de nuevo'
                });
                navigate('/');
                throw new Error(`Unable to fetch specialities: ${error.message}`);
            })
    }, []);

    const isFormDataValid = (formData) => {
        return (
            formData.name &&
            formData.lastname &&
            formData.licence &&
            formData.speciality &&
            formData.telephone &&
            formData.email &&
            formData.password
        );
    }

    const onConfirm = () => {
        const chosenSpecialityObj = specialities.find(s => s.name == formData.speciality);
        const specialityId = chosenSpecialityObj?.id;

        if (!isFormDataValid(formData) || !specialityId) {
            Dialog.alert({
                title: 'Datos incorrectos',
                message: 'Verifica los datos y vuelve a intentarlo'
            });
            return;
        }

        const requestBody = {
            ...formData,
            idSpeciality: specialityId
        };
        requestBody.speciality = undefined;

        fetchApi('medics', 'POST', requestBody)
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
    }

    return (
        <main className={styles.clinicianSignUpPage}>
            <div className={styles.titleContainer}>
                <div className={styles.backButtonContainer}>
                    <BackButton />
                </div>
                <h1 className={styles.title}>Soy médico</h1>
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
                label='Cédula profesional'
                name='licence'
                type='text'
                value={formData.licence}
                setterFunction={setFormData}
            />
            { specialities ? (
                    <Select
                        color='var(--secondary)'
                        label='Especialidad'
                        name='speciality'
                        value={formData.speciality}
                        setterFunction={setFormData}
                        options={specialities.map(s => s.name)}
                    />
                ) : (
                    <InfoItem label={'Especialidad'} textColor={'#555'}>
                        Cargando especialidades...
                    </InfoItem>
                )
            }
            <Input
                color='var(--secondary)'
                label='Número telefónico'
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
import styles from './ProfilePage.module.css';
import { PageTitle } from '../components/PageTitle';
import { InfoItem } from '../components/InfoItem';
import { useToken } from '../contexts/TokenContext';
import { useState, useEffect } from 'react';
import { Dialog } from '@capacitor/dialog';
import { LogOutButton } from '../components/LogOutButton';
import { useProfile } from '../contexts/ProfileContext';

const clinicianItems = [
    {
        label: 'Nombre(s)',
        name: 'name'
    },
    {
        label: 'Apellido(s)',
        name: 'lastname'
    },
    {
        label: 'Cédula profesional',
        name: 'licence'
    },
    {
        label: 'Especialidad',
        name: 'speciality'
    },
    {
        label: 'Número telefónico',
        name: 'telephone'
    },
    {
        label: 'Correo electrónico',
        name: 'email'
    }
];

const patientItems = [
    {
        label: 'Nombre(s)',
        name: 'name'
    },
    {
        label: 'Apellido(s)',
        name: 'lastname'
    },
    {
        label: 'CURP',
        name: 'curp'
    },
    {
        label: 'Edad',
        name: 'age',
        format: value => `${value} años`
    },
    {
        label: 'Sexo',
        name: 'sex',
        format: value => value == 'M' ? 'Masculino' : 'Femenino'
    },
    {
        label: 'Estatura',
        name: 'height',
        format: value => `${Number(value)} metros`
    },
    {
        label: 'Peso',
        name: 'weight',
        format: value => `${Number(value)} kilogramos`
    },
    {
        label: 'Número telefónico',
        name: 'telephone'
    },
    {
        label: 'Correo electrónico',
        name: 'email'
    }
];

export const ProfilePage = () => {
    const userType = useToken().tokenData?.type;
    const items = userType == 'MEDICO' ? clinicianItems : patientItems;
    const profile = useProfile();

    return (
        <main className={styles.profilePage}>
            <PageTitle>Perfil</PageTitle>
            <div className={styles.infoContainer}>
                { items.map(item => {
                    const { label, name, format } = item;
                    let value = profile?.[name];

                    if (value != undefined && format) {
                        value = format(value);
                    }

                    return (
                        <InfoItem key={label} label={label}>
                            {value ?? '...'}
                        </InfoItem>
                    );
                })}
            </div>
            <div className={styles.logOutContainer}>
                <LogOutButton />
            </div>
        </main>
    );
}
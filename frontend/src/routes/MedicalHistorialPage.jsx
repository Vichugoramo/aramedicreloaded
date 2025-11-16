import styles from './ProfilePage.module.css'; // Reusamos los estilos de ProfilePage
import { PageTitle } from '../components/PageTitle';
import { InfoItem } from '../components/InfoItem';
import { useAPI } from '../contexts/APIContext';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Dialog } from '@capacitor/dialog';

// Definimos las preguntas
const medicalQuestions = [
    {
        label: '¿Padeces alguna enfermedad grave o cronica?',
        questionKey: 'question1',
        detailsKey: 'details1'
    },
    {
        label: '¿Te han realizado alguna cirugía con anterioridad?',
        questionKey: 'question2',
        detailsKey: 'details2'
    },
    {
        label: '¿Tomas algun medicamento actualmente?',
        questionKey: 'question3',
        detailsKey: 'details3'
    },
    {
        label: '¿Alergias algún medicamento?',
        questionKey: 'question4',
        detailsKey: 'details4'
    }
];

// Función para formatear la respuesta como pediste
const formatAnswer = (historyData, question) => {
    const answer = historyData[question.questionKey]; // 'S' o 'N'
    const details = historyData[question.detailsKey]; // 'Paracetamol' o null

    if (answer === 'S') {
        return `Si${details ? `, ${details}` : ''}`; // "Si, Paracetamol" o "Si"
    }
    if (answer === 'N') {
        return 'No';
    }
    return 'No registrado'; // Por si acaso
};

export const MedicalHistoryPage = () => {
    const { fetchApi } = useAPI();
    const location = useLocation();
    
    // Si navegamos desde la vista del médico, tendremos un patientId aquí
    const patientId = location.state?.patientId;

    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Determinamos qué endpoint usar
        const endpoint = patientId ? `record/${patientId}` : 'record';

        fetchApi(endpoint, 'GET')
            .then(data => {
                setHistory(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                Dialog.alert({
                    title: 'Error',
                    message: 'No se pudo cargar el historial.'
                });
                setLoading(false);
            });
    }, [fetchApi, patientId]);

    return (
        <main className={styles.profilePage}>
            <div className={styles.titleContainer}>
                 <PageTitle>Historial Médico</PageTitle>
            </div>

            <div className={styles.infoContainer}>
                {loading ? (
                    <InfoItem label="Cargando...">...</InfoItem>
                ) : !history ? (
                     <InfoItem label="Sin datos">El historial no ha sido registrado.</InfoItem>
                ) : (
                    medicalQuestions.map(question => (
                        <InfoItem 
                            key={question.label} 
                            label={question.label} 
                            labelColor='var(--secondary)' // Label azul
                        >
                            {/* Respuesta en negro */}
                            {formatAnswer(history, question)}
                        </InfoItem>
                    ))
                )}
            </div>
        </main>
    );
};
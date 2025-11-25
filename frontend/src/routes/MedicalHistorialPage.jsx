// Pantalla del historial médico del paciente con bitácora y documentos
import styles from './ProfilePage.module.css';
import localStyles from './MedicalHistoryPage.module.css';
import { PageTitle } from '../components/PageTitle';
import { InfoItem } from '../components/InfoItem';
import { Button } from '../components/Button';
import { BackButton } from '../components/BackButton';
import { useAPI } from '../contexts/APIContext';
import { useToken } from '../contexts/TokenContext';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Dialog } from '@capacitor/dialog';

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

const formatAnswer = (historyData, question) => {
    const answer = historyData[question.questionKey];
    const details = historyData[question.detailsKey];
    if (answer === 'S') {
        return `Si${details ? `, ${details}` : ''}`;
    }
    if (answer === 'N') {
        return 'No';
    }
    return 'No registrado';
};


export const MedicalHistoryPage = () => {
    const { fetchApi, apiUrl } = useAPI();
    const { tokenData } = useToken();
    const location = useLocation();

    const patientId = location.state?.patientId;

    const isPatient = !patientId;

    const [history, setHistory] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [newLogDate, setNewLogDate] = useState('');
    const [newLogDesc, setNewLogDesc] = useState('');

    const [editingLogId, setEditingLogId] = useState(null);

    const [files, setFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(true);

    useEffect(() => {
        const historyEndpoint = patientId ? `record/${patientId}` : 'record';

        setLoadingHistory(true);
        fetchApi(historyEndpoint, 'GET')
            .then(data => setHistory(data))
            .catch(err => {
                if (err?.message?.includes('404')) {
                    setHistory(null);
                } else {
                    console.error("Error cargando historial:", err);
                    Dialog.alert({ title: 'Error', message: 'No se pudo cargar el historial.' });
                }
            })
            .finally(() => setLoadingHistory(false));

        const logsEndpoint = patientId ? `logs/${patientId}` : 'logs';

        setLoadingLogs(true);
        fetchApi(logsEndpoint, 'GET')
            .then(data => setLogs(data))
            .catch(err => {
                console.error("Error cargando logs:", err);
                Dialog.alert({ title: 'Error', message: 'No se pudo cargar el registro médico.' });
            })
            .finally(() => setLoadingLogs(false));
        const targetPatientId = patientId || tokenData?.userId;

        if (targetPatientId) {
            setLoadingFiles(true);
            fetchApi(`files/${targetPatientId}`, 'GET')
                .then(data => setFiles(data))
                .catch(err => {
                    console.error("Error cargando archivos:", err);
                    setFiles([]);
                })
                .finally(() => setLoadingFiles(false));
        } else {
            setLoadingFiles(false);
        }


    }, [fetchApi, patientId, tokenData?.userId]);

    const handleClearForm = () => {
        setNewLogDate('');
        setNewLogDesc('');
        setEditingLogId(null);
    };

    const handleAddOrUpdateLog = () => {
        if (!newLogDate || !newLogDesc) {
            Dialog.alert({ title: 'Error', message: 'Por favor, completa la fecha y la descripción.' });
            return;
        }

        const logData = { log_date: newLogDate, description: newLogDesc };

        if (editingLogId) {
            fetchApi(`logs/${editingLogId}`, 'PUT', logData)
                .then(updatedLog => {
                    setLogs(logs.map(log =>
                        log.id === editingLogId ? { ...log, ...updatedLog } : log
                    ));
                    handleClearForm();
                })
                .catch(err => {
                    console.error("Error actualizando log:", err);
                    Dialog.alert({ title: 'Error', message: 'No se pudo actualizar el registro.' });
                });
        } else {
            fetchApi('logs', 'POST', logData)
                .then(newLog => {
                    setLogs([newLog, ...logs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date)));
                    handleClearForm();
                })
                .catch(err => {
                    console.error("Error creando log:", err);
                    Dialog.alert({ title: 'Error', message: 'No se pudo guardar el registro.' });
                });
        }
    };

    const handleDeleteLog = (logId) => {
        Dialog.confirm({
            title: 'Confirmar',
            message: '¿Estás seguro de eliminar este registro?',
        }).then(result => {
            if (result.value) {
                fetchApi(`logs/${logId}`, 'DELETE')
                    .then(() => {
                        setLogs(logs.filter(log => log.id !== logId));
                    })
                    .catch(err => {
                        console.error("Error eliminando log:", err);
                        Dialog.alert({ title: 'Error', message: 'No se pudo eliminar el registro.' });
                    });
            }
        });
    };

    const handleStartEdit = (log) => {
        setEditingLogId(log.id);
        setNewLogDate(log.log_date);
        setNewLogDesc(log.description);
        window.scrollTo(0, document.body.scrollHeight);
    };

    const formatDate = (dateString) => {
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
            return new Date(dateString).toLocaleDateString('es-ES', options);
        } catch (e) {
            return dateString;
        }
    };

    return (
        <main className={styles.profilePage}>

            <div className={styles.titleContainer}>
                {patientId && (
                    <div className={styles.backButtonContainer}>
                        <BackButton />
                    </div>
                )}
                <PageTitle>Historial Médico</PageTitle>
            </div>

            <div className={styles.infoContainer}>
                {loadingHistory ? (
                    <InfoItem label="Cargando...">...</InfoItem>
                ) : !history ? (
                    <InfoItem label="Sin datos">El historial inicial no ha sido registrado.</InfoItem>
                ) : (
                    medicalQuestions.map(question => (
                        <InfoItem
                            key={question.label}
                            label={question.label}
                            labelColor='var(--secondary)'
                        >
                            {formatAnswer(history, question)}
                        </InfoItem>
                    ))
                )}
            </div>

            <div className={localStyles.logSection}>
                <PageTitle>Bitácora Médica</PageTitle>

                {isPatient && (
                    <div className={localStyles.logForm}>
                        <p className={localStyles.formLabel}>{editingLogId ? 'Editando Registro' : 'Nuevo Registro'}</p>
                        <input
                            type="date"
                            value={newLogDate}
                            onChange={e => setNewLogDate(e.target.value)}
                            className={localStyles.logInput}
                        />
                        <input
                            type="text"
                            placeholder="Descripción (ej. Cita con dermatólogo)"
                            value={newLogDesc}
                            onChange={e => setNewLogDesc(e.target.value)}
                            className={localStyles.logInput}
                        />
                        <div className={localStyles.formButtons}>
                            <Button onClick={handleAddOrUpdateLog} color="var(--primary)">
                                {editingLogId ? 'Actualizar' : 'Agregar'}
                            </Button>
                            {editingLogId && (
                                <Button onClick={handleClearForm} color="var(--secondary)">
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                <div className={`${styles.infoContainer} ${localStyles.logList}`}>
                    {loadingLogs ? (
                        <InfoItem label="Cargando registros...">...</InfoItem>
                    ) : logs.length === 0 ? (
                        <InfoItem label="Sin datos">No hay registros en la bitácora.</InfoItem>
                    ) : (
                        logs.map(log => (
                            <div key={log.id} className={localStyles.logEntry}>
                                <InfoItem
                                    label={formatDate(log.log_date)}
                                    labelColor='var(--secondary)'
                                >
                                    {log.description}
                                </InfoItem>

                                {isPatient && (
                                    <div className={localStyles.logActions}>
                                        <button onClick={() => handleStartEdit(log)} className={localStyles.actionButton}>
                                            Editar
                                        </button>
                                        <button onClick={() => handleDeleteLog(log.id)} className={`${localStyles.actionButton} ${localStyles.deleteButton}`}>
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className={localStyles.logSection}>
                <PageTitle>Documentos Médicos</PageTitle>

                <div className={`${styles.infoContainer} ${localStyles.logList}`}>
                    {loadingFiles ? (
                        <InfoItem label="Cargando documentos...">...</InfoItem>
                    ) : files.length === 0 ? (
                        <InfoItem label="Sin documentos">No hay documentos subidos.</InfoItem>
                    ) : (
                        files.map(file => (
                            <div key={file.id} className={localStyles.logEntry}>
                                <InfoItem
                                    label={file.file_name}
                                    labelColor='var(--secondary)'
                                >
                                    {file.description || 'Sin descripción'}
                                    <br />
                                    <small>Subido: {formatDate(file.upload_date)}</small>
                                </InfoItem>

                                {/* Botón de descarga/ver */}
                                <div className={localStyles.logActions}>
                                    <a
                                        href={`${apiUrl}/${file.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={localStyles.actionButton}
                                        download
                                    >
                                        Ver/Descargar
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
};
import styles from './ProfilePage.module.css'; // Reusamos los estilos
import localStyles from './MedicalHistoryPage.module.css'; // Estilos propios
import { PageTitle } from '../components/PageTitle';
import { InfoItem } from '../components/InfoItem';
import { Button } from '../components/Button'; // Importamos Button
import { BackButton } from '../components/BackButton';
import { useAPI } from '../contexts/APIContext';
import { useToken } from '../contexts/TokenContext';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Dialog } from '@capacitor/dialog';

// --- (Sección 1: Historial Médico - Preguntas Fijas) ---

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

// --- (Fin Sección 1) ---


export const MedicalHistoryPage = () => {
    const { fetchApi, apiUrl } = useAPI();
    const { tokenData } = useToken();
    const location = useLocation();

    // --- (Lógica de Roles) ---
    // Si location.state tiene patientId, significa que un médico está viendo.
    const patientId = location.state?.patientId;

    // Si NO hay patientId, es el paciente viendo su propia página.
    const isPatient = !patientId;

    // --- (Estados para el Historial Fijo) ---
    const [history, setHistory] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // --- (NUEVOS ESTADOS para el Registro de Logs) ---
    const [logs, setLogs] = useState([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [newLogDate, setNewLogDate] = useState('');
    const [newLogDesc, setNewLogDesc] = useState('');

    // Estado para saber si estamos editando (null = creando, log.id = editando)
    const [editingLogId, setEditingLogId] = useState(null);

    // --- (NUEVOS ESTADOS para Archivos PDF) ---
    const [files, setFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(true);

    // --- (Efecto para Cargar AMBOS tipos de datos) ---
    useEffect(() => {
        // 1. Cargar Historial (Preguntas S/N)
        // Si es médico, usa el ID; si es paciente, usa su propio token (endpoint 'record')
        const historyEndpoint = patientId ? `record/${patientId}` : 'record';

        setLoadingHistory(true);
        fetchApi(historyEndpoint, 'GET')
            .then(data => setHistory(data))
            .catch(err => {
                if (err?.message?.includes('404')) {
                    setHistory(null); // No es un error, solo no hay datos
                } else {
                    console.error("Error cargando historial:", err);
                    Dialog.alert({ title: 'Error', message: 'No se pudo cargar el historial.' });
                }
            })
            .finally(() => setLoadingHistory(false));

        // 2. Cargar Logs (La nueva bitácora)
        // Si es médico, usa el ID; si es paciente, usa su propio token (endpoint 'logs')
        const logsEndpoint = patientId ? `logs/${patientId}` : 'logs';

        setLoadingLogs(true);
        fetchApi(logsEndpoint, 'GET')
            .then(data => setLogs(data))
            .catch(err => {
                console.error("Error cargando logs:", err);
                Dialog.alert({ title: 'Error', message: 'No se pudo cargar el registro médico.' });
            })
            .finally(() => setLoadingLogs(false));

        // 3. Cargar Archivos PDF
        // Determinar el ID del paciente a consultar
        // Si es médico viendo paciente, usa patientId; si es paciente, usa su propio ID
        const targetPatientId = patientId || tokenData?.userId;

        if (targetPatientId) {
            setLoadingFiles(true);
            fetchApi(`files/${targetPatientId}`, 'GET')
                .then(data => setFiles(data))
                .catch(err => {
                    console.error("Error cargando archivos:", err);
                    // No mostramos alerta aquí porque puede ser que simplemente no haya archivos
                    setFiles([]);
                })
                .finally(() => setLoadingFiles(false));
        } else {
            setLoadingFiles(false);
        }


    }, [fetchApi, patientId, tokenData?.userId]);

    // --- (Nuevos Handlers para CRUD de Logs) ---

    // Limpia el formulario
    const handleClearForm = () => {
        setNewLogDate('');
        setNewLogDesc('');
        setEditingLogId(null);
    };

    // Maneja la creación o actualización
    const handleAddOrUpdateLog = () => {
        if (!newLogDate || !newLogDesc) {
            Dialog.alert({ title: 'Error', message: 'Por favor, completa la fecha y la descripción.' });
            return;
        }

        const logData = { log_date: newLogDate, description: newLogDesc };

        if (editingLogId) {
            // --- Lógica de ACTUALIZAR (PUT) ---
            fetchApi(`logs/${editingLogId}`, 'PUT', logData)
                .then(updatedLog => {
                    // Reemplaza el log antiguo con el actualizado
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
            // --- Lógica de CREAR (POST) ---
            fetchApi('logs', 'POST', logData)
                .then(newLog => {
                    // Añade el nuevo log al inicio de la lista (ordenada por fecha)
                    setLogs([newLog, ...logs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date)));
                    handleClearForm();
                })
                .catch(err => {
                    console.error("Error creando log:", err);
                    Dialog.alert({ title: 'Error', message: 'No se pudo guardar el registro.' });
                });
        }
    };

    // Maneja la eliminación
    const handleDeleteLog = (logId) => {
        Dialog.confirm({
            title: 'Confirmar',
            message: '¿Estás seguro de eliminar este registro?',
        }).then(result => {
            if (result.value) {
                fetchApi(`logs/${logId}`, 'DELETE')
                    .then(() => {
                        // Filtra el log eliminado del estado
                        setLogs(logs.filter(log => log.id !== logId));
                    })
                    .catch(err => {
                        console.error("Error eliminando log:", err);
                        Dialog.alert({ title: 'Error', message: 'No se pudo eliminar el registro.' });
                    });
            }
        });
    };

    // Prepara el formulario para editar un log existente
    const handleStartEdit = (log) => {
        setEditingLogId(log.id);
        setNewLogDate(log.log_date); // El repo ya lo formatea a YYYY-MM-DD
        setNewLogDesc(log.description);
        // Opcional: scroll al formulario
        window.scrollTo(0, document.body.scrollHeight);
    };

    // Formateador de fecha simple para mostrar
    const formatDate = (dateString) => {
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
            return new Date(dateString).toLocaleDateString('es-ES', options);
        } catch (e) {
            return dateString;
        }
    };

    // --- (Renderizado del Componente) ---

    return (
        <main className={styles.profilePage}>

            {/* --- Encabezado y Botón Atrás --- */}
            <div className={styles.titleContainer}>
                {/* El botón atrás solo aparece si el médico está viendo */}
                {patientId && (
                    <div className={styles.backButtonContainer}>
                        <BackButton />
                    </div>
                )}
                <PageTitle>Historial Médico</PageTitle>
            </div>

            {/* --- Sección 1: Historial Fijo (S/N) --- */}
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

            {/* --- Sección 2: NUEVO Registro Médico (Bitácora) --- */}
            <div className={localStyles.logSection}>
                <PageTitle>Bitácora Médica</PageTitle>

                {/* Formulario (Solo para Paciente) */}
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

                {/* Lista de Logs (Para ambos roles) */}
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

                                {/* Botones de CRUD (Solo para Paciente) */}
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

            {/* --- Sección 3: NUEVO Documentos Médicos (PDFs) --- */}
            <div className={localStyles.logSection}>
                <PageTitle>Documentos Médicos</PageTitle>

                {/* Lista de Documentos (Para ambos roles) */}
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
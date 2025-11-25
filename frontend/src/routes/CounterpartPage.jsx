import React from 'react';
import styles from './CounterpartPage.module.css';
import { PageTitle } from '../components/PageTitle';
import { InfoItem } from '../components/InfoItem';
import { useToken } from '../contexts/TokenContext';
import { useAPI } from '../contexts/APIContext';
import { useAssistanceService } from '../contexts/AssistanceServiceContext';
import { Button } from '../components/Button'; // <-- 1. Importar Button
import { useNavigate } from 'react-router'; // <-- 2. Importar useNavigate
import localStyles from './MedicalHistoryPage.module.css';

const CounterpartData = ({ title, elements = [] }) => (
    <>
        <PageTitle>{title}</PageTitle>
        <div className={styles.counterpartDataContainer}>
            {elements.map(e => (
                Array.isArray(e) ? (
                    <DataRow key={e[0]?.label} elements={e} />
                ) : e.type === 'button' ? ( // <-- 3. Añadir lógica para renderizar un botón
                    <div className={localStyles.formButtons}>
                        <Button onClick={e.onClick} color="var(--primary)">
                            {e.label}
                        </Button>
                    </div>
                ) : (
                    <InfoItem key={e.label} labelColor='var(--secondary)' label={e.label}>
                        {e.value}
                    </InfoItem>
                )
            ))}
        </div>
    </>
)

const DataRow = ({ elements = [] }) => (
    <div className={styles.counterpartDataRow}>
        {elements.map(e => (
            <InfoItem key={e.label} labelColor='var(--secondary)' label={e.label}>
                {e.value}
            </InfoItem>
        ))}
    </div>
)

const AvailableClinicianView = () => (
    <div className={styles.availableClinicianView}>
        <p className={styles.availableClinicianText}>Cuando te sea asignada una solicitud podrás ver los datos del paciente aquí</p>
    </div>
)

const BusyClinicianView = ({ counterpart }) => {
    // 4. Hook para navegar
    const navigate = useNavigate();
    const { fetchApi, apiUrl } = useAPI();
    const { token } = useToken();
    const [uploading, setUploading] = React.useState(false);

    // 5. Función que se llamará al presionar el botón
    const onShowHistory = () => {
        // Asumo que 'counterpart.id' tiene el ID del paciente
        // Si el ID está en otra propiedad (ej: counterpart.userId), ajústalo aquí.
        if (counterpart.id) {
            navigate('/navigation/MedicalHistorial', { state: { patientId: counterpart.id } });
        } else {
            console.error("No se encontró el ID del paciente en 'counterpart'");
        }
    };

    // 6. Función para subir PDF
    const onUploadPDF = async () => {
        // Crear input file dinámicamente
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/pdf';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validar que sea PDF
            if (file.type !== 'application/pdf') {
                alert('Por favor selecciona un archivo PDF');
                return;
            }

            // Validar tamaño (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                alert('El archivo es demasiado grande. Máximo 5MB');
                return;
            }

            try {
                setUploading(true);

                // Crear FormData
                const formData = new FormData();
                formData.append('file', file);
                formData.append('patientId', counterpart.id);
                formData.append('description', `Documento subido el ${new Date().toLocaleDateString()}`);

                // Hacer la petición
                const response = await fetch(`${apiUrl}/files/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    alert('Archivo subido exitosamente');
                } else {
                    const error = await response.json();
                    alert(`Error al subir archivo: ${error.message || 'Error desconocido'}`);
                }
            } catch (error) {
                console.error('Error uploading file:', error);
                alert('Error al subir el archivo');
            } finally {
                setUploading(false);
            }
        };

        input.click();
    };

    return (
        <div className={styles.busyClinicianView}>
            <CounterpartData
                title='Datos del paciente'
                elements={[
                    { label: 'Paciente', value: counterpart.fullName },
                    [
                        { label: 'Sexo', value: counterpart.sex == 'F' ? 'Femenino' : 'Masculino' },
                        { label: 'Edad', value: `${counterpart.age} años` }
                    ],
                    [
                        { label: 'Estatura', value: `${Number(counterpart.height)}m` },
                        { label: 'Peso', value: `${Number(counterpart.weight)}kg` }
                    ],
                    { label: 'Número de teléfono', value: counterpart.telephone },
                    // 6. Objeto especial para el botón
                    {
                        type: 'button',
                        label: 'Historial',
                        onClick: onShowHistory
                    },
                    // 7. Nuevo botón para subir PDF
                    {
                        type: 'button',
                        label: uploading ? 'Subiendo...' : 'Subir PDF',
                        onClick: onUploadPDF
                    }
                ]}
            />
        </div>
    )
}

const AvailablePatientView = () => (
    <div className={styles.availablePatientView}>
        <p className={styles.availablePatientText}>Cuando te sea asignado un médico podrás ver sus datos aquí</p>
    </div>
)

const BusyPatientView = ({ counterpart }) => (
    <div className={styles.busyPatientView}>
        <CounterpartData
            title='Datos del médico'
            elements={[
                { label: 'Médico', value: counterpart.fullName },
                { label: 'Especialidad', value: counterpart.speciality },
                { label: 'Cédula profesional', value: counterpart.licence },
                { label: 'Número de teléfono', value: counterpart.telephone }
            ]}
        />
    </div>
)

export const CounterpartPage = () => {
    const { tokenData } = useToken();
    const { counterpart } = useAssistanceService();

    if (!tokenData) {
        return;
    }

    const { type } = tokenData;
    const isBusy = !!counterpart;

    return (
        <main className={styles.counterpartPage}>
            {
                type == 'MEDICO' ?
                    isBusy ? <BusyClinicianView counterpart={counterpart} />
                        : <AvailableClinicianView />
                    : type == 'PACIENTE' ?
                        isBusy ? <BusyPatientView counterpart={counterpart} />
                            : <AvailablePatientView />
                        : null
            }
        </main>
    );
}
import styles from './CounterpartPage.module.css';
import { PageTitle } from '../components/PageTitle';
import { InfoItem } from '../components/InfoItem';
import { useToken } from '../contexts/TokenContext';
import { useAssistanceService } from '../contexts/AssistanceServiceContext';

const CounterpartData = ({ title, elements = [] }) => (
    <>
        <PageTitle>{title}</PageTitle>
        <div className={styles.counterpartDataContainer}>
            { elements.map(e => (
                Array.isArray(e) ? (
                    <DataRow key={e[0]?.label} elements={e} />
                ) : (
                    <InfoItem key={e.label} labelColor='var(--secondary)' label={e.label}>
                        {e.value}
                    </InfoItem>
                )
            )) }
        </div>
    </>
)

const DataRow = ({ elements = [] }) => (
    <div className={styles.counterpartDataRow}>
        { elements.map(e => (
            <InfoItem key={e.label} labelColor='var(--secondary)' label={e.label}>
                {e.value}
            </InfoItem>
        )) }
    </div>
)

const AvailableClinicianView = () => (
    <div className={styles.availableClinicianView}>
        <p className={styles.availableClinicianText}>Cuando te sea asignada una solicitud podrás ver los datos del paciente aquí</p>
    </div>
)

const BusyClinicianView = ({ counterpart }) => (
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
                { label: 'Número de teléfono', value: counterpart.telephone }
            ]}
        />
    </div>
)

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
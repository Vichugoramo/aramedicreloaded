import styles from './ChatPage.module.css';
import { useToken } from '../contexts/TokenContext';
import { useAssistanceService } from '../contexts/AssistanceServiceContext';
import { CounterpartHeader } from '../components/CounterpartHeader';
import { Chat } from '../components/Chat';

const AvailableClinicianView = () => (
    <div className={styles.availableClinicianView}>
        <p className={styles.availableClinicianText}>Cuando te sea asignada una solicitud podrás comunicarte con el paciente aquí</p>
    </div>
)

const BusyClinicianView = () => {
    const { counterpart } = useAssistanceService();

    return (
        <div className={styles.busyClinicianView}>
            <CounterpartHeader role='Paciente' name={counterpart.fullName} />
            <Chat />
        </div>
    );
}

const AvailablePatientView = () => (
    <div className={styles.availablePatientView}>
        <p className={styles.availablePatientText}>Cuando te sea asignado un médico podrás comunicarte con él aquí</p>
    </div>
)

const BusyPatientView = () => {
    const { counterpart } = useAssistanceService();

    return (
        <div className={styles.busyPatientView}>
            <CounterpartHeader role={counterpart.speciality} name={counterpart.fullName} />
            <Chat />
        </div>
    );
}

export const ChatPage = () => {
    const { tokenData } = useToken();
    const { counterpart } = useAssistanceService();
    
    if (!tokenData) {
        return;
    }

    const { type } = tokenData;
    const isBusy = counterpart;

    return (
        <main className={styles.chatPage}>
            {
                type == 'MEDICO' ? 
                    isBusy ? <BusyClinicianView />
                    : <AvailableClinicianView />
                : type == 'PACIENTE' ?
                    isBusy ? <BusyPatientView />
                    : <AvailablePatientView />
                : null
            }
        </main>
    );
}
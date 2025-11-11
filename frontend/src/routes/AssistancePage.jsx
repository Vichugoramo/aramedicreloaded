import styles from './AssistancePage.module.css';
import { useState } from 'react';
import { RoundedSpecialityHeader } from '../components/RoundedSpecialityHeader';
import { useToken } from '../contexts/TokenContext';
import { useProfile } from '../contexts/ProfileContext';
import { SpecialityHeader } from '../components/SpecialityHeader';
import { Destination } from '../components/Destination';
import { EmergencyDetails } from '../components/EmergencyDetails';
import { Map } from '../components/Map';
import { useEmergencyTypes } from '../contexts/EmergencyTypesContext';
import { PageTitle } from '../components/PageTitle';
import { CardOptionGroup } from '../components/CardOptionGroup';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAssistanceService } from '../contexts/AssistanceServiceContext';
import { Dialog } from '@capacitor/dialog';
import { useLocation } from 'react-router';

const AvailableClinicianView = ({ profile }) => (
    <>
        <RoundedSpecialityHeader speciality={profile?.speciality} name={profile?.name} />
        <div className={styles.availableClinicianContent}>
            <div className={styles.clinicianAvailabilityContainer}>
                <p>Te encuentras</p>
                <p className={styles.clinicianAvailabilityText}>Disponible</p>
            </div>
            <p className={styles.availableClinicianDescription}>Cuando te sea asignada una solicitud verás los detalles aquí</p>
        </div>
    </>
);

const BusyClinicianView = ({ profile }) => {
    const { assistanceService, request } = useAssistanceService();
    const emergencyTypes = useEmergencyTypes();

    const endAssistance = async () => {
        const { value } = await Dialog.confirm({
            title: 'Finalizar asistencia',
            message: '¿Desea finalizar la asistencia a este paciente?',
            okButtonTitle: 'Finalizar',
            cancelButtonTitle: 'Cancelar'
        })
        
        if (value) {
            assistanceService.endRequest();
        }
    }

    return (
        <div className={styles.busyClinicianView}>
            <SpecialityHeader speciality={profile?.speciality} name={profile?.name} />
            {/* TODO: Display real destination */}
            <Destination destination={'Facultad de Informática, UAQ Campus Juriquilla'} /> 
            <div className={styles.busyClinicianContent}>
                <Map />
                <EmergencyDetails
                    emergencyType={emergencyTypes.find(type => type.id == request.emergencyTypeId).name}
                    reportTimestampInMs={request.creationTimestamp}
                    notes={request.notes}
                />
                <Button onClick={endAssistance}>Finalizar asistencia</Button>
            </div>
        </div>
    );
};

const AvailablePatientView = ({ emergencyTypes }) => {
    const [formData, setFormData] = useState({
        selectedType: undefined,
        notes: ''
    });
    const { assistanceService } = useAssistanceService();
    const location = useLocation();
    const longitude = location.longitude || 0;
    const latitude = location.latitude || 0;

    const handleConfirm = () => {
        const { selectedType, notes } = formData;
        const selectedTypeObj = emergencyTypes.find(type => type.name == selectedType);
        const selectedId = selectedTypeObj.id;
        assistanceService.createRequest({
            emergencyTypeId: selectedId,
            notes: notes,
            initialLatitude: latitude,
            initialLongitude: longitude
        });
    }

    return (
        <div className={styles.availablePatientView}>
            <PageTitle>Solicitar asistencia médica</PageTitle>
            
            <div className={styles.availablePatientFormLabelContainer}>
                <p className={styles.availablePatientFormLabelTitle}>Tipo de emergencia</p>
                <p>Seleccione el que mejor describa su emergencia</p>
            </div>

            <CardOptionGroup
                options={emergencyTypes.map(type => ({
                    title: type.name,
                    description: type.description
                }))}
                selectedTitle={formData.selectedType}
                onSelect={selectedTitle => setFormData(prev => ({
                    ...prev,
                    selectedType: selectedTitle
                }))}
            />

            <Input
                type='textarea'
                label={'Notas (opcional)'}
                value={formData.notes}
                color={'var(--secondary)'}
                name={'notes'}
                setterFunction={setFormData}
            />

            <Button onClick={handleConfirm}>Confirmar solicitud</Button>
        </div>
    );
};

const WaitingPatientView = () => (
    <div className={styles.waitingPatientView}>
        <div className={styles.waitingPatientBoldText}>
            <p>Tu solicitud está</p>
            <p className={styles.waitingPatientColorText}>Pendiente</p>
        </div>
            <p>En breve te será asignado un médico</p>
    </div>
);

const BusyPatientView = () => {
    const { request, counterpart } = useAssistanceService();
    const emergencyTypes = useEmergencyTypes();

    return (
        <div className={styles.busyPatientView}>
            <SpecialityHeader speciality={counterpart?.speciality} name={counterpart?.fullName} />
            {/* TODO: Display real destination */}
            <Destination destination={'Facultad de Informática, UAQ Campus Juriquilla'} /> 
            <div className={styles.busyPatientContent}>
                <Map />
                <EmergencyDetails
                    emergencyType={emergencyTypes.find(type => type.id == request.emergencyTypeId).name}
                    reportTimestampInMs={request.creationTimestamp}
                    notes={request.notes}
                />
            </div>
        </div>
    );
}

export const AssistancePage = () => {
    const { tokenData } = useToken();
    const profile = useProfile();
    const emergencyTypes = useEmergencyTypes();
    const { request } = useAssistanceService();
    const { counterpart } = useAssistanceService();
    
    if (!tokenData) {
        return;
    }
    
    const { type } = tokenData;
    const isWaiting = !!request;
    const isBusy = isWaiting && !!counterpart;

    return (
        <main className={styles.assistancePage}>
            {
                type == 'MEDICO' ? 
                    isBusy ? <BusyClinicianView profile={profile} />
                    : <AvailableClinicianView profile={profile} />
                : type == 'PACIENTE' ?
                    isBusy ? <BusyPatientView />
                    : isWaiting ? <WaitingPatientView />
                    : <AvailablePatientView emergencyTypes={emergencyTypes} />
                : null
            }
        </main>
    );
}
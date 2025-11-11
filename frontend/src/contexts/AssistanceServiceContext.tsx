import { createContext, useContext, useEffect, useState } from 'react';
import { useAPI } from './APIContext';
import { useToken } from './TokenContext';
import { Dialog } from '@capacitor/dialog';
import { ClinicianAssistanceService, PatientAssistanceService, AssistanceService } from '../services/AssistanceService';
import { MessageHistory, AssistanceRequest, Counterpart, MessageListener, RequestListener, PatientListener, ClinicianListener } from '../services/AssistanceService';
import { useLocation } from '../contexts/LocationContext';

interface AssistanceServiceContext {
    assistanceService: AssistanceService | null,
    messages: MessageHistory,
    request: AssistanceRequest | undefined,
    counterpart: Counterpart | undefined
}

const AssistanceServiceContext = createContext<AssistanceServiceContext>({
    assistanceService: null,
    messages: [],
    request: undefined,
    counterpart: undefined
});

export const AssistanceServiceProvider = ({ children }) => {
    const { apiUrl } = useAPI();
    const { token, setToken, tokenData } = useToken();
    const location = useLocation();
    const [assistanceService, setAssistanceService] = useState<AssistanceService | null>(null);
    const [messages, setMessages] = useState<MessageHistory>([]);
    const [request, setRequest] = useState<AssistanceRequest | undefined>();
    const [counterpart, setCounterpart] = useState<Counterpart | undefined>();

    // TODO: Prevent AssistanceService to be instanciated with latitude or longitude 0
    const longitude = location.longitude || 0;
    const latitude = location.latitude || 0;
    
    useEffect(() => {
        if (!token && assistanceService) {
            assistanceService.end();
            setAssistanceService(null);
        }

        if (token && !assistanceService) {
            try {
                switch (tokenData?.type) {
                    case 'MEDICO':
                        setAssistanceService(new ClinicianAssistanceService(apiUrl, token, latitude, longitude));
                        break;
                    case 'PACIENTE':
                        setAssistanceService(new PatientAssistanceService(apiUrl, token, latitude, longitude));
                        break;
                }
            } catch (error) {
                console.log(`Unable to instanciate AssistanceService: ${error.message}`);
                Dialog.alert({
                    title: 'Ocurrió un error',
                    message: 'No ha sido posible conectar con el servidor, por favor, vuelve a iniciar sesión.'
                }).then(() => {
                    setToken(undefined);
                });
            }
        }
    }, [ token, tokenData ]);

    useEffect(() => {
        if (!assistanceService) {
            return;
        }

        setMessages(assistanceService.getMessages());
        setRequest(assistanceService.getRequest());

        const messageListener: MessageListener = messages => setMessages(messages);
        assistanceService.addMessageListener(messageListener);

        const requestListener: RequestListener = request => setRequest(request);
        assistanceService.addRequestListener(requestListener);

        const { type } = tokenData;
        let removeCounterpartListener: () => void = () => {};

        switch (type) {
            case 'MEDICO':
                const clinicianService = (assistanceService as ClinicianAssistanceService);

                const patientListener: PatientListener = patient => setCounterpart(patient);
                clinicianService.addPatientListener(patientListener);
                setCounterpart(clinicianService.getPatient())

                removeCounterpartListener = () => {
                    clinicianService.removePatientListener(patientListener);
                }
                break;
            case 'PACIENTE':
                const patientService = (assistanceService as PatientAssistanceService);

                const clinicianListener: ClinicianListener = patient => setCounterpart(patient);
                patientService.addClinicianListener(clinicianListener);
                setCounterpart(patientService.getClinician())

                removeCounterpartListener = () => {
                    patientService.removeClinicianListener(clinicianListener);
                }
                break;
        }

        const updateLocationInterval = setInterval(() => {
            if (!latitude || !longitude) {
                return;
            }
            assistanceService.updateLocation(latitude, longitude);
        }, 10_000);
        
        return () => {
            try {
                clearInterval(updateLocationInterval);
                assistanceService.end();
            } catch {
                // assistanceService object and all its listeners already destroyed
            }
        }
    }, [assistanceService]);

    return (
        <AssistanceServiceContext.Provider 
            value={{
                assistanceService,
                messages,
                request,
                counterpart
            }}
        >
            {children}
        </AssistanceServiceContext.Provider>
    );
}

export const useAssistanceService = () => {
    const assistanceService = useContext(AssistanceServiceContext);
    if (assistanceService === undefined) {
        throw new Error('useAssistanceService must be used within a AssistanceServiceProvider');
    }
    return assistanceService;
}

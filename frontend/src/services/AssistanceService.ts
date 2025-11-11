import { io, Socket } from "socket.io-client";

interface Message {
    sentBySelf: boolean,
    content: string
}

export interface Counterpart {
    fullName: string,
    telephone: string,
    latitude: number | null,
    longitude: number | null,
    isOnline: boolean
}

export interface Clinician extends Counterpart {
    licence: string,
    speciality: string
}

export interface Patient extends Counterpart {
    height: number,
    weight: number,
    age: number,
    sex: string
}

export interface AssistanceRequest {
    emergencyTypeId: number,
    notes: string,
    creationTimestamp: number
}

interface ReceiveMessageEventBody {
    message: string
}

interface ReceivePatientDataEventBody {
    fullname: string,
    height: number,
    weight: number,
    age: number,
    sex: string,
    telephone: string,
    emergencyTypeId: number,
    requestTimestamp: number,
    notes: string
}

interface ReceiveClinicianDataEventBody {
    fullname: string,
    licence: string,
    speciality: string,
    telephone: string
}

export interface CreateRequestBody {
    emergencyTypeId: number,
    notes: string,
    initialLatitude: number,
    initialLongitude: number
}

interface UpdateCounterpartLocationEventBody {
    isOnline: boolean,
    currentLatitude: number,
    currentLongitude: number
}

interface UpdateUserLocationBody {
    currentLatitude: number,
    currentLongitude: number
}

export type MessageHistory = Message[];

type Listener<Data> = (data: Data) => any;
type SocketListener = Listener<any>;
export type MessageListener = Listener<MessageHistory>;
export type RequestListener = Listener<AssistanceRequest | undefined>;
export type PatientListener = Listener<Patient | undefined>;
export type ClinicianListener = Listener<Clinician | undefined>;
export type RequestCompletedListener = Listener<undefined>;

class ListenerList<Data> {
    private readonly listeners: Listener<Data>[] = [];

    add(listener: Listener<Data>) {
        this.listeners.push(listener);
    }

    remove(listener: Listener<Data>) {
        const index = this.listeners.indexOf(listener);
        if (index !== -1) {
            this.listeners.splice(index, 1);
        }
    }

    emit(data: Data) {
        for (const listener of this.listeners) {
            try {
                listener(data);
            } catch (error) {
                console.error('Listener threw an error:', error);
            }
        }
    }
}

/**
 * Class that manages a Socket.io connection with the server, as well
 * as data and events for the medical assistance feature of the app.
 */
export abstract class AssistanceService {
    protected readonly socket: Socket;
    private messages: MessageHistory = [];
    private request: AssistanceRequest | undefined = undefined;
    private readonly messageListeners = new ListenerList<MessageHistory>();
    private readonly requestListeners = new ListenerList<AssistanceRequest | undefined>();
    private readonly requestCompletedListeners = new ListenerList<undefined>();

    constructor(apiUrl: string, token: string, currentLatitude: number, currentLongitude: number) {
        const socket = io(apiUrl, {
            auth: {
                token,
                currentLatitude,
                currentLongitude
            }
        });
        this.socket = socket;
        
        this.loadStoredMessageHistory();
        this.loadRequest();

        this.on('receiveMessage', (data: ReceiveMessageEventBody) =>
            this.handleReceiveMessage(data)
        );

        this.on('isRequestCompleted', () => 
            this.handleRequestCompleted()
        );
    }

    end() {
        this.disconnect();
        for (const key in this) {
            delete this[key];
        }
    }

    sendMessage(message: string) {
        this.socket.emit('sendMessage', {
            message: message
        });
        
        const msgObj: Message = {
            content: message,
            sentBySelf: true
        }
        this.addMessages(msgObj);
    }

    getMessages(): MessageHistory {
        return [...this.messages];
    }

    getRequest(): AssistanceRequest | undefined {
        if (!this.request) {
            return undefined;
        }
        return { ...this.request };
    }

    updateLocation(latitude: number, longitude: number) {
        if (!latitude || !longitude) {
            return;
        }

        const body: UpdateUserLocationBody = {
            currentLatitude: latitude,
            currentLongitude: longitude
        };

        this.socket.emit('updateUserLocation', body);
    }

    addRequestListener(listener: RequestListener) {
        this.requestListeners.add(listener);
    }

    removeRequestListener(listener: RequestListener) {
        this.requestListeners.remove(listener);
    }

    addMessageListener(listener: MessageListener) {
        this.messageListeners.add(listener);
    }

    removeMessageListener(listener: MessageListener) {
        this.messageListeners.remove(listener);
    }

    addRequestCompletedListener(listener: RequestCompletedListener) {
        this.requestCompletedListeners.add(listener);
    }

    removeRequestCompletedListener(listener: RequestCompletedListener) {
        this.requestCompletedListeners.remove(listener);
    }

    protected on(event: string, listener: SocketListener) {
        this.socket.on(event, listener);
    }

    protected off(event: string, listener: SocketListener) {
        this.socket.off(event, listener);
    }

    protected setRequest(request: AssistanceRequest) {
        this.request = request;
        this.storeRequest();
        this.requestListeners.emit(request);
    }

    private disconnect() {
        this.socket.disconnect();
    }
    
    private storeRequest() {
        const { request } = this;
        if (!request) {
            return;
        }
        const requestStr = JSON.stringify(request);
        localStorage.setItem('request', requestStr);
    }

    private loadRequest() {
        const storedRequestStr = localStorage.getItem('request');

        if (!storedRequestStr) {
            return;
        }

        const storedRequest: AssistanceRequest = JSON.parse(storedRequestStr);
        this.setRequest(storedRequest);
    }

    private clearRequest() {
        this.request = undefined;
        this.requestListeners.emit(undefined);
        localStorage.removeItem('request');
    }

    private storeMessageHistory() {
        const historyStr = JSON.stringify(this.messages);
        localStorage.setItem('chat', historyStr);
    }

    private loadStoredMessageHistory() {
        const storedMessagesStr = localStorage.getItem('chat');
        const storedMessages: MessageHistory | null = storedMessagesStr && JSON.parse(storedMessagesStr);
        
        if (storedMessages) {
            this.messages = [];
            this.addMessages(...storedMessages);
        }
    }

    private clearChatHistory() {
        this.messages = [];
        this.messageListeners.emit([]);
        localStorage.removeItem('chat');
    }

    private clearStoredData() {
        this.clearChatHistory();
        this.clearRequest();
    }

    private addMessages(...messages: Message[]) {
        this.messages.push(...messages);
        this.storeMessageHistory();
        this.messageListeners.emit([...this.messages]);
    }

    private handleReceiveMessage(data: ReceiveMessageEventBody) {
        const { message } = data;
        const msgObj: Message = {
            content: message,
            sentBySelf: false
        };
        this.addMessages(msgObj);
    }

    private handleRequestCompleted() {
        this.clearStoredData();
        this.requestCompletedListeners.emit(undefined);
    }

}

/**
 * Class that manages a Socket.io connection with the server, as well
 * as data and events for the medical assistance features of clinicians
 * in the app.
 */
export class ClinicianAssistanceService extends AssistanceService {
    private patient: Patient | undefined = undefined;
    private readonly patientListeners = new ListenerList<Patient | undefined>();

    constructor(apiUrl: string, token: string, currentLatitude: number, currentLongitude: number) {
        super(apiUrl, token, currentLatitude, currentLongitude);

        this.loadPatient();

        this.on('receiveCounterpartData', (data: ReceivePatientDataEventBody) =>
            this.handleReceiveCounterpartData(data)
        );

        this.on('isRequestCompleted', () => 
            this.handleRequestCompletedForClinician()
        );

        this.on('updateCounterpartLocation', (data: UpdateCounterpartLocationEventBody) =>
            this.handleUpdateCounterpartLocation(data)
        );
    }
    
    getPatient(): Patient | undefined {
        if (!this.patient) {
            return undefined;
        }
        return { ...this.patient };
    }

    endRequest() {
        this.socket.emit('endRequest');
    }

    addPatientListener(listener: PatientListener) {
        this.patientListeners.add(listener);
    }

    removePatientListener(listener: PatientListener) {
        this.patientListeners.remove(listener);
    }

    protected setPatient(data: Patient) {
        this.patient = data;
        this.storePatient();
        this.patientListeners.emit(data);
    }

    private storePatient() {
        const { patient } = this;
        if (!patient) {
            return;
        }
        const patientStr = JSON.stringify(patient);
        localStorage.setItem('patient', patientStr);
    }

    private loadPatient() {
        const storedPatientStr = localStorage.getItem('patient');

        if (!storedPatientStr) {
            return;
        }

        const storedPatient: Patient = JSON.parse(storedPatientStr);
        this.setPatient(storedPatient);
    }

    private clearPatient() {
        this.patient = undefined;
        this.patientListeners.emit(undefined);
        localStorage.removeItem('patient');
    }

    private handleReceiveCounterpartData(data: ReceivePatientDataEventBody) {
        const request: AssistanceRequest = {
            creationTimestamp: data.requestTimestamp,
            emergencyTypeId: data.emergencyTypeId,
            notes: data.notes
        };
        
        const patient: Patient = {
            fullName: data.fullname,
            age: data.age,
            telephone: data.telephone,
            height: data.height,
            weight: data.weight,
            sex: data.sex,
            latitude: null,
            longitude: null,
            isOnline: false
        };
        
        this.setRequest(request);
        this.setPatient(patient);
    }

    private handleRequestCompletedForClinician() {
        this.clearPatient();
    }

    private handleUpdateCounterpartLocation(data: UpdateCounterpartLocationEventBody) {
        if (!this.patient) {
            return;
        }

        const patient: Patient = {
            ...this.patient,
            latitude: data.currentLatitude,
            longitude: data.currentLongitude,
            isOnline: data.isOnline
        }

        this.setPatient(patient);
    }
}

/**
 * Class that manages a Socket.io connection with the server, as well
 * as data and events for the medical assistance features of patients
 * in the app.
 */
export class PatientAssistanceService extends AssistanceService {
    private clinician: Clinician | undefined = undefined;
    private readonly clinicianListeners = new ListenerList<Clinician | undefined>();

    constructor(apiUrl: string, token: string, currentLatitude: number, currentLongitude: number) {
        super(apiUrl, token, currentLatitude, currentLongitude);

        this.loadClinician();

        this.on('isRequestCreated', () =>
            this.handleRequestCreated()
        );

        this.on('receiveCounterpartData', (data: ReceiveClinicianDataEventBody) =>
            this.handleReceiveCounterpartData(data)
        );

        this.on('isRequestCompleted', () => 
            this.handleRequestCompletedForPatient()
        );

        this.on('updateCounterpartLocation', (data: UpdateCounterpartLocationEventBody) =>
            this.handleUpdateCounterpartLocation(data)
        );

    }

    createRequest(data: CreateRequestBody) {
        this.socket.emit('createRequest', data);

        // TODO: The request object should be created and set in this.handleRequestCreated(), not here
        const request: AssistanceRequest = {
            creationTimestamp: Date.now(),
            emergencyTypeId: data.emergencyTypeId,
            notes: data.notes
        };

        this.setRequest(request);
    }

    getClinician(): Clinician | undefined {
        if (!this.clinician) {
            return undefined;
        }
        return { ...this.clinician };
    }

    addClinicianListener(listener: ClinicianListener) {
        this.clinicianListeners.add(listener);
    }

    removeClinicianListener(listener: ClinicianListener) {
        this.clinicianListeners.remove(listener);
    }

    protected setClinician(data: Clinician) {
        this.clinician = data;
        this.storeClinician();
        this.clinicianListeners.emit(data);
    }

    private storeClinician() {
        const { clinician } = this;
        if (!clinician) {
            return;
        }
        const clinicianStr = JSON.stringify(clinician);
        localStorage.setItem('clinician', clinicianStr);
    }

    private loadClinician() {
        const storedClinicianStr = localStorage.getItem('clinician');

        if (!storedClinicianStr) {
            return;
        }

        const storedclinician: Clinician = JSON.parse(storedClinicianStr);
        this.setClinician(storedclinician);
    }

    private clearClinician() {
        this.clinician = undefined;
        this.clinicianListeners.emit(undefined);
        localStorage.removeItem('clinician');
    }

    private handleReceiveCounterpartData(data: ReceiveClinicianDataEventBody) {
        const clinician: Clinician = {
            fullName: data.fullname,
            licence: data.licence,
            telephone: data.telephone,
            speciality: data.speciality,
            latitude: null,
            longitude: null,
            isOnline: false
        };
        
        this.setClinician(clinician);
    }

    private handleRequestCompletedForPatient() {
        this.clearClinician();
    }

    private handleRequestCreated() {
        // TODO: The local request object should be created here
    }

    private handleUpdateCounterpartLocation(data: UpdateCounterpartLocationEventBody) {
        if (!this.clinician) {
            return;
        }

        const clinician: Clinician = {
            ...this.clinician,
            latitude: data.currentLatitude,
            longitude: data.currentLongitude,
            isOnline: data.isOnline
        }

        this.setClinician(clinician);
    }
}
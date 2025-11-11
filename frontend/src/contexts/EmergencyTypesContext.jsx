import { createContext, useContext, useState } from 'react';
import { useToken } from './TokenContext';
import { useAPI } from './APIContext';
import { Dialog } from '@capacitor/dialog';

const EmergencyTypesContext = createContext(
    [ {
        id: 0,
        name: '',
        description: ''
    } ]
);

export const EmergencyTypesProvider = ({ children }) => {
    const { token } = useToken();
    const { fetchApi } = useAPI();
    const [types, setTypes] = useState([]);
    const areTypesLoaded = types.length > 0;
    
    if (token && !areTypesLoaded) {
        fetchApi('emergency-types')
            .then(res => {
                const { emergencyTypes } = res;
                setTypes(emergencyTypes);
            })
            .catch(async error => {
                console.error(`Unable to load emergency types: ${error.message}`);
                await Dialog.alert({
                    title: 'Error',
                    message: 'No ha sido posible cargar los tipos de emergencia, por favor, vuelve a cargar la pantalla'
                });
            });
    }

    return (
        <EmergencyTypesContext.Provider value={types}>
            {children}
        </EmergencyTypesContext.Provider>
    );
}

export const useEmergencyTypes = () => {
    const types = useContext(EmergencyTypesContext);
    if (!types) {
        throw new Error('useEmergencyTypes must be used within a EmergencyTypesProvider');
    }
    return types;
}
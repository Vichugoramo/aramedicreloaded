import { createContext, useContext, useState } from 'react';
import { useToken } from './TokenContext';
import { useAPI } from './APIContext';
import { Dialog } from '@capacitor/dialog';

const ProfileContext = createContext({
    id: 0,
    name: '',
    lastname: '',
    telephone: '',
    email: '',
    licence: '',
    speciality: ''
});

export const ProfileProvider = ({ children }) => {
    const { token, setToken } = useToken();
    const { fetchApi } = useAPI();
    const [profile, setProfile] = useState({});
    const profileKeys = Object.keys(profile);
    const isProfileLoaded = profileKeys.length > 0;

    if (!token && isProfileLoaded) {
        setProfile({});
    }
    
    if (token && !isProfileLoaded) {
        fetchApi('profile')
            .then(res => {
                setProfile(res);
            })
            .catch(async error => {
                console.error(`Unable to load profile: ${error.message}`);
                await Dialog.alert({
                    title: 'Error',
                    message: 'No ha sido posible cargar los datos del usuario, por favor, vuelve a iniciar sesión.'
                });
                setToken(undefined);
            });
    }

    return (
        <ProfileContext.Provider value={profile}>
            {children}
        </ProfileContext.Provider>
    );
}

export const useProfile = () => {
    const profile = useContext(ProfileContext);
    if (!profile) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return profile;
}
import { createContext, useContext, useState, useEffect } from 'react';
import { Geolocation } from "@capacitor/geolocation";

const LocationContext = createContext();
const defaultLocation = {
    latitude: undefined,
    longitude: undefined
}

const getLocation = async () => {
    try {
        // Using Capacitor Geolocation plugin
        await Geolocation.requestPermissions();
        const position = await Geolocation.getCurrentPosition();

        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
    } catch (error) {
        // Using browser API
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            return {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            };
        } catch (error) {
            console.warn('Unable to get geolocation, using default', error);
            return defaultLocation;
        }
    }
};

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(defaultLocation);

    useEffect(() => {
        const updateLocation = async () => setLocation(await getLocation());
        updateLocation();

        const interval = setInterval(updateLocation, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <LocationContext.Provider value={location}>
            {children}
        </LocationContext.Provider>
    );
}

export const useLocation = () => {
    const location = useContext(LocationContext);
    if (!location) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return location;
}
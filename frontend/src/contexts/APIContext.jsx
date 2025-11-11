import { createContext, useContext, useState } from "react";
import { useToken } from "./TokenContext";
const defaultApiUrl = import.meta.env.VITE_API_URL;

const APIContext = createContext({
    apiUrl: '',
    setApiUrl: value => {},
    fetchApi: async (path, method = 'GET', body, options = {}) => {}
});

export const APIProvider = ({ children }) => {
    const [ apiUrl, setApiUrl ] = useState(defaultApiUrl);
    const { token } = useToken();

    if (!token) {
        console.log('fetchAPI has been initialized with no token');
    }

    const fetchApi = async (path, method = 'GET', body, options = {}) => {
        if (!apiUrl) {
            throw new Error("Can't use fetchAPI because apiUrl is not defined");
        }

        const cleanPath = path.replace(/^\//, '');

        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const completeOptions = { 
            ...options,
            method: method.toUpperCase(),
            headers
        };
        
        if (body) {
            completeOptions['body'] = JSON.stringify(body);
        }

        const res = await fetch(`${apiUrl}/${cleanPath}`, completeOptions);

        if (res.ok) {
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch(error) {
                return text;
            }
        }

        throw new Error(`Unsuccessful request: ${res.status} ${res.statusText}`);
    }

    return (
        <APIContext.Provider 
            value={{
                apiUrl: apiUrl,
                setApiUrl: setApiUrl,
                fetchApi: fetchApi
            }}>
            {children}
        </APIContext.Provider>
    );
};

export const useAPI = () => {
    const api = useContext(APIContext);
    if (!api) {
        throw new Error('useAPI must be used within an APIProvider')
    }
    return api;
};
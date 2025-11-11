import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router";

const TokenContext = createContext({
    token: '',
    tokenData: { userId: 0, type: '', iat: 0, exp: 0 },
    setToken: value => {}
});

const storedToken = localStorage.getItem('token');

const decodeToken = encodedToken => {
    const payload = encodedToken.split('.')[1];
    const decodedPayload = atob(payload);
    const tokenData = JSON.parse(decodedPayload);
    return tokenData;
};

const isTokenExpired = tokenData => {
    const { exp } = tokenData;
    if (!exp) {
        return true;
    }
    const currentTime = Math.floor(Date.now() / 1000); // in seconds
    return tokenData.exp < currentTime;
};

export const TokenProvider = ({ children }) => {
    const navigate = useNavigate();
    const [token, setToken] = useState(storedToken);
    const [tokenData, setTokenData] = useState();
    
    useEffect(() => {
        try {
            const decodedToken = decodeToken(token);

            if (isTokenExpired(decodedToken)) {
                throw new Error('Expired token');
            }

            localStorage.setItem('token', token);
            setTokenData(decodedToken);
            navigate('/navigation');

        } catch (error) {
            if (token != undefined) {
                setToken(undefined);
            }
            setTokenData(undefined);
            localStorage.clear();
            navigate('/');

        }
    }, [token]);

    return (
        <TokenContext.Provider
            value={{
                token: token,
                tokenData: tokenData,
                setToken: setToken
            }}
        >
            {children}
        </TokenContext.Provider>
    );
}

export const useToken = () => {
    const tokenContext = useContext(TokenContext);
    if (!tokenContext) {
        throw new Error('useToken must be used within an TokenProvider')
    }
    return tokenContext;
}
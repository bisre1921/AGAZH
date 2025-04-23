import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin } from "../api/api";
import jwtDecode from "../utils/jwtDecode";

interface AuthContextType {
    isLoading: boolean;
    userToken: string | null;
    userInfo: any;
    login: (email: string, password: string, userType: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    userType: string | null;
}

const AuthContext = createContext<AuthContextType>({
    isLoading: true,
    userToken: null,
    userInfo: null,
    login: async () => {},
    logout: () => {},
    isAuthenticated: false,
    userType: ''
})

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [userType, setUserType] = useState<string | null>(null);

    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const storedUserType = await AsyncStorage.getItem('userType');
                const storedUserInfo = await AsyncStorage.getItem('userInfo');

                if (token && storedUserInfo && storedUserType) { // Add check for storedUserType
                    setUserToken(token);
                    setUserInfo(JSON.parse(storedUserInfo));
                    setUserType(storedUserType);
                }

            } catch (error) {
                console.error('Error loading user data', error);
            } finally {
                setIsLoading(false);
            }
        }
        bootstrapAsync();
    }, []);

    const login = async (email: string, password: string, user_type: string) => {
        try {
            setIsLoading(true);
            const response = await apiLogin(email, password, user_type);
            const {token} = response.data;

            const decoded = jwtDecode(token);

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('userType', user_type); // Corrected variable name
            await AsyncStorage.setItem('userInfo', JSON.stringify(decoded));

            setUserToken(token);
            setUserInfo(decoded);
            setUserType(user_type); //  This is the MOST important line
        } catch (error) {
            console.error('Error logging in', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userType');
        await AsyncStorage.removeItem('userInfo');
        setUserToken(null);
        setUserInfo(null);
        setUserType(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider 
            value = {{
                isLoading, 
                userToken, 
                userInfo, 
                login, 
                logout, 
                isAuthenticated: !!userToken, 
                userType: userType || ''
            }}
        >
            {children}
        </AuthContext.Provider>
    )

}

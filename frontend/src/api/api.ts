import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "to be filled";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

interface HousekeeperData {
    name: string;
    email: string;
    password: string;
    age: number;
    experience?: number;
    category: string; 
    employmentType: string; 
    skills?: string[];
    photoURL?: string;
    certifications?: string[];
    location: string;
    phoneNumber: string;
    rating?: number;
    reviews?: string[]; 
    isAvailable?: boolean;
}

interface EmployerData {
    name: string;
    email: string;
    password: string;
    address: string;
    phoneNumber: string;
    familySize?: number;
}
  
  
// Auth api
export const registerHousekeeper = (data: HousekeeperData) => {
    return api.post("/auth/register/housekeeper", data);
}

export const registerEmployer = (data: EmployerData) => {
    return api.post("/auth/register/employer", data);
}

export const login = (email: string, password: string, userType: string) => {
    return api.post("/auth/login", { email, password, userType });
}

// housekeeper api
export const getHousekeeper = (id: string) => {
    return api.get(`/housekeepers/${id}`);
}

export const getHousekeepers = (filters = {}) => {
    return api.get("/housekeepers", { params: filters });
}

export const updateHousekeeper = (id: string, data: Partial<HousekeeperData>) => {
    return api.put(`/housekeepers/${id}`, data);
}

export const deleteHousekeeper = (id: string) => {
    return api.delete(`/housekeepers/${id}`);
}

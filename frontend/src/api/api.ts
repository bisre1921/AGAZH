import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";


const API_URL = Platform.OS === "android"? "http://10.4.103.87:8080": "http://localhost:8080";

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
    return api.post("/api/v1/auth/register/housekeeper", data);
}

export const registerEmployer = (data: EmployerData) => {
    return api.post("/api/v1/auth/register/employer", data);
}

export const login = (email: string, password: string, user_type: string) => {
    return api.post("/api/v1/auth/login", { email, password, user_type });
}

// housekeeper api
export const getHousekeeper = (id: string) => {
    return api.get(`/api/v1/housekeepers/${id}`);
}

export const getHousekeepers = (filters = {}) => {
    return api.get("/api/v1/housekeepers", { params: filters });
}

export const updateHousekeeper = (id: string, data: Partial<HousekeeperData>) => {
    return api.put(`/api/v1/housekeepers/${id}`, data);
}

export const deleteHousekeeper = (id: string) => {
    return api.delete(`/api/v1/housekeepers/${id}`);
}

// employer api
export const getEmployer = (id: string) => {
    return api.get(`/api/v1/employers/${id}`);
}

// Review API
export const createReview = (data: any) => {
    return api.post('/api/v1/ratings', data);
};
  
export const getHousekeeperReviews = (id: string) => {
    return api.get(`/api/v1/ratings/housekeeper/${id}`);
};

// Hiring API
export const createHiring = (data: any) => {
    console.log(data)
    return api.post('/api/v1/hiring', data);
};
  
export const getHiringStatus = (id: string) => {
    return api.get(`/api/v1/hiring/${id}`);
};

export const getHiringHistory = (employer_id: string) => {
    return api.get(`/api/v1/hiring/employer/${employer_id}`)
}

export const updateHiringStatus = (id: string, data: any) => {
    return api.put(`/api/v1/hiring/${id}`, data);
};

export default api

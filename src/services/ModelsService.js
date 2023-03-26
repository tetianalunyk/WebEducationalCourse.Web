import AuthService from "./AuthService";

const baseUrl = 'https://localhost:44324/api/';
const authService = new AuthService();

export const modelsService = {
    getAllModels: async () => {
        const response = await fetch(baseUrl + 'models', {
            method: "get"
        });

        if (!response.ok) {
            throw new Error(response.status);
        }

        const result = await response.json();
        return result;
    },

    getAllTags: async () => {
        const response = await fetch(baseUrl + 'models/tags', {
            method: "get"
        });

        if (!response.ok) {
            throw new Error(response.status);
        }

        const result = await response.json();
        return result;
    },

    deleteModelById: async (data) => {
        const request = () => fetch(baseUrl + 'models/' + data, {
            method: "delete",
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        let response = await request();
        if (response.status === 401 && await authService.refreshHandler()) {
            // one more try:
            response = await request();
        }

        if (!response.ok) {
            throw new Error(response.status);
        }

        const result = await response.json();
        return result;
    },

    addNewTag: async (data) => {
        const request = () => fetch(baseUrl + 'models/tags', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(data)
        });

        let response = await request();
        if (response.status === 401 && await authService.refreshHandler()) {
            // one more try:
            response = await request();
        }

        if (!response.ok) {
            throw new Error(response.status);
        }

        const result = await response.json();
        return result;
    },

    updateModel: async (data) => {
        const request = () => fetch(baseUrl + 'models/' + data.id, {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(data)
        });

        let response = await request();
        if (response.status === 401 && await authService.refreshHandler()) {
            // one more try:
            response = await request();
        }

        if (!response.ok) {
            throw new Error(response.status);
        }

        const result = await response.json();
        return result;
    },

    createModel: async (data) => {
        const request = () => fetch(baseUrl + 'models/', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(data)
        });

        let response = await request();
        if (response.status === 401 && await authService.refreshHandler()) {
            // one more try:
            response = await request();
        }

        if (!response.ok) {
            throw new Error(response.status);
        }

        const result = await response.json();
        return result;
    }
}
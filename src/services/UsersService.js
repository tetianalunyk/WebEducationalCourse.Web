import AuthService from "./AuthService";

const baseUrl = 'https://localhost:44324/api/';
const authService = new AuthService();

export const usersService = {
    getAllUsers: async (data) => {
        const response = await fetch(baseUrl + 'users?' + new URLSearchParams({
            filter: data
        }), {
            method: "get"
        });

        if (!response.ok) {
            throw new Error(response.status);
        }

        const result = await response.json();
        return result;
    },

    getAllRoles: async () => {
        const response = await fetch(baseUrl + 'users/roles', {
            method: "get"
        });

        if (!response.ok) {
            throw new Error(response.status);
        }

        const result = await response.json();
        return result;
    },

    deleteUserById: async (data) => {
        const request = () => fetch(baseUrl + 'users/' + data, {
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

        return response;
    },

    addNewRole: async (data) => {
        const request = () => fetch(baseUrl + 'users/roles', {
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

    updateUser: async (data) => {
        const request = () => fetch(baseUrl + 'users/' + data.id, {
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

    createUser: async (data) => {
        const request = () => fetch(baseUrl + 'users/', {
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

    getUserById: async (id) => {
        const response = await fetch(baseUrl + 'users/' + id, {
            method: "get"
        });

        if (!response.ok) {
            throw new Error(response.status);
        }

        const result = await response.json();
        return result;
    }
}
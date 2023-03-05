const baseUrl = 'https://localhost:5001/api/';
const fileUrl = 'http://localhost:3000/';

export const usersService = {
    getAllUsers: async () => {
        const response = await fetch(baseUrl + 'users', {
            method: "get"
        });

        return response.json();
    },

    getAllRoles: async () => {
        const response = await fetch(baseUrl + 'users/roles', {
            method: "get"
        });

        return response.json();
    },

    deleteUserById: async (data) => {
        const response = await fetch(baseUrl + 'users/' + data, {
            method: "delete"
        });

        return response;
    },

    addNewRole: async (data) => {
        const response = await fetch(baseUrl + 'users/roles', {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        return response.json();
    },

    updateUser: async (data) => {
        debugger;
        const response = await fetch(baseUrl + 'users/' + data.id, {
            method: "put",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        return response.json();
    },

    createUser: async (data) => {
        const response = await fetch(baseUrl + 'users/', {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        return response.json();
    },

    addFile: async (data) => {
        const formData = new FormData();
        formData.append('file', data);

        const response = await fetch(fileUrl + 'files/', {
            method: "post",
            body: formData
        });

        return response.json();
    },

    updateFile: async (id, data) => {
        const formData = new FormData();
        formData.append('file', data);

        const response = await fetch(fileUrl + 'files/' + id, {
            method: "put",
            body: formData
        });

        return response.blob().then(res => URL.createObjectURL(res));
    },

    getFileById: async (id) => {
        const response = await fetch(fileUrl + 'files/' + id, {
            method: "GET",
        });

        return response.blob().then(res => URL.createObjectURL(res));
    },

    deleteFile: async (id) => {
        const response = await fetch(fileUrl + 'files/' + id, {
            method: "delete",
        });

        return response;
    }
}
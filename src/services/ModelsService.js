const baseUrl = 'https://localhost:5001/api/';
const fileUrl = 'http://localhost:3000/';

export const modelsService = {
    getAllModels: async () => {
        const response = await fetch(baseUrl + 'models', {
            method: "get"
        });

        return response.json();
    },

    getAllTags: async () => {
        const response = await fetch(baseUrl + 'models/tags', {
            method: "get"
        });

        return response.json();
    },

    deleteModelById: async (data) => {
        const response = await fetch(baseUrl + 'models/' + data, {
            method: "delete"
        });

        return response;
    },

    addNewTag: async (data) => {
        const response = await fetch(baseUrl + 'models/tags', {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        return response.json();
    },

    updateModel: async (data) => {
        const response = await fetch(baseUrl + 'models/' + data.id, {
            method: "put",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        return response.json();
    },

    createModel: async (data) => {
        const response = await fetch(baseUrl + 'models/', {
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

        return response.blob().then(res => (res));
    },

    deleteFile: async (id) => {
        const response = await fetch(fileUrl + 'files/' + id, {
            method: "delete",
        });

        return response;
    }
}
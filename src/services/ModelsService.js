const baseUrl = 'https://localhost:5001/api/';

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
    }
}
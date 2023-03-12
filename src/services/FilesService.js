const fileUrl = 'http://localhost:3000/';

export const filesService = {
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
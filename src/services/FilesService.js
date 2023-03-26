import AuthService from "./AuthService";

const fileUrl = 'https://localhost:3000/';
const authService = new AuthService();

export const filesService = {
    addFile: async (data) => {
        const formData = new FormData();
        formData.append('file', data);

        const utlToSign = fileUrl + 'files/';
        const signedUrl = await authService.signUrl(utlToSign);

        const response = await fetch(signedUrl.url, {
            method: "post",
            body: formData
        });

        if (!response.ok) {
            throw new Error(response.status);
        }

        const result = await response.json();
        return result;
    },

    updateFile: async (id, data) => {
        const formData = new FormData();
        formData.append('file', data);

        const utlToSign = fileUrl + 'files/' + id;
        const signedUrl = await authService.signUrl(utlToSign);

        const response = await fetch(signedUrl.url, {
            method: "put",
            body: formData
        });

        if (!response.ok) {
            throw new Error(response.status);
        }

        return response.blob().then(res => URL.createObjectURL(res));
    },

    getFileById: async (id) => {
        const response = await fetch(fileUrl + 'files/' + id, {
            method: "GET",
        });

        return response.blob().then(res => (res));
    },

    deleteFile: async (id) => {
        const utlToSign = fileUrl + 'files/' + id;
        const signedUrl = await authService.signUrl(utlToSign);

        const response = await fetch(signedUrl.url, {
            method: "delete",
        });

        if (!response.ok) {
            throw new Error(response.status);
        }

        return response;
    }
}
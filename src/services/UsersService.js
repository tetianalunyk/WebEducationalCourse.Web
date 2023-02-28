const baseUrl = 'https://localhost:5001/api/'

export const usersService = {
    getAllUsers: async () => {
        const response = await fetch(baseUrl + 'users', {
            method: "get"
        });

        return response.json();
    },

    deleteUserById: async (data) => {
        const response = await fetch(baseUrl + 'users/' + data, {
            method: "delete"
        });

        return response;
    }
}
import allUsers from "../../__mocks__/allUsers"
import allRoles from "../../__mocks__/allRoles";

export const usersService = {
    getAllUsers: async () => {
        return Promise.resolve(allUsers);
    },

    getAllRoles: async () => {
        return Promise.resolve(allRoles);
    },

    deleteUserById: async (data) => {
        return Promise.resolve({});
    },

    addNewRole: async (data) => {
        return Promise.resolve({});
    },

    updateUser: async (data) => {
        return Promise.resolve({});
    },

    createUser: async (data) => {
        return Promise.resolve({});
    }
}
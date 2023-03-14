import allModels from "../../__mocks__/allModels"
import allTags from "../../__mocks__/allTags";

export const modelsService = {
    getAllModels: async () => {
        return Promise.resolve(allModels);
    },

    getAllTags: async () => {
        return Promise.resolve(allTags);
    },

    deleteModelById: async (data) => {
        return Promise.resolve({});
    },

    addNewTag: async (data) => {
        return Promise.resolve({});
    },

    updateModel: async (data) => {
        return Promise.resolve({});
    },

    createModel: async (data) => {
        return Promise.resolve({});
    }
}
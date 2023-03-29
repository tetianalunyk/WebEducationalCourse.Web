const baseUrl = 'https://localhost:44324/api/auth';
const user = {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    userId: 'testId'
};

export default class authService {
    login = async (data) => {
        return Promise.resolve(user);
    }

    refreshHandler = async () => {
        return Promise.resolve(true);
    }

    signUrl = async (url) => {
        return Promise.resolve(url);
    }
}
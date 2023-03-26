const baseUrl = 'https://localhost:44324/api/auth';

export default class authService {
    login = async (data) => {
        const request = () => fetch(baseUrl + '/get-token/', {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const response = await request();
        if (!response.ok) {
            return response.status;
        }

        const result = await response.json();
        return result;
    }

    refreshHandler = async () => {
        localStorage.removeItem('accessToken');
        let response = await fetch(baseUrl + '/refresh-token/', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                refreshToken: localStorage.getItem('refreshToken')
            })
        });

        if (!response.ok) {
            return false;
        }

        let rest = await response.json();
        localStorage.setItem('accessToken', rest.accessToken);

        return true;
    }

    signUrl = async (url) => {
        const token = localStorage.getItem('accessToken');
        const request = () => fetch(baseUrl + '/sign-file-storage-url/', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                url: url
            })
        });

        let response = await request();
        if (response.status === 401 && await this.refreshHandler()) {
            // one more try:
            response = await request();
        }

        if (!response.ok) {
            throw new Error(response.status);
        }

        const result = await response.json();
        return result;
    }
}
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}`;

export async function doApiLogin(wallet: string, secret: string, timestamp: number){

    const response = await axios.post(`${API_URL}/login`, {wallet, secret, timestamp});
    return response.data.token;

}
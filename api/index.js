const API_KEY = '44282402-b8477ef4a5ad27450c4e83e83'
const apiUrl = `https://pixabay.com/api/?key=${API_KEY}`;

import axios from 'axios'

const formatUrl = (params) => {
    let url = apiUrl + '&per_page=25&safesearch=true&editors_choice=true'
    if (!params) return url;
    let paramKeys = Object.keys(params);
    paramKeys.map(key => {
        let value = key == 'q' ? encodeURIComponent(params[key]) : params[key];
        url += `&${key}=${value}`;
    });
    console.log(url)
    return url;
}

export const apiCall = async (params) => {
    try {
        const response = await axios.get(formatUrl(params))
        const { data } = response;
        return { success: true, data };
    } catch (error) {
        console.log(error)
    }
}
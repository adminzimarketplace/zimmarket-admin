import axios from 'axios';
const api=axios.create({baseURL:process.env.REACT_APP_API_URL||'http://localhost:5000/api/v1'});
api.interceptors.request.use(c=>{const t=localStorage.getItem('accessToken');if(t)c.headers.Authorization='Bearer '+t;return c;});
api.interceptors.response.use(r=>r,async e=>{const o=e.config;if(e.response?.status===401&&!o._retry){o._retry=true;try{const ref=localStorage.getItem('refreshToken');const{data}=await axios.post((process.env.REACT_APP_API_URL||'http://localhost:5000/api/v1')+'/auth/refresh',{refreshToken:ref});localStorage.setItem('accessToken',data.accessToken);localStorage.setItem('refreshToken',data.refreshToken);o.headers.Authorization='Bearer '+data.accessToken;return api(o);}catch{localStorage.clear();window.location.href='/login';}}return Promise.reject(e);});
export default api;

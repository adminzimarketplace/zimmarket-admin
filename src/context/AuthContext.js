import React,{createContext,useContext,useState,useEffect}from 'react';
import api from '../utils/api';
const AuthContext=createContext();
export const AuthProvider=({children})=>{
  const[user,setUser]=useState(null);const[loading,setLoading]=useState(true);
  useEffect(()=>{const s=localStorage.getItem('user');if(s)setUser(JSON.parse(s));setLoading(false);},[]);
  const login=async(phone,password)=>{const{data}=await api.post('/auth/login',{phone,password});if(data.user.role!=='ADMIN')throw new Error('Not an admin account');localStorage.setItem('accessToken',data.accessToken);localStorage.setItem('refreshToken',data.refreshToken);localStorage.setItem('user',JSON.stringify(data.user));setUser(data.user);return data;};
  const logout=()=>{localStorage.clear();setUser(null);window.location.href='/login';};
  return<AuthContext.Provider value={{user,login,logout,loading}}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>useContext(AuthContext);

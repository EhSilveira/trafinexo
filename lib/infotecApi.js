export const SUPABASE_URL="https://ztcrpptenaenzikgvqez.supabase.co";
export const SUPABASE_KEY="sb_publishable_G5uhAYCnBtiM4ftqOWuA_A_dZRy79Z8";
const TOKEN_KEY="trafinexo_access_token";
const REFRESH_KEY="trafinexo_refresh_token";
const USER_KEY="trafinexo_user";

export function saveSession(data){if(typeof window==="undefined")return;if(data?.access_token)localStorage.setItem(TOKEN_KEY,data.access_token);if(data?.refresh_token)localStorage.setItem(REFRESH_KEY,data.refresh_token);if(data?.user)localStorage.setItem(USER_KEY,JSON.stringify(data.user));}
export function clearSession(){if(typeof window==="undefined")return;localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(REFRESH_KEY);localStorage.removeItem(USER_KEY);}
export function getToken(){return typeof window==="undefined"?"":localStorage.getItem(TOKEN_KEY)||"";}
export function getStoredUser(){if(typeof window==="undefined")return null;try{return JSON.parse(localStorage.getItem(USER_KEY)||"null")}catch{return null}}

export async function signIn(email,password){const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})});const data=await r.json();if(!r.ok)throw new Error(data?.msg||data?.error_description||"Não foi possível entrar");saveSession(data);return data;}
export async function signUp({name,email,password}){const r=await fetch(`${SUPABASE_URL}/auth/v1/signup`,{method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password,data:{full_name:name,product:"trafinexo",trial_days:15}})});const data=await r.json();if(!r.ok)throw new Error(data?.msg||data?.error_description||"Não foi possível criar a conta");saveSession(data);return data;}
export async function currentUser(){const token=getToken();if(!token)return null;const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`}});if(!r.ok){clearSession();return null}const user=await r.json();if(typeof window!=="undefined")localStorage.setItem(USER_KEY,JSON.stringify(user));return user;}
export async function rest(path,{method="GET",body,prefer}={}){const token=getToken();if(!token)throw new Error("Sessão expirada");const headers={apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json"};if(prefer)headers.Prefer=prefer;const r=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});if(r.status===401||r.status===403){clearSession();throw new Error("Sessão sem autorização")};if(!r.ok){let message="Erro ao acessar os dados";try{const d=await r.json();message=d?.message||d?.hint||message}catch{}throw new Error(message)}if(r.status===204)return null;const text=await r.text();return text?JSON.parse(text):null;}

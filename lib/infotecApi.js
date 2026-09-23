const SOURCE_SUPABASE_URL="https://ztcrpptenaenzikgvqez.supabase.co";
const SOURCE_SUPABASE_KEY="sb_publishable_G5uhAYCnBtiM4ftqOWuA_A_dZRy79Z8";
const DEDICATED_SUPABASE_URL=String(process.env.NEXT_PUBLIC_TRAFINEXO_SUPABASE_URL||"").trim();
const DEDICATED_SUPABASE_KEY=String(process.env.NEXT_PUBLIC_TRAFINEXO_SUPABASE_PUBLISHABLE_KEY||"").trim();

export const USING_DEDICATED_SUPABASE=Boolean(
  DEDICATED_SUPABASE_URL&&
  DEDICATED_SUPABASE_KEY&&
  DEDICATED_SUPABASE_URL.includes("vvjngcsftiffdsjwpjct")
);
export const SUPABASE_URL=USING_DEDICATED_SUPABASE?DEDICATED_SUPABASE_URL:SOURCE_SUPABASE_URL;
export const SUPABASE_KEY=USING_DEDICATED_SUPABASE?DEDICATED_SUPABASE_KEY:SOURCE_SUPABASE_KEY;

const TOKEN_KEY="trafinexo_access_token";
const REFRESH_KEY="trafinexo_refresh_token";
const USER_KEY="trafinexo_user";
const LEGAL_VERSION="2026-09-04";

export function saveSession(data){if(typeof window==="undefined")return;const session=data?.session||data;if(session?.access_token)localStorage.setItem(TOKEN_KEY,session.access_token);if(session?.refresh_token)localStorage.setItem(REFRESH_KEY,session.refresh_token);if(data?.user||session?.user)localStorage.setItem(USER_KEY,JSON.stringify(data?.user||session?.user));}
export function clearSession(){if(typeof window==="undefined")return;localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(REFRESH_KEY);localStorage.removeItem(USER_KEY);}
export function getToken(){return typeof window==="undefined"?"":localStorage.getItem(TOKEN_KEY)||"";}
export function getRefreshToken(){return typeof window==="undefined"?"":localStorage.getItem(REFRESH_KEY)||"";}
export function getStoredUser(){if(typeof window==="undefined")return null;try{return JSON.parse(localStorage.getItem(USER_KEY)||"null")}catch{return null}}

export async function refreshSession(){const refreshToken=getRefreshToken();if(!refreshToken){clearSession();return null}const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:refreshToken})});const data=await r.json().catch(()=>({}));if(!r.ok||!data?.access_token){clearSession();return null}saveSession(data);return data;}

async function authenticatedFetch(url,options={},retry=true){let token=getToken();if(!token){const refreshed=await refreshSession();token=refreshed?.access_token||""}if(!token)return null;const headers={...(options.headers||{}),apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`};let r=await fetch(url,{...options,headers});if(retry&&(r.status===401||r.status===403)){const refreshed=await refreshSession();if(refreshed?.access_token){r=await fetch(url,{...options,headers:{...headers,Authorization:`Bearer ${refreshed.access_token}`}})}}return r;}

export async function ensureWorkspace(){const token=getToken();if(!token)return null;const r=await authenticatedFetch(`${SUPABASE_URL}/functions/v1/traf-bootstrap-workspace`,{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});if(!r)throw new Error("Sessão expirada");const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data?.message||"Não foi possível preparar seu workspace.");return data;}

export async function signIn(email,password){
  const normalized=String(email||"").trim().toLowerCase();

  if(USING_DEDICATED_SUPABASE){
    const direct=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{
      method:"POST",
      headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},
      body:JSON.stringify({email:normalized,password})
    });
    const directData=await direct.json().catch(()=>({}));
    if(direct.ok&&directData?.access_token){
      saveSession(directData);
      await ensureWorkspace();
      return directData;
    }

    const source=await fetch(`${SOURCE_SUPABASE_URL}/functions/v1/factory-auth-login`,{
      method:"POST",
      headers:{apikey:SOURCE_SUPABASE_KEY,"Content-Type":"application/json"},
      body:JSON.stringify({email:normalized,password,product_slug:"trafinexo"})
    });
    const sourceData=await source.json().catch(()=>({}));
    const sourceToken=sourceData?.session?.access_token||sourceData?.access_token;
    if(!source.ok||!sourceToken)throw new Error(sourceData?.message||"Não foi possível entrar");

    const handoff=await fetch(`${SUPABASE_URL}/functions/v1/saas-auth-handoff`,{
      method:"POST",
      headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${sourceToken}`,"Content-Type":"application/json"},
      body:JSON.stringify({product:"trafinexo"})
    });
    const migrated=await handoff.json().catch(()=>({}));
    if(!handoff.ok||!migrated?.action_link)throw new Error(migrated?.error||"Não foi possível migrar sua sessão.");
    if(typeof window!=="undefined")window.location.assign(migrated.action_link);
    return {migrated:true};
  }

  const r=await fetch(`${SOURCE_SUPABASE_URL}/functions/v1/factory-auth-login`,{
    method:"POST",
    headers:{apikey:SOURCE_SUPABASE_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({email:normalized,password,product_slug:"trafinexo"})
  });
  const data=await r.json();
  if(!r.ok)throw new Error(data?.message||"Não foi possível entrar");
  saveSession(data);
  await ensureWorkspace();
  return data;
}

export async function signUp({name,email,password,legalAccepted=false}){if(!legalAccepted)throw new Error("Aceite os Termos de Uso e a Política de Privacidade para continuar.");const r=await fetch(`${SUPABASE_URL}/auth/v1/signup`,{method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password,data:{full_name:name,product:"trafinexo",trial_days:15,legal_version:LEGAL_VERSION,terms_accepted:true,privacy_accepted:true,legal_accepted_at:new Date().toISOString()}})});const data=await r.json();if(!r.ok)throw new Error(data?.msg||data?.error_description||"Não foi possível criar a conta");saveSession(data);if(getToken())await ensureWorkspace();return data;}
export async function requestPasswordReset(email){const redirect=`https://trafinexo.useinfotec.com.br/recuperar-senha`;const r=await fetch(`${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(redirect)}`,{method:"POST",headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},body:JSON.stringify({email:String(email||'').trim().toLowerCase()})});if(!r.ok&&r.status!==429)throw new Error("Não foi possível solicitar a recuperação agora.");return true;}
export async function updatePasswordWithRecoveryToken(accessToken,password){const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{method:"PUT",headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${accessToken}`,"Content-Type":"application/json"},body:JSON.stringify({password})});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data?.msg||data?.message||"Link inválido ou expirado.");return data;}
export async function currentUser(){let r=await authenticatedFetch(`${SUPABASE_URL}/auth/v1/user`,{},true);if(!r||!r.ok){clearSession();return null}const user=await r.json();if(typeof window!=="undefined")localStorage.setItem(USER_KEY,JSON.stringify(user));await ensureWorkspace();return user;}
export async function rest(path,{method="GET",body,prefer}={}){const headers={"Content-Type":"application/json"};if(prefer)headers.Prefer=prefer;const r=await authenticatedFetch(`${SUPABASE_URL}/rest/v1/${path}`,{method,headers,body:body===undefined?undefined:JSON.stringify(body)},true);if(!r)throw new Error("Sessão expirada");if(r.status===401||r.status===403){clearSession();throw new Error("Sessão sem autorização")};if(!r.ok){let message="Erro ao acessar os dados";try{const d=await r.json();message=d?.message||d?.hint||message}catch{}throw new Error(message)}if(r.status===204)return null;const text=await r.text();return text?JSON.parse(text):null;}
export async function invoke(name,body={}){const r=await authenticatedFetch(`${SUPABASE_URL}/functions/v1/${name}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)},true);if(!r)throw new Error("Sessão expirada");const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data?.message||"Não foi possível concluir esta ação.");return data;}

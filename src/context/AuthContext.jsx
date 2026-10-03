import {createContext,useContext,useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';
const Ctx=createContext(null);export const useAuth=()=>useContext(Ctx);
export function AuthProvider({children}){
  const [session,setSession]=useState(null),[isAdmin,setAdmin]=useState(false),[loading,setLoading]=useState(true);
  useEffect(()=>{
    const check=async s=>{setSession(s);
      if(!s){setAdmin(false);setLoading(false);return}
      const {data}=await supabase.from('profiles').select('role').eq('user_id',s.user.id).maybeSingle();
      setAdmin(data?.role==='admin');setLoading(false)};
    supabase.auth.getSession().then(({data})=>check(data.session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{setTimeout(()=>check(s),0)});
    return()=>subscription.unsubscribe();
  },[]);
  const value={session,isAdmin,loading,
    signIn:(email,password)=>supabase.auth.signInWithPassword({email,password}).then(r=>{if(r.error)throw r.error}),
    signOut:()=>supabase.auth.signOut(),
    resetPassword:email=>supabase.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/admin/reset`}).then(r=>{if(r.error)throw r.error}),
    updatePassword:password=>supabase.auth.updateUser({password}).then(r=>{if(r.error)throw r.error})};
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

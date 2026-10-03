import {createContext,useContext,useState,useCallback} from 'react';
const T=createContext(()=>{});export const useToast=()=>useContext(T);
export function ToastProvider({children}){
  const [items,set]=useState([]);
  const push=useCallback((msg,type='ok')=>{const id=Math.random();set(a=>[...a,{id,msg,type}]);setTimeout(()=>set(a=>a.filter(x=>x.id!==id)),4000)},[]);
  return <T.Provider value={push}>{children}
    <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-50 space-y-2">
      {items.map(i=><div key={i.id} className={`rounded-md px-4 py-2 text-white shadow ${i.type==='err'?'bg-red-700':'bg-olive'}`}>{i.msg}</div>)}</div></T.Provider>;
}

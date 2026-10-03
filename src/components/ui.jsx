import {useEffect,useState,useCallback} from 'react';
export function useAsync(fn,deps=[]){
  const [s,set]=useState({data:null,error:null,loading:true});
  const run=useCallback(()=>{set(x=>({...x,loading:true,error:null}));fn().then(data=>set({data,error:null,loading:false})).catch(error=>set({data:null,error,loading:false}))},deps);// eslint-disable-line
  useEffect(run,[run]);return {...s,reload:run};
}
export const Loading=()=><p role="status" className="p-8 text-center text-ink/60">Loading…</p>;
export const ErrorBox=({error})=><p role="alert" className="rounded-md bg-red-50 p-4 text-red-800">Something went wrong: {error.message}</p>;
export const Empty=({children})=><p className="rounded-md border border-dashed border-ink/30 p-8 text-center text-ink/60">{children}</p>;
export function State({q,empty,children}){
  if(q.loading)return <Loading/>;if(q.error)return <ErrorBox error={q.error}/>;
  if(!q.data||(Array.isArray(q.data)&&!q.data.length))return <Empty>{empty}</Empty>;return children(q.data);
}
export const Section=({title,children,className=''})=><section className={`mx-auto max-w-6xl px-4 py-12 ${className}`}>{title&&<h2 className="mb-6 text-3xl">{title}</h2>}{children}</section>;
export const Img=({src,alt=''})=>src?<img src={src} alt={alt} loading="lazy" className="h-48 w-full rounded-md object-cover"/>:null;
export const fmtDate=d=>d?new Date(d+'T00:00:00').toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}):'';
const reg=/^https:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)([\w-]+)/;
export function embedUrl(u=''){const m=u.match(reg);if(!m)return null;return m[1].includes('vimeo')?`https://player.vimeo.com/video/${m[2]}`:`https://www.youtube.com/embed/${m[2]}`}
export const safeUrl=u=>/^https?:\/\//.test(u||'')?u:null;

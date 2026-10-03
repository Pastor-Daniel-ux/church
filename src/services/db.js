import {supabase} from '../lib/supabase';
const ok=({data,error})=>{if(error)throw error;return data};
export const list=(t,{by='created_at',asc=false}={})=>supabase.from(t).select('*').order(by,{ascending:asc}).then(ok);
export const get=(t,id)=>supabase.from(t).select('*').eq('id',id).single().then(ok);
export const create=(t,v)=>supabase.from(t).insert(v).select().single().then(ok);
export const update=(t,id,v)=>supabase.from(t).update(v).eq('id',id).select().single().then(ok);
export const remove=(t,id)=>supabase.from(t).delete().eq('id',id).then(ok);
export const submit=(t,v)=>supabase.from(t).insert(v).then(ok); // insert-only for anon (no select under RLS)
export const getSettings=()=>supabase.from('church_settings').select('*').eq('id',1).single().then(ok);
export const saveSettings=v=>supabase.from('church_settings').update({...v,updated_at:new Date().toISOString()}).eq('id',1).select().single().then(ok);
export const count=t=>supabase.from(t).select('*',{count:'exact',head:true}).then(r=>{if(r.error)throw r.error;return r.count});
export async function upload(bucket,file){
  if(!file.type.startsWith('image/')||file.size>5e6)throw new Error('Choose an image under 5 MB.');
  const path=`${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g,'_')}`;
  const {error}=await supabase.storage.from(bucket).upload(path,file);if(error)throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

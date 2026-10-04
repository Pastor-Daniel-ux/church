import {useState} from 'react';import {Navigate,useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';import {useToast} from '../context/Toast';
import {list,create,update,remove,upload,count,getSettings,saveSettings} from '../services/db';
import {useAsync,State,Loading} from '../components/ui';

export function Login(){
  const {signIn,resetPassword,session,isAdmin}=useAuth(),toast=useToast(),[f,setF]=useState({email:'',password:''});
  if(session&&isAdmin)return <Navigate to="/admin" replace/>;
  const go=async e=>{e.preventDefault();try{await signIn(f.email,f.password)}catch(x){toast(x.message,'err')}};
  const reset=async()=>{if(!f.email)return toast('Enter your email first.','err');try{await resetPassword(f.email);toast('Check your email for a reset link.')}catch(x){toast(x.message,'err')}};
  return <form onSubmit={go} className="card mx-auto my-16 max-w-sm space-y-3"><h1 className="text-2xl">Staff login</h1>
    <label className="block">Email<input required type="email" className="input" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></label>
    <label className="block">Password<input required type="password" className="input" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/></label>
    <button className="btn w-full">Log in</button><button type="button" onClick={reset} className="text-sm underline">Forgot password?</button></form>;
}
export function Reset(){
  const {updatePassword}=useAuth(),toast=useToast(),nav=useNavigate(),[p,setP]=useState('');
  const go=async e=>{e.preventDefault();if(p.length<8)return toast('Use at least 8 characters.','err');try{await updatePassword(p);toast('Password updated.');nav('/admin')}catch(x){toast(x.message,'err')}};
  return <form onSubmit={go} className="card mx-auto my-16 max-w-sm space-y-3"><h1 className="text-2xl">New password</h1><input type="password" required className="input" aria-label="New password" value={p} onChange={e=>setP(e.target.value)}/><button className="btn w-full">Save password</button></form>;
}
const pub={k:'published',l:'Published',t:'bool'};
const SECTIONS={
  sermons:{table:'sermons',by:'sermon_date',bucket:'sermon-images',title:'title',fields:[{k:'title',l:'Title',req:1},{k:'speaker',l:'Speaker'},{k:'scripture',l:'Scripture'},{k:'sermon_date',l:'Date',t:'date'},{k:'category',l:'Category'},{k:'video_url',l:'YouTube/Vimeo URL'},{k:'audio_url',l:'Audio URL'},{k:'thumbnail_url',l:'Thumbnail',t:'image'},{k:'description',l:'Description',t:'area'},pub]},
  events:{table:'events',by:'event_date',bucket:'event-images',title:'title',fields:[{k:'title',l:'Title',req:1},{k:'event_date',l:'Date',t:'date',req:1},{k:'start_time',l:'Start',t:'time'},{k:'end_time',l:'End',t:'time'},{k:'location',l:'Location'},{k:'registration_url',l:'Registration URL'},{k:'image_url',l:'Image',t:'image'},{k:'description',l:'Description',t:'area'},pub]},
  ministries:{table:'ministries',by:'name',bucket:'ministry-images',title:'name',fields:[{k:'name',l:'Name',req:1},{k:'meeting_time',l:'Meeting schedule'},{k:'contact_email',l:'Contact email',t:'email'},{k:'image_url',l:'Image',t:'image'},{k:'description',l:'Description',t:'area'},pub]},
  leaders:{table:'leaders',by:'created_at',bucket:'leader-images',title:'name',fields:[{k:'name',l:'Name',req:1},{k:'position',l:'Position'},{k:'image_url',l:'Photo',t:'image'},{k:'biography',l:'Biography',t:'area'},{k:'social_links',l:'Social links',t:'json'},pub]},
};
function Field({f,v,set,bucket}){
  const toast=useToast(),[busy,setBusy]=useState(false);const id='f-'+f.k;
  if(f.t==='bool')return <label className="flex gap-2"><input type="checkbox" checked={!!v} onChange={e=>set(e.target.checked)}/>{f.l}</label>;
  if(f.t==='image')return <div><label htmlFor={id}>{f.l}</label>{v&&<img src={v} alt="" className="my-1 h-20 rounded"/>}
    <input id={id} type="file" accept="image/*" className="block" onChange={async e=>{const file=e.target.files[0];if(!file)return;setBusy(true);try{set(await upload(bucket,file));toast('Image uploaded.')}catch(x){toast(x.message,'err')}setBusy(false)}}/>{busy&&<span>Uploading…</span>}</div>;
  const P={id,className:'input',required:!!f.req};
  return <div><label htmlFor={id}>{f.l}</label>{f.t==='area'?<textarea rows="4" {...P} value={v||''} onChange={e=>set(e.target.value)}/>
    :f.t==='json'?<input {...P} placeholder='{"facebook":"https://..."}' value={typeof v==='string'?v:JSON.stringify(v||{})} onChange={e=>set(e.target.value)}/>
    :<input type={f.t||'text'} {...P} value={v||''} onChange={e=>set(e.target.value)}/>}</div>;
}
function Crud({cfg}){
  const toast=useToast(),q=useAsync(()=>list(cfg.table,{by:cfg.by,asc:cfg.by==='name'}),[cfg.table]),[ed,setEd]=useState(null);
  const save=async e=>{e.preventDefault();const row={...ed};delete row.created_at;
    try{cfg.fields.filter(f=>f.t==='json').forEach(f=>{if(typeof row[f.k]==='string')row[f.k]=JSON.parse(row[f.k]||'{}')});
      cfg.fields.forEach(f=>{if(row[f.k]==='')row[f.k]=null});
      if(row.id){const id=row.id;delete row.id;await update(cfg.table,id,row)}else{delete row.id;await create(cfg.table,row)}
      toast('Saved.');setEd(null);q.reload()}catch(x){toast(x.message||'Check the form values.','err')}};
  const del=async r=>{if(!confirm(`Delete "${r[cfg.title]}"?`))return;try{await remove(cfg.table,r.id);toast('Deleted.');q.reload()}catch(x){toast(x.message,'err')}};
  if(ed)return <form onSubmit={save} className="card space-y-3">{cfg.fields.map(f=><Field key={f.k} f={f} v={ed[f.k]} bucket={cfg.bucket} set={v=>setEd({...ed,[f.k]:v})}/>)}
    <div className="flex gap-2"><button className="btn">Save</button><button type="button" className="btn btn-alt" onClick={()=>setEd(null)}>Cancel</button></div></form>;
  return <div><button className="btn mb-4" onClick={()=>setEd({published:true})}>Add new</button>
    <State q={q} empty="Nothing here yet. Add your first item.">{d=><ul className="space-y-2">{d.map(r=><li key={r.id} className="card flex items-center justify-between"><span>{r[cfg.title]}{r.published===false&&' (draft)'}</span>
      <span className="flex gap-2"><button className="btn btn-alt" onClick={()=>setEd({...r,...Object.fromEntries(cfg.fields.filter(f=>f.t==='json').map(f=>[f.k,JSON.stringify(r[f.k]||{})]))})}>Edit</button><button className="btn btn-alt" onClick={()=>del(r)}>Delete</button></span></li>)}</ul>}</State></div>;
}
function Inbox({table,statuses}){
  const toast=useToast(),q=useAsync(()=>list(table),[table]);
  return <State q={q} empty="No messages yet.">{d=><ul className="space-y-2">{d.map(r=><li key={r.id} className="card"><p className="font-medium">{r.anonymous?'Anonymous':r.name||'No name'} {r.email&&`· ${r.email}`} {r.phone&&`· ${r.phone}`}</p>
    <p className="whitespace-pre-line">{r.request||r.message}</p><div className="mt-2 flex gap-2">
      {statuses&&<select aria-label="Status" className="input w-auto" value={r.status} onChange={async e=>{try{await update(table,r.id,{status:e.target.value});q.reload()}catch(x){toast(x.message,'err')}}}>{statuses.map(s=><option key={s}>{s}</option>)}</select>}
      <button className="btn btn-alt" onClick={async()=>{if(!confirm('Delete?'))return;try{await remove(table,r.id);q.reload()}catch(x){toast(x.message,'err')}}}>Delete</button></div></li>)}</ul>}</State>;
}
const SET=[['church_name','Church name'],['tagline','Tagline'],['hero_url','Hero image','image'],['logo_url','Logo','image'],['welcome_message','Welcome message','area'],['verse','Verse of the day','area'],['service_times','Service times'],['address','Address'],['phone','Phone'],['email','Email'],['map_embed_url','Google Maps embed URL'],['history','History','area'],['mission','Mission','area'],['vision','Vision','area'],['faith','Statement of faith','area'],['parking','Parking','area'],['expect','What to expect','area'],['kids',"Children's ministry",'area'],['social_links','Social links (JSON)','json']];
function Settings(){
  const toast=useToast(),q=useAsync(getSettings),[v,setV]=useState(null);const d=v||q.data;
  if(q.loading)return <Loading/>;if(!d)return null;
  const save=async e=>{e.preventDefault();try{const o={...d};delete o.id;delete o.updated_at;o.social_links=typeof o.social_links==='string'?JSON.parse(o.social_links||'{}'):o.social_links;await saveSettings(o);toast('Saved.')}catch(x){toast(x.message||'Invalid JSON.','err')}};
  return <form onSubmit={save} className="card space-y-3">{SET.map(([k,l,t])=><Field key={k} f={{k,l,t}} bucket="church-assets" v={d[k]} set={x=>setV({...d,[k]:x})}/>)}<button className="btn">Save changes</button></form>;
}
function Users(){
  const toast=useToast(),q=useAsync(()=>list('profiles'));
  return <><p className="mb-3 text-sm">New admins: create the user in Supabase Auth, then set their role here.</p><State q={q} empty="No users.">{d=><ul className="space-y-2">{d.map(p=><li key={p.id} className="card flex items-center justify-between"><span>{p.email}</span>
    <select aria-label="Role" className="input w-auto" value={p.role} onChange={async e=>{try{await update('profiles',p.id,{role:e.target.value});toast('Role updated.');q.reload()}catch(x){toast(x.message,'err')}}}><option>user</option><option>admin</option></select></li>)}</ul>}</State></>;
}
function Overview(){
  const q=useAsync(()=>Promise.all(['sermons','events','ministries','leaders','prayer_requests','contact_messages','donations'].map(async t=>[t,await count(t)])));
  return <State q={q} empty="">{d=><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">{d.map(([t,n])=><div key={t} className="card"><p className="text-3xl font-serif">{n}</p><p>{t.replace('_',' ')}</p></div>)}</div>}</State>;
}
const TABS=['Overview','Sermons','Events','Ministries','Leaders','Prayer requests','Messages','Church info','Users'];
export default function Dashboard(){
  const {signOut}=useAuth(),[tab,setTab]=useState('Overview');
  return <div className="mx-auto max-w-6xl px-4 py-8"><div className="mb-4 flex items-center justify-between"><h1 className="text-3xl">Admin</h1><button className="btn btn-alt" onClick={signOut}>Log out</button></div>
    <nav aria-label="Admin" className="mb-6 flex flex-wrap gap-2">{TABS.map(t=><button key={t} aria-current={t===tab} onClick={()=>setTab(t)} className={`btn ${t===tab?'':'btn-alt'}`}>{t}</button>)}</nav>
    {tab==='Overview'&&<Overview/>}{SECTIONS[tab.toLowerCase()]&&<Crud key={tab} cfg={SECTIONS[tab.toLowerCase()]}/>}
    {tab==='Prayer requests'&&<Inbox table="prayer_requests" statuses={['New','In progress','Prayed for']}/>}{tab==='Messages'&&<Inbox table="contact_messages"/>}
    {tab==='Church info'&&<Settings/>}{tab==='Users'&&<Users/>}</div>;
}

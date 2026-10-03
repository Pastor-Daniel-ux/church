import {useState} from 'react';import {Link,useParams} from 'react-router-dom';
import {list,get,getSettings,submit} from '../services/db';
import {useAsync,State,Section,Img,fmtDate,embedUrl,safeUrl,Loading,ErrorBox} from '../components/ui';
import {useToast} from '../context/Toast';
const today=()=>new Date().toISOString().slice(0,10);
const useS=()=>useAsync(getSettings);
const Page=({title,children})=>{document.title=title;return <>{children}</>};
const EventCard=e=><article key={e.id} className="card"><Img src={e.image_url} alt=""/><h3 className="mt-3 text-xl"><Link to={`/events/${e.id}`} className="hover:underline">{e.title}</Link></h3>
  <p className="text-sm text-ink/70">{fmtDate(e.event_date)} {e.start_time?.slice(0,5)||''} {e.location&&`· ${e.location}`}</p></article>;
const SermonCard=s=><article key={s.id} className="card"><Img src={s.thumbnail_url} alt=""/><h3 className="mt-3 text-xl"><Link to={`/sermons/${s.id}`} className="hover:underline">{s.title}</Link></h3>
  <p className="text-sm text-ink/70">{s.speaker} {s.scripture&&`· ${s.scripture}`} · {fmtDate(s.sermon_date)}</p></article>;
const Grid=({children})=><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;

export function Home(){
  const s=useS(),ev=useAsync(()=>list('events',{by:'event_date',asc:true}).then(r=>r.filter(e=>e.event_date>=today()).slice(0,3))),
    se=useAsync(()=>list('sermons',{by:'sermon_date'}).then(r=>r.slice(0,3))),mi=useAsync(()=>list('ministries').then(r=>r.slice(0,3)));
  const c=s.data||{};
  return <Page title={c.church_name||'Church'}>
    <div className="relative bg-ink text-white" style={c.hero_url?{backgroundImage:`linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),url(${c.hero_url})`,backgroundSize:'cover',backgroundPosition:'center'}:{}}>
      <div className="mx-auto max-w-6xl px-4 py-24 md:py-36"><h1 className="max-w-2xl text-4xl md:text-6xl">{c.church_name}</h1><p className="mt-4 max-w-xl text-lg text-white/85">{c.tagline}</p>
        <Link to="/visit" className="btn mt-8 bg-gold hover:bg-gold/90">Join us this Sunday</Link></div></div>
    <Section title="Join us this Sunday"><p className="text-lg">{c.service_times}</p><p className="mt-2 max-w-2xl">{c.welcome_message}</p></Section>
    {c.verse&&<Section><blockquote className="card text-xl font-serif">{c.verse}</blockquote></Section>}
    <Section title="Upcoming events"><State q={ev} empty="No upcoming events yet. Check back soon.">{d=><Grid>{d.map(EventCard)}</Grid>}</State></Section>
    <Section title="Latest sermons"><State q={se} empty="No sermons posted yet.">{d=><Grid>{d.map(SermonCard)}</Grid>}</State></Section>
    <Section title="Ministries"><State q={mi} empty="Ministries coming soon.">{d=><Grid>{d.map(m=><article key={m.id} className="card"><h3 className="text-xl">{m.name}</h3><p className="line-clamp-3">{m.description}</p></article>)}</Grid>}</State>
      <Link to="/ministries" className="btn btn-alt mt-4">See all ministries</Link></Section>
    <Section className="text-center"><h2 className="text-3xl">New here? We saved you a seat.</h2><div className="mt-5 flex justify-center gap-3"><Link to="/visit" className="btn">Plan your visit</Link><Link to="/give" className="btn btn-alt">Give online</Link></div></Section>
    <Section title="Find us"><address className="not-italic">{c.address}<br/>{c.phone} · {c.email}</address></Section></Page>;
}
export function About(){
  const s=useS(),l=useAsync(()=>list('leaders',{by:'created_at',asc:true}));
  return <Page title="About us"><Section title="About us"><State q={s} empty="">{c=><div className="space-y-6">
    {[['Our history','history'],['Mission','mission'],['Vision','vision'],['Statement of faith','faith']].map(([t,k])=>c[k]&&<div key={k}><h3 className="text-2xl">{t}</h3><p className="whitespace-pre-line">{c[k]}</p></div>)}</div>}</State></Section>
    <Section title="Leadership"><State q={l} empty="Leadership profiles coming soon.">{d=><Grid>{d.map(p=><article key={p.id} className="card"><Img src={p.image_url} alt={p.name}/><h3 className="mt-3 text-xl">{p.name}</h3><p className="text-olive">{p.position}</p><p className="mt-2 whitespace-pre-line">{p.biography}</p>
      <ul className="mt-2 flex gap-3">{Object.entries(p.social_links||{}).map(([k,v])=>safeUrl(v)&&<li key={k}><a className="underline" rel="noopener noreferrer" target="_blank" href={v}>{k}</a></li>)}</ul></article>)}</Grid>}</State></Section></Page>;
}
export function Visit(){
  const s=useS();return <Page title="Plan your visit"><Section title="Plan your visit"><State q={s} empty="">{c=><div className="space-y-5">
    <p className="text-lg">{c.service_times}</p><address className="not-italic">{c.address}</address>
    {[['Parking','parking'],['What to expect','expect'],["Children's ministry",'kids']].map(([t,k])=>c[k]&&<div key={k}><h3 className="text-2xl">{t}</h3><p className="whitespace-pre-line">{c[k]}</p></div>)}
    {c.map_embed_url?.startsWith('https://www.google.com/maps/embed')&&<iframe title="Map" src={c.map_embed_url} className="h-80 w-full rounded-md" loading="lazy"/>}</div>}</State></Section></Page>;
}
export function Ministries(){
  const q=useAsync(()=>list('ministries',{by:'name',asc:true}));
  return <Page title="Ministries"><Section title="Ministries"><State q={q} empty="No ministries listed yet.">{d=><Grid>{d.map(m=><article key={m.id} className="card"><Img src={m.image_url} alt=""/><h3 className="mt-3 text-xl">{m.name}</h3><p>{m.description}</p>
    {m.meeting_time&&<p className="mt-2 text-sm">Meets: {m.meeting_time}</p>}{m.contact_email&&<a className="text-sm underline" href={`mailto:${m.contact_email}`}>{m.contact_email}</a>}</article>)}</Grid>}</State></Section></Page>;
}
export function Sermons(){
  const q=useAsync(()=>list('sermons',{by:'sermon_date'})),[f,setF]=useState({s:'',sp:'',cat:'',from:''});
  const set=k=>e=>setF({...f,[k]:e.target.value});
  return <Page title="Sermons"><Section title="Sermons"><State q={q} empty="No sermons posted yet.">{d=>{
    const u=k=>[...new Set(d.map(x=>x[k]).filter(Boolean))];
    const r=d.filter(x=>(!f.s||`${x.title} ${x.description} ${x.scripture}`.toLowerCase().includes(f.s.toLowerCase()))&&(!f.sp||x.speaker===f.sp)&&(!f.cat||x.category===f.cat)&&(!f.from||x.sermon_date>=f.from));
    return <><div className="mb-6 grid gap-3 md:grid-cols-4"><input aria-label="Search" placeholder="Search sermons" className="input" value={f.s} onChange={set('s')}/>
      <select aria-label="Speaker" className="input" value={f.sp} onChange={set('sp')}><option value="">All speakers</option>{u('speaker').map(x=><option key={x}>{x}</option>)}</select>
      <select aria-label="Category" className="input" value={f.cat} onChange={set('cat')}><option value="">All categories</option>{u('category').map(x=><option key={x}>{x}</option>)}</select>
      <input aria-label="From date" type="date" className="input" value={f.from} onChange={set('from')}/></div>
      {r.length?<Grid>{r.map(SermonCard)}</Grid>:<p>No sermons match your filters.</p>}</>}}</State></Section></Page>;
}
export function SermonDetail(){
  const {id}=useParams(),q=useAsync(()=>get('sermons',id),[id]);
  return <Section><State q={q} empty="Sermon not found.">{s=>{const e=embedUrl(s.video_url);document.title=s.title;return <article className="max-w-3xl space-y-4">
    <h1 className="text-4xl">{s.title}</h1><p>{s.speaker} · {s.scripture} · {fmtDate(s.sermon_date)}</p>
    {e&&<iframe title={s.title} src={e} className="aspect-video w-full rounded-md" allowFullScreen/>}
    {safeUrl(s.audio_url)&&<audio controls src={s.audio_url} className="w-full"/>}<p className="whitespace-pre-line">{s.description}</p><Link to="/sermons" className="underline">All sermons</Link></article>}}</State></Section>;
}
export function Events(){
  const q=useAsync(()=>list('events',{by:'event_date',asc:true}));
  return <Page title="Events"><Section title="Events"><State q={q} empty="No events scheduled.">{d=><Grid>{d.filter(e=>e.event_date>=today()).map(EventCard)}</Grid>}</State></Section></Page>;
}
export function EventDetail(){
  const {id}=useParams(),q=useAsync(()=>get('events',id),[id]);
  return <Section><State q={q} empty="Event not found.">{e=><article className="max-w-3xl space-y-4"><Img src={e.image_url} alt=""/><h1 className="text-4xl">{e.title}</h1>
    <p>{fmtDate(e.event_date)} {e.start_time?.slice(0,5)}{e.end_time&&`–${e.end_time.slice(0,5)}`} · {e.location}</p><p className="whitespace-pre-line">{e.description}</p>
    {safeUrl(e.registration_url)&&<a className="btn" href={e.registration_url} target="_blank" rel="noopener noreferrer">Register</a>}</article>}</State></Section>;
}
export function Give(){
  const toast=useToast(),[f,setF]=useState({donor_name:'',donor_email:'',amount:'',fund:'General'});
  const go=async e=>{e.preventDefault();const a=Number(f.amount);if(!(a>0)){toast('Enter an amount above zero.','err');return}
    try{await submit('donations',{...f,amount:a,status:'pending'});toast('Thank you! Your gift intention is recorded. Online payment is coming soon.');setF({...f,amount:''})}catch(x){toast(x.message,'err')}};
  return <Page title="Give"><Section title="Give"><p className="max-w-2xl">Your giving supports weekly services, children's programs, community outreach and missions.</p>
    <form onSubmit={go} className="card mt-6 max-w-lg space-y-3"><label className="block">Fund<select className="input" value={f.fund} onChange={e=>setF({...f,fund:e.target.value})}><option>General</option><option>Missions</option><option>Building</option><option>Benevolence</option></select></label>
      <label className="block">Amount<input required type="number" min="1" step="0.01" className="input" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></label>
      <label className="block">Name (optional)<input className="input" value={f.donor_name} onChange={e=>setF({...f,donor_name:e.target.value})}/></label>
      <label className="block">Email (optional)<input type="email" className="input" value={f.donor_email} onChange={e=>setF({...f,donor_email:e.target.value})}/></label>
      <button className="btn">Record my gift</button><p className="text-sm text-ink/60">No card details are collected or stored here. Connect a payment provider (Stripe, Paystack, M-Pesa) to complete payment.</p></form></Section></Page>;
}
const emailOk=v=>/^\S+@\S+\.\S+$/.test(v);
export function Prayer(){
  const toast=useToast(),[f,setF]=useState({name:'',email:'',request:'',anonymous:false}),[busy,setBusy]=useState(false);
  const go=async e=>{e.preventDefault();if(f.request.trim().length<5)return toast('Please write your request.','err');
    if(!f.anonymous&&f.email&&!emailOk(f.email))return toast('Enter a valid email.','err');setBusy(true);
    try{await submit('prayer_requests',{request:f.request.trim(),anonymous:f.anonymous,name:f.anonymous?null:f.name||null,email:f.anonymous?null:f.email||null,status:'New'});toast('Your request was received. We are praying with you.');setF({name:'',email:'',request:'',anonymous:false})}catch(x){toast(x.message,'err')}setBusy(false)};
  return <Page title="Prayer requests"><Section title="Prayer requests"><form onSubmit={go} className="card max-w-xl space-y-3">
    <label className="flex gap-2"><input type="checkbox" checked={f.anonymous} onChange={e=>setF({...f,anonymous:e.target.checked})}/>Submit anonymously</label>
    {!f.anonymous&&<><label className="block">Name<input className="input" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/></label><label className="block">Email<input type="email" className="input" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></label></>}
    <label className="block">Prayer request<textarea required rows="5" className="input" value={f.request} onChange={e=>setF({...f,request:e.target.value})}/></label><button disabled={busy} className="btn">{busy?'Sending…':'Send request'}</button></form></Section></Page>;
}
export function Contact(){
  const toast=useToast(),s=useS(),[f,setF]=useState({name:'',email:'',phone:'',message:''}),[busy,setBusy]=useState(false),c=s.data||{};
  const go=async e=>{e.preventDefault();if(!f.name.trim()||!emailOk(f.email)||f.message.trim().length<3)return toast('Fill in name, a valid email and a message.','err');setBusy(true);
    try{await submit('contact_messages',{...f,phone:f.phone||null});toast('Message sent. We will reply soon.');setF({name:'',email:'',phone:'',message:''})}catch(x){toast(x.message,'err')}setBusy(false)};
  const i=k=>({value:f[k],onChange:e=>setF({...f,[k]:e.target.value}),className:'input'});
  return <Page title="Contact"><Section title="Contact us"><div className="grid gap-8 md:grid-cols-2"><form onSubmit={go} className="card space-y-3">
    <label className="block">Name<input required {...i('name')}/></label><label className="block">Email<input required type="email" {...i('email')}/></label><label className="block">Phone<input type="tel" {...i('phone')}/></label>
    <label className="block">Message<textarea required rows="5" {...i('message')}/></label><button disabled={busy} className="btn">{busy?'Sending…':'Send message'}</button></form>
    <div className="space-y-3"><address className="not-italic">{c.address}<br/>{c.phone}<br/>{c.email}</address>
      {c.map_embed_url?.startsWith('https://www.google.com/maps/embed')&&<iframe title="Map" src={c.map_embed_url} className="h-72 w-full rounded-md" loading="lazy"/>}</div></div></Section></Page>;
}

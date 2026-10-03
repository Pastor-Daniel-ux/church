import {useState} from 'react';import {NavLink,Link,Outlet} from 'react-router-dom';
import {getSettings} from '../services/db';import {useAsync} from './ui';
const links=[['/','Home'],['/about','About'],['/ministries','Ministries'],['/sermons','Sermons'],['/events','Events'],['/give','Give'],['/prayer','Prayer'],['/contact','Contact']];
export default function Layout(){
  const [open,setOpen]=useState(false);const {data:s}=useAsync(getSettings);
  const cls=({isActive})=>`px-2 py-1 rounded ${isActive?'text-olive font-semibold underline underline-offset-4':'hover:text-olive'}`;
  return <div className="flex min-h-screen flex-col">
    <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-sand/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-serif text-xl font-bold">{s?.church_name||'Church'}</Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">{links.map(([to,l])=><NavLink key={to} to={to} end={to==='/'} className={cls}>{l}</NavLink>)}
          <Link to="/visit" className="btn ml-3">Plan your visit</Link></nav>
        <button className="lg:hidden btn btn-alt" aria-expanded={open} aria-controls="mnav" onClick={()=>setOpen(!open)}>{open?'Close':'Menu'}</button></div>
      {open&&<nav id="mnav" aria-label="Mobile" className="flex flex-col gap-1 border-t border-ink/10 px-4 py-3 lg:hidden" onClick={()=>setOpen(false)}>
        {[...links,['/visit','Plan your visit']].map(([to,l])=><NavLink key={to} to={to} end={to==='/'} className={cls}>{l}</NavLink>)}</nav>}
    </header>
    <main id="main" className="flex-1"><Outlet/></main>
    <footer className="bg-ink text-white"><div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
      <div><p className="font-serif text-lg">{s?.church_name}</p><p className="text-white/70">{s?.tagline}</p></div>
      <address className="not-italic text-white/80">{s?.address}<br/>{s?.phone}<br/>{s?.email}</address>
      <ul className="flex flex-wrap gap-3">{Object.entries(s?.social_links||{}).map(([k,v])=>/^https?:/.test(v)&&<li key={k}><a className="underline" href={v} target="_blank" rel="noopener noreferrer">{k}</a></li>)}
        <li><Link to="/admin" className="text-white/60 underline">Staff login</Link></li></ul></div></footer></div>;
}

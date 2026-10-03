import {Routes,Route} from 'react-router-dom';
import Layout from './components/Layout';import Protected from './components/Protected';
import {configured} from './lib/supabase';
import * as P from './pages/Public';import Dashboard,{Login,Reset} from './pages/Admin';
export default function App(){
  if(!configured)return <p role="alert" className="p-8">Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.</p>;
  return <Routes><Route element={<Layout/>}>
    <Route index element={<P.Home/>}/><Route path="about" element={<P.About/>}/><Route path="visit" element={<P.Visit/>}/><Route path="ministries" element={<P.Ministries/>}/>
    <Route path="sermons" element={<P.Sermons/>}/><Route path="sermons/:id" element={<P.SermonDetail/>}/><Route path="events" element={<P.Events/>}/><Route path="events/:id" element={<P.EventDetail/>}/>
    <Route path="give" element={<P.Give/>}/><Route path="prayer" element={<P.Prayer/>}/><Route path="contact" element={<P.Contact/>}/>
    <Route path="admin/login" element={<Login/>}/><Route path="admin/reset" element={<Reset/>}/>
    <Route path="admin" element={<Protected><Dashboard/></Protected>}/>
    <Route path="*" element={<p className="p-12 text-center">Page not found.</p>}/></Route></Routes>;
}

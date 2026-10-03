import {Navigate} from 'react-router-dom';import {useAuth} from '../context/AuthContext';import {Loading} from './ui';
export default function Protected({children}){
  const {session,isAdmin,loading}=useAuth();
  if(loading)return <Loading/>;if(!session)return <Navigate to="/admin/login" replace/>;
  if(!isAdmin)return <p role="alert" className="p-8 text-center">This account is not an administrator. Ask an admin to grant access.</p>;
  return children;
}

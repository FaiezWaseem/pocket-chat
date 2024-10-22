import { useEffect, useState } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import pb from './lib/pb.ts';
import { User } from './types/User.ts';


import Login from './pages/Login.tsx'
import HomeScreen from './pages/HomePage/index.tsx';

import useUser from './hooks/user.ts';



const authRouter = createBrowserRouter([
  {
    path: "/",
    element: <HomeScreen />,
  },
]);
const defaultRouter = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
]);

export default function App() {


  const [isUserAuthorized, setIsUserAuthorized] = useState(false)
 const setUser = useUser(state=> state.setUser)




  useEffect(()=>{

    pb.authStore.onChange((auth, model) => {
      if(auth){
        setIsUserAuthorized(true)
        setUser(model as User)
      }else{
        setIsUserAuthorized(false)
        setUser(null)
      }
    })
    if(pb.authStore.isAuthRecord){
      console.log(JSON.stringify(pb.authStore.model))
      setUser(pb.authStore.model as User)
      setIsUserAuthorized(true)
    }

  },[])

  if(!isUserAuthorized){
    return <RouterProvider router={defaultRouter} />
  }


  return (
    <RouterProvider router={authRouter} />
  );
}
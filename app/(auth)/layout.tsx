import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react'


const AuthLayout =async ({children}:{children:ReactNode}) => {
  const isUserAuthenticated= await isAuthenticated();
   
   console.log("isUserAuthenticated : ", isUserAuthenticated);
      if (isUserAuthenticated) {
        console.log("true toh hai ");
        
          redirect('/'); 
      }
  return (
    <div className='auth-layout'>
        {children}
    </div>
  )
}

export default AuthLayout
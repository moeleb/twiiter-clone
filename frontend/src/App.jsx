import React from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import HomePage from './pages/Home/HomePage'
import LoginPage from './pages/auth/login/LoginPage'
import SignUpPage from './pages/auth/Signup/SignUpPage'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import NotificationPage from './pages/notification/NotificationPage'
import ProfilePage from './pages/profile/ProfilePage'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from './components/common/LoadingSpinner'

const App = () => {
  const navigate = useNavigate()
  const {data : authUser, isLoading, isError, error} = useQuery({
    queryKey : ['authUser'],
    queryFn : async () => {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if(!res.ok){
          throw new Error(data.error || "Something went wrong!")
        }
        console.log(data);
        return data;  
      }
      catch(error){
        throw new Error(error)
      }
    },
    retry : false
  })

  if(isLoading){
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner/>

      </div>
    )
  }
  
  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser &&<Sidebar/>}
        <Routes>
          <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" replace />} />
          <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />} />
          <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to="/login" replace />} />
          <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to="/login" replace />} />
        </Routes>
      {authUser && <RightPanel/>}
      <Toaster/>
    </div>
  )
}

export default App
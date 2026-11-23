import { useState } from 'react'
import { Route,Router,BrowserRouter,Navigate, Routes } from 'react-router-dom'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Register from './pages/Register';
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/protectedRoute'
import { AuthProvider } from './context/AuthContext'
function App()
{
  return(
    <>
 <AuthProvider>

            <BrowserRouter>

                <Routes>

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route element={<ProtectedRoute />}>

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                    </Route>

                </Routes>

            </BrowserRouter>

        </AuthProvider>
    </>
  )
}
export default App

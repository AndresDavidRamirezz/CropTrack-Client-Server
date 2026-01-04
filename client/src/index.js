import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';

import ProtectedRoute from './components/ProtectedRoutes.jsx';

import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';

import NavBar from './components/NavBar/NavBar';

import MainPage from './pages/MainPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<NavBar />
			<Routes>
				<Route path="/" element={<h1>Bienvenido a la LandingPage de CropTrack</h1>} />
				<Route path="/login" element={ <LoginPage/>} />
				<Route path="/register/register-admin" element={ <RegisterPage/>} />
				<Route path="/main" element={ <ProtectedRoute> <MainPage /> </ProtectedRoute>} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);
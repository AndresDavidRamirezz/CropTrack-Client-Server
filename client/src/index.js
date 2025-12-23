import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<h1>Bienvenido a la LandingPage de CropTrack</h1>} />
				<Route path="/login" element={<LoginPage/>} />
				<Route path="/register" element={<RegisterPage/>} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);
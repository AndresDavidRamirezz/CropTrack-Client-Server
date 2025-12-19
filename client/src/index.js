import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<h1>Welcome to CropTrack</h1>} />
				<Route path="/login" element={<LoginPage/>} />
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);
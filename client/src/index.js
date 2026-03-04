import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './index.css';

import ProtectedRoute from './components/ProtectedRoutes.jsx';

import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';

import NavBar from './components/NavBar/NavBar';
import Footer from './components/Footer/Footer.jsx';

import MainPage from './pages/MainPage';

import CropPage from './pages/Crop/CropPage.jsx';
import MeasurementPage from './pages/Measurement/MeasurementPage.jsx';
import TaskPage from './pages/Task/TaskPage.jsx';
import WorkerPage from './pages/Worker/WorkerPage.jsx';
import ProfilePage from './pages/Profile/ProfilePage.jsx';
import ReportPage from './pages/Report/ReportPage.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter>
			<NavBar />
			<main>
			<Routes>
				<Route path="/" element={<h1>Bienvenido a la LandingPage de CropTrack</h1>} />
				<Route path="/login" element={ <LoginPage/>} />
				<Route path="/register/register-admin" element={ <RegisterPage/>} />
				<Route path="/main" element={ <ProtectedRoute> <MainPage /> </ProtectedRoute>} />
				<Route path="/crops" element={ <ProtectedRoute> <CropPage /> </ProtectedRoute>} />
				<Route path="/measurements" element={ <ProtectedRoute> <MeasurementPage /> </ProtectedRoute>} />
				<Route path="/tasks" element={ <ProtectedRoute> <TaskPage /> </ProtectedRoute>} />
				<Route path="/users" element={ <ProtectedRoute> <WorkerPage /> </ProtectedRoute>} />
				<Route path="/profile" element={ <ProtectedRoute> <ProfilePage /> </ProtectedRoute>} />
				<Route path="/report" element={ <ProtectedRoute> <ReportPage /> </ProtectedRoute>} />
			</Routes>
			</main>
			<Footer />
		</BrowserRouter>
	</React.StrictMode>
);
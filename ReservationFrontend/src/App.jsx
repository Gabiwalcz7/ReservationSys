import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ResourcesPage from './pages/ResourcesPage.jsx';
import NewReservationPage from './pages/NewReservationPage.jsx';
import MyReservationsPage from './pages/MyReservationsPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminResourcesPage from './pages/AdminResourcesPage.jsx';
import ReportPage from "./pages/ReportPage.jsx";
import CreateResourcePage from "./pages/CreateResourcePage.jsx";
import EditResourcePage from "./pages/EditResourcePage.jsx";
import EditMyReservationPage from "./pages/EditMyReservationPage.jsx";


function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/resources/:id/reserve" element={<NewReservationPage />} />
                <Route path="/my-reservations" element={<MyReservationsPage />} />

                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/resources" element={<AdminResourcesPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/" element={<Navigate to="/resources" />} />
                <Route path="/resources/new" element={<CreateResourcePage />} />
                <Route path="/resources/:id/edit" element={<EditResourcePage />} />
                <Route path="/my-reservations/:id/edit" element={<EditMyReservationPage />} />
            </Routes>
        </Layout>
    );
}

export default App;

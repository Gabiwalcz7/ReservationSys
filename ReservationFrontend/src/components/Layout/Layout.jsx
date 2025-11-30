import Navbar from './Navbar.jsx';

export default function Layout({ children }) {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="container" role="main">
                {children}
            </main>
        </div>
    );
}
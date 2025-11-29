import Navbar from './Navbar.jsx';

export default function Layout({ children }) {
    return (
        <div>
            <Navbar />
            <main style={{ padding: '1rem 2rem' }}>
                {children}
            </main>
        </div>
    );
}

import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    if (isLoading) {
        return <div className="loading">Chargement en cours...</div>;
    }

    return (
        <div className="dashboard">
            {isAuthenticated ? (
                <>
                    <header className="dashboard-header">
                        <h1>Bonjour, {user?.name || 'utilisateur'} !</h1>
                        <button onClick={logout} className="logout-btn">
                            Déconnexion
                        </button>
                    </header>

                    <main className="dashboard-content">
                        {/* Vos composants de tableau de bord ici */}
                        <section className="stats-section">
                            <h2>Vos statistiques</h2>
                            {/* ... */}
                        </section>
                    </main>
                </>
            ) : (
                <div className="auth-required">
                    <h2>Accès non autorisé</h2>
                    <p>Connectez-vous pour accéder à cette page.</p>
                </div>
            )}
        </div>
    );
}
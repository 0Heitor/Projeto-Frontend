import { Button, Container } from "react-bootstrap";
import { useAuth } from '../contexto/AuthContext';

export default function Cabecalho() {
    const { user, isLogged, logout } = useAuth();

    if (!isLogged) return null;

    return (
        <header className="bg-white shadow-sm border-bottom mb-3">
            {/* py-3 aumenta o espaçamento em cima e embaixo */}
            <Container fluid className="py-3 px-4 d-flex justify-content-between align-items-center">
                {/* Lado Esquerdo: Identidade do Sistema */}
                <div className="d-flex align-items-center">
                    <i className="bi bi-building-gear text-primary fs-1 me-3"></i>
                    <div className="d-flex flex-column">
                        <h2 className="text-primary mb-0 fw-bold fs-3" style={{ letterSpacing: '-1px', lineHeight: '1.1' }}>
                            Madrugada Caçambas LTDA
                        </h2>
                        <span className="text-muted fs-6">
                            Sistema de Gestão Comercial
                        </span>
                    </div>
                </div>

                {/* Lado Direito: Usuário e Sair */}
                <div className="d-flex align-items-center gap-4">
                    <div className="text-end d-none d-md-block">
                        <div className="fw-bold text-dark fs-5" style={{ lineHeight: '1.1' }}>
                            {user?.nome || "Usuário"}
                        </div>
                        <div className="text-muted fs-6">
                            {user?.email}
                        </div>
                    </div>
                    
                    <div className="vr mx-2 d-none d-md-block" style={{ height: '40px' }}></div>
                    
                    <Button 
                        variant="outline-danger" 
                        onClick={logout}
                        className="rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-bold"
                    >
                        <i className="bi bi-box-arrow-right fs-5"></i>
                        <span>Sair</span>
                    </Button>
                </div>
            </Container>
        </header>
    );
}
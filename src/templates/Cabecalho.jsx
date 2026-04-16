import { Button, Container } from "react-bootstrap";
import { useAuth } from '../contexto/AuthContext';

export default function Cabecalho() {
    const { user, isLogged, logout } = useAuth();

    if (!isLogged) return null;

    return (
        <header className="bg-white shadow-sm border-bottom mb-3">
            {/* py-3 aumenta o espaçamento em cima e embaixo */}
            <Container fluid className="py-3 px-4 d-flex justify-content-between align-items-center">
                <div>
                    {/* fs-2 deixa o título bem grande e imponente */}
                    <h2 className="text-primary mb-0 fw-bold" style={{ letterSpacing: '-1px' }}>
                        <i className="bi bi-building-gear me-3"></i>
                        Sistema de Gestão Comercial
                    </h2>
                </div>

                <div className="d-flex align-items-center gap-4">
                    <div className="text-end d-none d-md-block">
                        {/* fs-5 para o nome do usuário ficar bem legível */}
                        <div className="fw-bold text-dark fs-5" style={{ lineHeight: '1.1' }}>
                            {user?.nome || "Usuário"}
                        </div>
                        <div className="text-muted fs-6">
                            {user?.email}
                        </div>
                    </div>
                    
                    <div className="vr mx-2 d-none d-md-block" style={{ height: '40px' }}></div>
                    
                    {/* Botão maior com padding extra px-4 e py-2 */}
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
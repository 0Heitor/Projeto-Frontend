import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Menu() {
    return (
        // py-2 aumenta a altura da barra do menu
        <Navbar expand="lg" className="bg-white shadow-sm py-2 mb-4 border-bottom">
            <Container>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* gap-3 aumenta o espaço entre os itens do menu */}
                    <Nav className="me-auto gap-3">
                        {/* fs-5 deixa o texto do link maior */}
                        <Nav.Link as={Link} to="/Sistema" className="fw-semibold fs-5 text-dark">
                            <i className="bi bi-house-door me-2"></i> Dashboard
                        </Nav.Link>

                        <NavDropdown 
                            title={<span className="fs-5 fw-semibold text-dark"><i className="bi bi-plus-circle me-2"></i> Cadastros</span>} 
                            id="cadastros-dropdown"
                        >
                            <NavDropdown.Item as={Link} to="/Sistema/categorias/sub-grupo" className="fs-6 py-2">Categorias de Sub-Grupo</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/Sistema/categorias/grupo" className="fs-6 py-2">Categorias de Grupo</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} to="/Sistema/tipos/cacambas" className="fs-6 py-2">Tipos de Caçambas</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/Sistema/cacambas" className="fs-6 py-2">Caçambas</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} to="/Sistema/clientes" className="fs-6 py-2">Clientes</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/Sistema/fornecedores" className="fs-6 py-2">Fornecedores</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/Sistema/produtos" className="fs-6 py-2">Produtos</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} to="/Sistema/usuarios" className="fs-6 py-2">Usuários</NavDropdown.Item>
                        </NavDropdown>

                        <NavDropdown 
                            title={<span className="fs-5 fw-semibold text-dark"><i className="bi bi-cpu me-2"></i> Operações</span>} 
                            id="operacoes-dropdown"
                        >
                            <NavDropdown.Item as={Link} to="/Sistema/agendamentos" className="fs-6 py-2">Agendamento de Caçambas</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/Sistema/vendas" className="fs-6 py-2">Vendas</NavDropdown.Item>
                        </NavDropdown>

                        <Nav.Link as={Link} to="/Sistema/vizualizacao-agendamento" className="fs-5 fw-semibold text-dark">
                            <i className="bi bi-map me-2"></i> Mapa
                        </Nav.Link>

                        <NavDropdown 
                            title={<span className="fs-5 fw-semibold text-dark"><i className="bi bi-file-earmark-bar-graph me-2"></i> Relatórios</span>} 
                            id="relatorios-dropdown"
                        >
                            <NavDropdown.Item as={Link} to="/Sistema/relatorio-de-saldos" className="fs-6 py-2">Relatório de Saldos</NavDropdown.Item>
                            <NavDropdown.Item as={Link} to="/Sistema/relatorio-de-vendas" className="fs-6 py-2">Relatório de Vendas</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
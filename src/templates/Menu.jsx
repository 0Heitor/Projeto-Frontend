import { Card, Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import {Link} from'react-router-dom';


export default function Menu(props) {
    return (
        <Card className="shadow-sm border-0 mb-4 py-3">
          <Card.Header className="bg-white border-0 pt-3">
                <Navbar expand="lg" className="bg-body-tertiary">
                    <Container>
                        <Navbar.Brand as={Link} to="/Sistema">Menu</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <NavDropdown title="Cadastros" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to="/Sistema/cacambas">Caçambs</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/Sistema/clientes">Clientes</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/Sistema/fornecedores">Fornecedores</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/Sistema/produtos">Produtos</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/Sistema/usuarios">Usuários</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Operações" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to="/Sistema/agendamentos">Agendamento de Caçambas</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/Sistema/vendas">Vendas</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Mapa para Vizualização" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to="/Sistema/vizualizacao-agendamento">Vizualização de agendamento por mapa</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Relatórios" id="basic-nav-dropdown">
                                    <NavDropdown.Item as={Link} to="/Sistema/relatorio-de-saldos">Relatório de Saldos</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/Sistema/relatorio-de-vendas">Relatório de Vendas</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </Card.Header>
        </Card>
    );
}
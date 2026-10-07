import { Modal, Button } from "react-bootstrap";
import { useState } from "react";
import TabelaUsuarios from "../tabelas/TabelaUsuarios";

export default function ModalSelecaoUsuario(props) {
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [filtros, setFiltros] = useState({
        nome: "",
        email: "",
        nivel: "",
        ativo: "true"
    });

    return (
        <Modal 
            show={props.show} 
            onHide={props.onHide} 
            size="xl" 
            centered 
            backdrop="static"
        >
            <Modal.Header closeButton className="bg-primary text-white">
                <Modal.Title>
                    <i className="bi bi-search me-2"></i>
                    Selecionar Usuário
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#f8f9fa' }}>
                {/* Reutilizamos sua tabela original com a prop modoSelecao */}
                <TabelaUsuarios
                    modoSelecao={true} 
                    onSelecionar={(usuario) => {
                        props.onSelecionar(usuario); // Passa o usuario escolhido para o form
                        props.onHide();
                    }}
                    // Passando os estados exigidos pela sua tabela de usuarios
                    paginaAtual={paginaAtual}
                    setPaginaAtual={setPaginaAtual}
                    itensPorPagina={itensPorPagina}
                    setItensPorPagina={setItensPorPagina}
                    filtros={filtros}
                    setFiltros={setFiltros}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" variant="danger" onClick={props.onHide}>
                    <i className="bi bi-x-circle me-1"></i> Cancelar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
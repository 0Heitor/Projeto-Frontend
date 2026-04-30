import { Modal, Button } from "react-bootstrap";
import { useState } from "react";
import TabelaTiposCacambas from "../tabelas/TabelaTipoCacambas"; // Ajuste o caminho se necessário

export default function ModalSelecaoTipo(props) {
    // Estados internos do Modal para a busca de tipos
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [filtros, setFiltros] = useState({
        nome: "",
        volume: "",
        descricao: "",
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
                    Selecionar Tipo de Caçamba
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ backgroundColor: '#f8f9fa' }}>
                {/* Reutilizamos sua tabela original com a prop modoSelecao */}
                <TabelaTiposCacambas 
                    modoSelecao={true} 
                    onSelecionar={(tipo) => {
                        props.onSelecionar(tipo); // Passa o tipo escolhido para o form
                        props.onHide();          // Fecha o modal
                    }}
                    // Passando os estados exigidos pela sua tabela de tipos
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
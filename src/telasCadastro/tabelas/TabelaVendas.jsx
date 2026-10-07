import { Button, Container, Spinner, Table, Modal, Col, FloatingLabel, Form, Card, Row, Pagination, Badge } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { buscarVendas, removerVenda } from "../../redux/redutores/vendaReducer";
import ESTADO from "../../recursos/estado";
import { toast } from "react-toastify";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "../../contexto/AuthContext";

export default function TabelaVendas(props) {
    const { estado, mensagem, vendas = [], totalRegistros = 0 } = useSelector(state => state.venda);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [vendaParaExcluir, setVendaParaExcluir] = useState(null);
    
    const [mostrarItens, setMostrarItens] = useState(false);
    const [vendaSelecionada, setVendaSelecionada] = useState(null);

    const totalDePaginas = Math.ceil(totalRegistros / props.itensPorPagina) || 1;
    const sucessoExibido = useRef(false);
    const dispatch = useDispatch();

    const { user } = useAuth();
    const isAdmin = user?.nivel === "ADMIN";

    const manipulaMudanca = (evento) => {
        const { name, value } = evento.target;
        if (name.includes('.')) {
            const [objetoPai, objetoFilho] = name.split('.');
            
            props.setFiltros({
                ...props.filtros,
                [objetoPai]: {
                    ...props.filtros[objetoPai],
                    [objetoFilho]: value
                }
            });
        } 
        else {
            props.setFiltros({ 
                ...props.filtros, 
                [name]: value 
            });
        }
    };

    function abrirItens(venda) {
        setVendaSelecionada(venda);
        setMostrarItens(true);
    }

    function excluirVenda(venda) {
        setVendaParaExcluir(venda);
        setMostrarConfirmacao(true);
    }

    function confirmarExclusao() {
        if (vendaParaExcluir) {
            dispatch(removerVenda(vendaParaExcluir));
            setMostrarConfirmacao(false);
            setVendaParaExcluir(null);
            buscarComFiltro();
        }
    }

    function editarVenda(venda) {
        props.setVendaParaEdicao(venda);
        props.setModoEdicao(true);
        props.exibirFormulario(true);
    }

    function buscarComFiltro() {
        props.setPaginaAtual(1);
        dispatch(buscarVendas({
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: 0
        }));
    }

    function mudarPagina(numero) {
        props.setPaginaAtual(numero);
        dispatch(buscarVendas({
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: props.itensPorPagina * (numero - 1)
        }));
    }

    const mudarQtdItens = (quantidade) => {
        props.setItensPorPagina(Number(quantidade));
        props.setPaginaAtual(1);
    };

    useEffect(() => {
        dispatch(buscarVendas({
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: props.itensPorPagina * (props.paginaAtual - 1)
        }));
    }, [dispatch, props.paginaAtual, props.itensPorPagina]);

    useEffect(() => {
        if (estado === ESTADO.PENDENTE) {
            sucessoExibido.current = false;
            toast.info(
                <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span>Sincronizando dados com o servidor...</span>
                </div>, 
                { toastId: "processando", autoClose: false, theme: "colored" }
            );
        } 
        else if (estado === ESTADO.ERRO) {
            toast.dismiss("processando");
            toast.error(`Ops! ${mensagem}`, { toastId: "erro", theme: "dark" });
        } 
        else if (estado === ESTADO.OCIOSO) {
            toast.dismiss("processando");
            if (!sucessoExibido.current) {
                toast.success("Vendas carregadas com sucesso!", { toastId: "sucesso-carga", autoClose: 2000 });
                sucessoExibido.current = true;
            }
        }
    }, [estado, mensagem]);

    let itensPaginacao = [];
    for (let numero = 1; numero <= totalDePaginas; numero++) {
        itensPaginacao.push(
            <Pagination.Item key={numero} active={numero === props.paginaAtual} onClick={() => mudarPagina(numero)}>
                {numero}
            </Pagination.Item>
        );
    }

    const renderBadgeStatus = (status) => {
        switch (status?.toUpperCase()) {
            case 'PAGO':
                return <Badge bg="success">PAGO</Badge>;
            case 'CANCELADO':
                return <Badge bg="danger">CANCELADO</Badge>;
            default:
                return <Badge bg="warning" text="dark">PENDENTE</Badge>;
        }
    };

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border" style={{ opacity: estado === ESTADO.PENDENTE ? 0.5 : 1 }}>
            
            {/* CABEÇALHO */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h2 className="text-primary mb-0">Gestão de Vendas</h2>
                    <small className="text-muted">Histórico de vendas e clientes</small>
                </div>
                {isAdmin && (
                    <Button variant="success" onClick={() => { props.setModoEdicao(false); props.exibirFormulario(true); }}>
                        <i className="bi bi-cart-check-fill me-2"></i> Nova Venda
                    </Button>
                )}  
            </div>

            {/* SEÇÃO DE FILTROS PARA VENDAS */}
            <Card className="mb-4 border-0 shadow-sm bg-light">
                <Card.Body>
                    <h5 className="mb-3 text-secondary">
                        <i className="bi bi-funnel"></i> Filtros de Busca
                    </h5>
                    <Row className="g-2">
                        {/* Filtro por ID da Venda */}
                        <Col md={2}>
                            <FloatingLabel label="Nº da Venda">
                                <Form.Control 
                                    name="id" 
                                    type="number"
                                    placeholder="ID" 
                                    value={props.filtros.id || ''} 
                                    onChange={manipulaMudanca} 
                                />
                            </FloatingLabel>
                        </Col>

                        {/* Filtro por Nome do Cliente */}
                        <Col md={2}>
                            <FloatingLabel label="Cliente">
                                <Form.Control 
                                    name="cliente.nome"
                                    placeholder="Nome do cliente"
                                    value={props.filtros.cliente?.nome || ''} 
                                    onChange={manipulaMudanca} 
                                />
                            </FloatingLabel>
                        </Col>

                        {/* Filtro por Ativo */}
                        <Col md={2}>
                            <FloatingLabel label="Status">
                                <Form.Select name="ativo" value={props.filtros.ativo} onChange={manipulaMudanca}>
                                    <option value="">Todos</option>
                                    <option value="true">Ativos</option>
                                    <option value="false">Inativos</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>

                        {/* Filtro por Data Inicial */}
                        <Col md={2}>
                            <FloatingLabel label="Data Início">
                                <Form.Control 
                                    name="dataInicio" 
                                    type="date" 
                                    value={props.filtros.dataInicio || ''} 
                                    onChange={manipulaMudanca} 
                                />
                            </FloatingLabel>
                        </Col>

                        {/* Filtro por Data Final */}
                        <Col md={2}>
                            <FloatingLabel label="Data Fim">
                                <Form.Control 
                                    name="dataFim" 
                                    type="date" 
                                    value={props.filtros.dataFim || ''} 
                                    onChange={manipulaMudanca} 
                                />
                            </FloatingLabel>
                        </Col>

                        {/* Botão de Busca */}
                        <Col md={2} className="d-flex align-items-center">
                            <Button variant="primary" className="w-100 py-3 shadow-sm" onClick={() => buscarComFiltro()}>
                                <i className="bi bi-search"></i> Buscar
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* TABELA PRINCIPAL */}
            <div className="table-responsive shadow-sm rounded border">
                <Table hover className="mb-0">
                    <thead className="table-dark text-center">
                        <tr className="align-middle" style={{ height: '60px' }}>
                            <th className="px-4">ID</th>
                            <th>Data</th>
                            <th className="text-start">Cliente</th>
                            <th>Forma Pagamento</th>
                            <th>Status</th>
                            <th>Ativo</th>
                            <th>Valor Total</th>
                            <th>Itens</th>
                            {isAdmin && <th>Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {vendas.length > 0 ? (
                            vendas.map((venda) => (
                                <tr key={venda.id} className="align-middle text-center" style={{ height: '70px' }}>
                                    <td className="px-4 fw-bold text-primary">#{venda.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <i className="bi bi-calendar3 text-muted"></i>
                                            {venda.criado_em ? new Date(venda.criado_em).toLocaleDateString('pt-BR') : '---'}
                                        </div>
                                    </td>
                                    <td className="text-start">
                                        <div className="fw-bold text-dark">{venda.cliente?.nome || 'Venda Balcão'}</div>
                                        <small className="text-muted">
                                            <i className="bi bi-person-vcard me-1"></i>
                                            {venda.cliente?.cpf_cnpj || 'Sem Documento'}
                                        </small>
                                    </td>
                                    <td>{venda.forma_pagamento || 'N/D'}</td>
                                    <td>{renderBadgeStatus(venda.status)}</td>
                                    <td className="text-center">
                                        <span className={`badge rounded-pill ${venda.ativo ? 'bg-success' : 'bg-danger'}`}>
                                            {venda.ativo ? "ATIVO" : "INATIVO"}
                                        </span>
                                    </td>
                                    <td>
                                        <Badge bg="success" className="p-2 fs-6" style={{ minWidth: '120px' }}>
                                            R$ {parseFloat(venda.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm" 
                                            className="rounded-pill px-3"
                                            onClick={() => abrirItens(venda)}
                                        >
                                            <i className="bi bi-box-seam me-1"></i> {venda.itens?.length || 0} Itens
                                        </Button>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button variant="outline-warning" className="p-2 d-flex align-items-center" onClick={() => editarVenda(venda)}>
                                                    <i className="bi bi-pencil-fill fs-5"></i>
                                                </Button>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm" 
                                                    className="p-2 d-flex align-items-center"
                                                    onClick={() => excluirVenda(venda)}
                                                    title="Excluir Venda"
                                                >
                                                    <i className="bi bi-trash-fill"></i>
                                                </Button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={isAdmin ? "8" : "7"} className="text-center py-4 text-muted">
                                    Nenhuma venda encontrada com os filtros selecionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>

                {/* RODAPÉ */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top flex-wrap gap-2">
                    <div className="text-muted small">
                        Exibindo <strong>{vendas.length}</strong> de <strong>{totalRegistros}</strong> vendas
                    </div>

                    <Pagination className="mb-0 shadow-sm">
                        <Pagination.First onClick={() => mudarPagina(1)} disabled={props.paginaAtual === 1} />
                        <Pagination.Prev onClick={() => mudarPagina(props.paginaAtual - 1)} disabled={props.paginaAtual === 1} />
                        {itensPaginacao}
                        <Pagination.Next onClick={() => mudarPagina(props.paginaAtual + 1)} disabled={props.paginaAtual === totalDePaginas} />
                        <Pagination.Last onClick={() => mudarPagina(totalDePaginas)} disabled={props.paginaAtual === totalDePaginas} />
                    </Pagination>

                    <div className="d-flex align-items-center gap-2 border-start ps-3">
                        <span className="small text-muted">Itens por página:</span>
                        <Form.Select 
                            size="sm" 
                            style={{ width: '80px', cursor: 'pointer' }}
                            value={props.itensPorPagina}
                            onChange={(e) => mudarQtdItens(e.target.value)}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </Form.Select>
                    </div>
                </div>
            </div>

            {/* MODAL PARA VISUALIZAR ITENS DA VENDA */}
            <Modal show={mostrarItens} onHide={() => setMostrarItens(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title><i className="bi bi-list-check me-2"></i> Detalhes dos Itens da Venda #{vendaSelecionada?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover responsive>
                        <thead className="table-light">
                            <tr>
                                <th>Produto</th>
                                <th>Marca</th>
                                <th className="text-center">Qtd</th>
                                <th className="text-end">Preço Venda</th>
                                <th className="text-end">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendaSelecionada?.itens?.map((item, index) => {
                                const preco = parseFloat(item.produto?.preco_venda || 0);
                                const qtd = parseFloat(item.quantidade || 0);
                                return (
                                    <tr key={index}>
                                        <td>{item.produto?.descricao}</td>
                                        <td>{item.produto?.descricao_marca}</td>
                                        <td className="text-center">{qtd}</td>
                                        <td className="text-end">R$ {preco.toFixed(2)}</td>
                                        <td className="text-end fw-bold">
                                            R$ {(qtd * preco).toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setMostrarItens(false)}>Fechar</Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
            <Modal
                show={mostrarConfirmacao} 
                onHide={() => setMostrarConfirmacao(false)}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Confirmar Exclusão
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center py-4">
                    <div className="mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#dc3545" className="bi bi-cart-x-fill" viewBox="0 0 16 16">
                            <path d="M1 1.5a.5.5 0 0 1 .5-.5h1.11e-5a.5.5 0 0 1 .485.379l.526 2.104c.057.228.262.392.496.392h10.376c.38 0 .656.355.568.725l-1.31 5.5A.5.5 0 0 1 12.36 11H4.64a.5.5 0 0 1-.485-.379L2.01 2.379 1.61 1.5H1zm3.14 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                        </svg>
                    </div>
                    <h5>Você tem certeza?</h5>
                    <p className="text-muted">
                        Esta ação não poderá ser desfeita. A venda selecionada <strong>#{vendaParaExcluir?.id}</strong>
                        {" "}do cliente<strong>{vendaParaExcluir?.cliente?.nome ? ` ${vendaParaExcluir.cliente.nome}` : "..."}</strong> será removida permanentemente do sistema.
                    </p>
                </Modal.Body>

                <Modal.Footer className="justify-content-center border-0 pb-4">
                    <Button 
                        variant="danger" 
                        onClick={() => {
                            confirmarExclusao();
                            setMostrarConfirmacao(false);
                        }}
                        className="px-4"
                    >
                        Sim, Excluir
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => setMostrarConfirmacao(false)}
                        className="px-4 me-2"
                    >
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
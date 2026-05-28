import { Button, Container, Spinner, Table, Modal, Col, FloatingLabel, Form, Card, Row, Pagination, Badge } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { buscarLocacoes, removerLocacao } from "../../redux/redutores/locacaoReducer"; // Ajuste se necessário
import ESTADO from "../../recursos/estado";
import { toast } from "react-toastify";
import { useRef, useEffect, useState } from "react";

export default function TabelaLocacoes(props) {
    const { estado, mensagem, locacoes, totalRegistros } = useSelector(state => state.locacao);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [locacaoParaExcluir, setLocacaoParaExcluir] = useState(null);
    
    // Estados para o Modal de Itens da Caçamba
    const [mostrarItens, setMostrarItens] = useState(false);
    const [itensVisualizar, setItensVisualizar] = useState([]);

    const totalDePaginas = Math.ceil(totalRegistros / props.itensPorPagina);
    const sucessoExibido = useRef(false);
    const dispatch = useDispatch();

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

    function abrirItens(locacao) {
        setItensVisualizar(locacao || []);
        setMostrarItens(true);
    }

    function excluirLocacao(locacao) {
        setLocacaoParaExcluir(locacao);
        setMostrarConfirmacao(true);
    }

    function confirmarExclusao() {
        if (locacaoParaExcluir) {
            dispatch(removerLocacao(locacaoParaExcluir));
            setMostrarConfirmacao(false);
            setLocacaoParaExcluir(null);
            buscarComFiltro();
        }
    }

    function editarLocacao(locacao) {
        props.setLocacaoParaEdicao(locacao);
        props.setModoEdicao(true);
        props.exibirFormulario(true);
    }

    function buscarComFiltro() {
        props.setPaginaAtual(1);
        dispatch(buscarLocacoes({
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: 0
        }));
    }

    function mudarPagina(numero) {
        props.setPaginaAtual(numero);
        dispatch(buscarLocacoes({
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: props.itensPorPagina * (numero - 1)
        }));
    }

    function mudarQtdItens(quantidade) {
        props.setItensPorPagina(parseInt(quantidade));
        props.setPaginaAtual(1);
    }

    useEffect(() => {
        dispatch(buscarLocacoes({
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
                toast.success("Locações carregadas com sucesso!", { toastId: "sucesso-carga", autoClose: 2000 });
                sucessoExibido.current = true;
            }
        }
    }, [estado, mensagem]);

    // Função auxiliar para renderizar as Badges de Status com cores apropriadas
    const renderBadgeStatus = (status) => {
        const cores = {
            'AGENDADA': 'secondary',
            'ENTREGUE': 'primary',
            'CONCLUIDA': 'success',
            'CANCELADA': 'danger'
        };
        return <Badge bg={cores[status] || 'dark'} className="p-2">{status}</Badge>;
    };

    let itensPaginacao = [];
    for (let numero = 1; numero <= totalDePaginas; numero++) {
        itensPaginacao.push(
            <Pagination.Item key={numero} active={numero === props.paginaAtual} onClick={() => mudarPagina(numero)}>
                {numero}
            </Pagination.Item>
        );
    }

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border" style={{ opacity: estado === ESTADO.PENDENTE ? 0.5 : 1 }}>
            
            {/* CABEÇALHO */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h2 className="text-primary mb-0">Gestão de Locações</h2>
                    <small className="text-muted">Histórico de locações de caçambas e agendamentos</small>
                </div>
                <Button variant="success" onClick={() => { props.setModoEdicao(false); props.exibirFormulario(true); }}>
                    <i className="bi bi-plus-circle-fill me-2"></i> Nova Locação
                </Button>
            </div>

            {/* SEÇÃO DE FILTROS */}
            <Card className="mb-4 border-0 shadow-sm bg-light">
                <Card.Body>
                    <h5 className="mb-3 text-secondary">
                        <i className="bi bi-funnel"></i> Filtros de Busca
                    </h5>
                    <Row className="g-2">
                        {/* Filtro por ID da Locação */}
                        <Col md={2}>
                            <FloatingLabel label="Nº da Locação">
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
                        <Col md={3}>
                            <FloatingLabel label="Cliente">
                                <Form.Control 
                                    name="cliente.nome"
                                    placeholder="Nome do cliente"
                                    value={props.filtros.cliente?.nome || ''} 
                                    onChange={manipulaMudanca} 
                                />
                            </FloatingLabel>
                        </Col>

                        {/* Filtro por Status */}
                        <Col md={3}>
                            <FloatingLabel label="Status">
                                <Form.Select 
                                    name="status"
                                    value={props.filtros.status || ''}
                                    onChange={manipulaMudanca}
                                >
                                    <option value="AGENDADA">AGENDADA</option>
                                    <option value="ENTREGUE">ENTREGUE</option>
                                    <option value="CONCLUIDA">CONCLUIDA</option>
                                    <option value="CANCELADA">CANCELADA</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>

                        {/* Filtro por Ativo/Inativo */}
                        <Col md={2}>
                            <FloatingLabel label="Registro">
                                <Form.Select 
                                    name="ativo"
                                    value={props.filtros.ativo || 'true'}
                                    onChange={manipulaMudanca}
                                >
                                    <option value="true">Ativos</option>
                                    <option value="false">Inativos/Excluídos</option>
                                </Form.Select>
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
                            <th className="text-start">Cliente</th>
                            <th>Endereço de Entrega</th>
                            <th>Status</th>
                            <th>Valor Total</th>
                            <th>Caçambas</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locacoes.length > 0 ? (
                            locacoes.map((locacao) => (
                                <tr key={locacao.id} className="align-middle text-center" style={{ height: '70px' }}>
                                    <td className="px-4 fw-bold text-primary">#{locacao.id}</td>
                                    <td className="text-start">
                                        <div className="fw-bold text-dark">{locacao.cliente?.nome || 'N/D'}</div>
                                    </td>
                                    <td className="text-start text-truncate" style={{ maxWidth: '220px' }} title={locacao.endereco_entrega}>
                                        {locacao.endereco_entrega}
                                    </td>
                                    <td>
                                        {renderBadgeStatus(locacao.status)}
                                    </td>
                                    <td>
                                        <Badge bg="success" className="p-2 fs-6" style={{ minWidth: '120px' }}>
                                            R$ {parseFloat(locacao.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm" 
                                            className="rounded-pill px-3"
                                            onClick={() => abrirItens(locacao)}
                                        >
                                            <i className="bi bi-truck me-1"></i> {locacao.itens?.length || 0} Caçambas
                                        </Button>
                                    </td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            <Button variant="outline-warning" className="p-2 d-flex align-items-center" onClick={() => editarLocacao(locacao)}>
                                                <i className="bi bi-pencil-fill fs-5"></i>
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                className="p-2 d-flex align-items-center"
                                                onClick={() => excluirLocacao(locacao)}
                                                title="Excluir Locação"
                                                disabled={locacao.ativo === false}
                                            >
                                                <i className="bi bi-trash-fill"></i>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">
                                    Nenhuma locação encontrada com os filtros selecionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>

                {/* RODAPÉ */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top flex-wrap gap-2">
                    <div className="text-muted small">
                        Exibindo <strong>{locacoes.length}</strong> de <strong>{totalRegistros}</strong> locações
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

            {/* MODAL PARA VISUALIZAR DETALHES E ITENS DA CAÇAMBA */}
            <Modal show={mostrarItens} onHide={() => setMostrarItens(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title><i className="bi bi-list-check me-2"></i> Detalhes da Locação e Caçambas</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* CRONOGRAMA DE DATAS DA LOCAÇÃO */}
                    <h6 className="text-secondary border-bottom pb-2 mb-3">Cronograma de Prazos</h6>
                    <Row className="mb-4 text-center g-2">
                        <Col xs={6} md={3}>
                            <Card className="bg-light border-0 p-2">
                                <small className="text-muted fw-bold">Pedido Realizado</small>
                                <span className="small">
                                    {itensVisualizar?.data_pedido ? new Date(itensVisualizar.data_pedido).toLocaleString('pt-BR') : '---'}
                                </span>
                            </Card>
                        </Col>
                        <Col xs={6} md={3}>
                            <Card className="bg-light border-0 p-2">
                                <small className="text-muted fw-bold">Entrega Fixada</small>
                                <span className="small text-primary fw-bold">
                                    {itensVisualizar?.data_entrega ? new Date(itensVisualizar.data_entrega).toLocaleDateString('pt-BR') : '---'}
                                </span>
                            </Card>
                        </Col>
                        <Col xs={6} md={3}>
                            <Card className="bg-light border-0 p-2">
                                <small className="text-muted fw-bold">Retirada Prevista</small>
                                <span className="small text-warning fw-bold">
                                    {itensVisualizar?.data_retirada_prevista ? new Date(itensVisualizar.data_retirada_prevista).toLocaleDateString('pt-BR') : '---'}
                                </span>
                            </Card>
                        </Col>
                        <Col xs={6} md={3}>
                            <Card className="bg-light border-0 p-2">
                                <small className="text-muted fw-bold">Retirada Real</small>
                                <span className="small text-success fw-bold">
                                    {itensVisualizar?.data_retirada_real ? new Date(itensVisualizar.data_retirada_real).toLocaleDateString('pt-BR') : 'Sem Retirada'}
                                </span>
                            </Card>
                        </Col>
                    </Row>

                    {/* LISTAGEM DE CAÇAMBAS COMPROMISSADAS */}
                    <h6 className="text-secondary border-bottom pb-2 mb-3">Caçambas Vinculadas</h6>
                    <Table striped bordered hover responsive className="mb-0">
                        <thead className="table-light text-center">
                            <tr>
                                <th>Código Caçamba</th>
                                <th>Status do Item</th>
                                <th>Retirada Real</th>
                                <th className="text-end">Valor Unitário</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {itensVisualizar.itens?.map((item, index) => (
                                <tr key={index}>
                                    <td className="fw-bold text-secondary">Caçamba #{item.cacamba?.id || item.itc_cac_id}</td>
                                    <td>
                                        <Badge bg={item.status_item === 'RETIRADA' || item.status_item === 'CONCLUIDA' ? 'success' : 'secondary'}>
                                            {item.status_item || 'AGENDADA'}
                                        </Badge>
                                    </td>
                                    <td>
                                        {item.data_retirada_real ? new Date(item.data_retirada_real).toLocaleDateString('pt-BR') : '---'}
                                    </td>
                                    <td className="text-end fw-bold text-dark">
                                        R$ {parseFloat(item.cacamba?.tipoCacamba?.preco || 0).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
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
                        Confirmar Exclusão de Locação
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center py-4">
                    <div className="mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#dc3545" className="bi bi-eraser-fill" viewBox="0 0 16 16">
                            <path d="M8.086 2.207a2 2 0 0 1 2.828 0l3.879 3.879a2 2 0 0 1 0 2.828l-5.5 5.5A2 2 0 0 1 7.879 15H5.12a2 2 0 0 1-1.414-.586l-2.5-2.5a2 2 0 0 1 0-2.828zm2.121.707a1 1 0 0 0-1.414 0L4.16 7.547l5.293 5.293 4.633-4.633a1 1 0 0 0 0-1.414zM8.746 13.547 3.453 8.254 1.914 9.793a1 1 0 0 0 0 1.414l2.5 2.5a1 1 0 0 0 .707.293H7.88a1 1 0 0 0 .707-.293z"/>
                        </svg>
                    </div>
                    <h5>Você tem certeza?</h5>
                    <p className="text-muted">
                        Esta ação desativará a locação do cliente <strong className="text-danger">{locacaoParaExcluir?.cliente?.nome}</strong> permanente do painel de ativos.
                    </p>
                </Modal.Body>

                <Modal.Footer className="justify-content-center border-0 pb-4">
                    <Button 
                        variant="danger" 
                        onClick={() => confirmarExclusao()}
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
import { Button, Container, Spinner, Table, Modal, Col, FloatingLabel, Form, Card, Row, Pagination, Badge } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { buscarCompras, /*buscarComprasPorItem,*/ removerCompra } from "../../redux/redutores/compraReducer";
import ESTADO from "../../recursos/estado";
import { toast } from "react-toastify";
import { useRef, useEffect, useState } from "react";

export default function TabelaCompras(props) {
    const { estado, mensagem, compras, totalRegistros } = useSelector(state => state.compra);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [compraParaExcluir, setCompraParaExcluir] = useState(null);
    
    // Estados para o Modal de Itens
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
        else{
            props.setFiltros({ 
                ...props.filtros, 
                [name]: value 
            });
        }
        //props.setFiltros({ ...props.filtros, [evento.target.name]: evento.target.value });
    }

    function abrirItens(compra) {
        setItensVisualizar(compra.itens || []);
        setMostrarItens(true);
    }

    function excluirCompra(compra) {
        setCompraParaExcluir(compra);
        setMostrarConfirmacao(true);
    }

    function confirmarExclusao() {
        if (compraParaExcluir) {
            dispatch(removerCompra(compraParaExcluir));
            setMostrarConfirmacao(false);
            setCompraParaExcluir(null);
            buscarComFiltro();
        }
    }

     function editarCompra(compra) {
        props.setCompraParaEdicao(compra);
        props.setModoEdicao(true);
        props.exibirFormulario(true);
    }

    function buscarComFiltro() {
        props.setPaginaAtual(1);
        dispatch(buscarCompras({
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: 0
        }));
    }

    function mudarPagina(numero) {
        props.setPaginaAtual(numero);
        dispatch(buscarCompras({
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: props.itensPorPagina * (numero - 1)
        }));
    }

    useEffect(() => {
        dispatch(buscarCompras({
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
                toast.success("Compras carregadas com sucesso!", { toastId: "sucesso-carga", autoClose: 2000 });
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

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border" style={{ opacity: estado === ESTADO.PENDENTE ? 0.5 : 1 }}>
            
            {/* CABEÇALHO */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h2 className="text-primary mb-0">Gestão de Compras</h2>
                    <small className="text-muted">Histórico de aquisições e fornecedores</small>
                </div>
                <Button variant="success" onClick={() => { props.setModoEdicao(false); props.exibirFormulario(true); }}>
                    <i className="bi bi-cart-plus-fill me-2"></i> Nova Compra
                </Button>
            </div>

            {/* SEÇÃO DE FILTROS PARA COMPRAS */}
            <Card className="mb-4 border-0 shadow-sm bg-light">
                <Card.Body>
                    <h5 className="mb-3 text-secondary">
                        <i className="bi bi-funnel"></i> Filtros de Busca
                    </h5>
                    <Row className="g-2">
                        {/* Filtro por ID da Compra */}
                        <Col md={2}>
                            <FloatingLabel label="Nº da Compra">
                                <Form.Control 
                                    name="id" 
                                    type="number"
                                    placeholder="ID" 
                                    value={props.filtros.id || ''} 
                                    onChange={manipulaMudanca} 
                                />
                            </FloatingLabel>
                        </Col>

                        {/* Filtro por Nome do Fornecedor */}
                        <Col md={4}>
                            <FloatingLabel label="Fornecedor">
                                <Form.Control 
                                    name="fornecedor.nome_fantasia"
                                    placeholder="Nome do fornecedor"
                                    value={props.filtros.fornecedor.nome_fantasia || ''} 
                                    onChange={manipulaMudanca} 
                                />
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

            {/* TABELA PRINCIPAL REESTILIZADA */}
            <div className="table-responsive shadow-sm rounded border">
                <Table hover className="mb-0">
                    <thead className="table-dark text-center">
                        <tr className="align-middle" style={{ height: '60px' }}>
                            <th className="px-4">ID</th>
                            <th>Data da Compra</th>
                            <th className="text-start">Fornecedor</th>
                            <th>Valor Total</th>
                            <th>Itens</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {compras.length > 0 ? (
                            compras.map((compra) => (
                                <tr key={compra.id} className="align-middle text-center" style={{ height: '70px' }}>
                                    <td className="px-4 fw-bold text-primary">#{compra.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center justify-content-center gap-2">
                                            <i className="bi bi-calendar3 text-muted"></i>
                                            {compra.data_compra ? new Date(compra.data_compra).toLocaleDateString('pt-BR') : '---'}
                                        </div>
                                    </td>
                                    <td className="text-start">
                                        <div className="fw-bold text-dark">{compra.fornecedor?.nome_fantasia || 'N/D'}</div>
                                        <small className="text-muted">
                                            <i className="bi bi-person-vcard me-1"></i>
                                            {compra.fornecedor?.cnpj || 'S/ CNPJ'}
                                        </small>
                                    </td>
                                    <td>
                                        <Badge bg="success" className="p-2 fs-6" style={{ minWidth: '120px' }}>
                                            R$ {parseFloat(compra.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm" 
                                            className="rounded-pill px-3"
                                            onClick={() => abrirItens(compra)}
                                        >
                                            <i className="bi bi-box-seam me-1"></i> {compra.itens?.length || 0} Itens
                                        </Button>
                                    </td>
                                    <td>
                                        <div className="d-flex justify-content-center gap-2">
                                            <Button variant="outline-warning" className="p-2 d-flex align-items-center" onClick={() => editarCompra(compra)}>
                                                <i className="bi bi-pencil-fill fs-5"></i>
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                className="p-2 d-flex align-items-center"
                                                onClick={() => excluirCompra(compra)}
                                                title="Excluir Compra"
                                            >
                                                <i className="bi bi-trash-fill"></i>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">
                                    Nenhuma compra encontrada com os filtros selecionados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>

                {/* RODAPÉ IGUAL AO DE USUÁRIOS */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top flex-wrap gap-2">
                    <div className="text-muted small">
                        Exibindo <strong>{compras.length}</strong> de <strong>{totalRegistros}</strong> compras
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

            {/* MODAL PARA VISUALIZAR ITENS DA COMPRA */}
            <Modal show={mostrarItens} onHide={() => setMostrarItens(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title><i className="bi bi-list-check me-2"></i> Detalhes dos Itens</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover responsive>
                        <thead className="table-light">
                            <tr>
                                <th>Produto</th>
                                <th>Marca</th>
                                <th className="text-center">Qtd</th>
                                <th className="text-end">Unitário</th>
                                <th className="text-end">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itensVisualizar.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.produto.descricao}</td>
                                    <td>{item.produto.descricao_marca}</td>
                                    <td className="text-center">{item.quantidade}</td>
                                    <td className="text-end">R$ {parseFloat(item.valor_unitario).toFixed(2)}</td>
                                    <td className="text-end fw-bold">
                                        R$ {(parseFloat(item.quantidade) * parseFloat(item.valor_unitario)).toFixed(2)}
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
                backdrop="static">
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        Confirmar Exclusão
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-center py-4">
                    <div className="mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#dc3545" className="bi bi-person-x-fill" viewBox="0 0 16 16">
                            <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0m-9 8c0 1 1 1 1 1h5.256A4.5 4.5 0 0 1 8 12.5a4.5 4.5 0 0 1 1.544-3.393Q8.844 9.002 8 9c-5 0-6 3-6 4"/>
                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m-.646-4.854.646.647.646-.647a.5.5 0 0 1 .708.708l-.647.646.647.646a.5.5 0 0 1-.708.708l-.646-.647-.646.647a.5.5 0 0 1-.708-.708l.647-.646-.647-.646a.5.5 0 0 1 .708-.708"/>
                        </svg>
                    </div>
                    <h5>Você tem certeza?</h5>
                    <p className="text-muted">
                        Esta ação não poderá ser desfeita. A compra selecionada com {compraParaExcluir?.itens.length > 1 ? "os itens " : "o item"}
                        <strong className="text-danger fw-bold">
                            {compraParaExcluir ? ` ${compraParaExcluir.itens.map((item) => item.produto.descricao).join(', ')} ` : ""}
                        </strong> 
                        será removido permanentemente do sistema.
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
                    >Sim, Excluir</Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => setMostrarConfirmacao(false)}
                        className="px-4 me-2"
                    >Cancelar</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
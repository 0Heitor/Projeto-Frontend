import { Button, Container, Spinner, Table, Modal, Col, FloatingLabel, Form, Card, Row, Pagination, Badge } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { buscarProdutos, removerProduto } from "../../redux/redutores/produtoReducer";
import ESTADO from "../../recursos/estado";
import { toast } from "react-toastify";
import { useRef, useEffect, useState } from "react";

export default function TabelaProdutos(props) {
    const { estado, mensagem, produtos, totalRegistros } = useSelector(state => state.produto);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);

    const totalDePaginas = Math.ceil(totalRegistros / props.itensPorPagina);
    const sucessoExibido = useRef(false);
    const dispatch = useDispatch();

    const manipulaMudanca = (evento) => {
        props.setFiltros({ ...props.filtros, [evento.target.name]: evento.target.value });
    }

    function excluirProduto(produto) {
        setProdutoParaExcluir(produto);
        setMostrarConfirmacao(true);
    }

    function confirmarExclusao() {
        if (produtoParaExcluir) {
            dispatch(removerProduto(produtoParaExcluir));
            setMostrarConfirmacao(false);
            setProdutoParaExcluir(null);
            buscarComFiltro();
        }
    }

    function editarProduto(produto) {
        props.setProdutoParaEdicao(produto);
        props.setModoEdicao(true);
        props.exibirFormulario(true);
    }

    function buscarComFiltro() {
        props.setPaginaAtual(1);
        const novosFiltros = {
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: 0
        };
        dispatch(buscarProdutos(novosFiltros));
    }

    function mudarPagina(numero) {
        props.setPaginaAtual(numero);
        const novoOffset = props.itensPorPagina * (numero - 1);
        const novosFiltros = {
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: novoOffset
        };
        dispatch(buscarProdutos(novosFiltros));
    }

    function mudarQtdItens(novaQuantidade) {
        const qtd = Number(novaQuantidade);
        props.setItensPorPagina(qtd);
        props.setPaginaAtual(1);
        const novosFiltros = {
            ...props.filtros,
            limit: qtd,
            offset: 0
        };
        dispatch(buscarProdutos(novosFiltros));
    }

    useEffect(() => {
        dispatch(buscarProdutos({
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
                    <span>Sincronizando produtos...</span>
                </div>, 
                { toastId: "processando", autoClose: false, theme: "colored" }
            );
        } else if (estado === ESTADO.ERRO) {
            toast.dismiss("processando");
            toast.error(`Erro: ${mensagem}`, { toastId: "erro", theme: "dark" });
        } else if (estado === ESTADO.OCIOSO) {
            toast.dismiss("processando");
            if (!sucessoExibido.current) {
                toast.success("Produtos carregados!", { toastId: "sucesso-carga", autoClose: 2000 });
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
        <Container fluid className="mt-4 p-4 shadow-sm bg-white rounded border" style={{ opacity: estado === ESTADO.PENDENTE ? 0.7 : 1 }}>
            
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h2 className="text-primary mb-0 fw-bold">Catálogo de Produtos</h2>
                    <p className="text-muted mb-0">Gestão de preços, estoque e informações detalhadas</p>
                </div>
                {!props.modoSelecao && (
                    <Button 
                        variant="success" 
                        className="d-flex align-items-center gap-2 shadow-sm"
                        onClick={() => {
                            props.setModoEdicao(false);
                            props.exibirFormulario(true);
                        }}
                    >
                        <i className="bi bi-plus-circle-fill"></i> Novo Produto
                    </Button>
                )}
            </div>

            <Card className="mb-4 border-0 shadow-sm bg-light">
                <Card.Body className="p-3">
                    <h5 className="mb-3 text-secondary"><i className="bi bi-funnel"></i> Filtros de Busca</h5>
                    <Row className="g-3">
                        <Col xl={5} lg={4} md={12}>
                            <FloatingLabel label="Pesquisar por Descrição ou Marca">
                                <Form.Control name="descricao" placeholder="Buscar..." value={props.filtros.descricao} onChange={manipulaMudanca} />
                            </FloatingLabel>
                        </Col>
                        <Col xl={3} lg={3} md={6}>
                            <FloatingLabel label="Cód. Barras / Interno">
                                <Form.Control name="codigo" placeholder="Código" value={props.filtros.codigo} onChange={manipulaMudanca} />
                            </FloatingLabel>
                        </Col>
                        <Col xl={2} lg={3} md={6}>
                            <FloatingLabel label="Status">
                                <Form.Select name="ativo" value={props.filtros.ativo} onChange={manipulaMudanca}>
                                    <option value="">Todos</option>
                                    <option value="true">Ativos</option>
                                    <option value="false">Inativos</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col xl={2} lg={2} md={12} className="d-flex align-items-stretch">
                            <Button variant="primary" className="w-100 shadow-sm" onClick={() => buscarComFiltro()}>
                                <i className="bi bi-search me-2"></i>Buscar
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <div className="table-responsive shadow-sm rounded border">
                {/* Removido o fs-6 para a fonte ficar maior e adicionado o align-middle em todas as células */}
                <Table hover striped className="mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th className="px-4 py-3" style={{ minWidth: '350px' }}>Produto / Identificação</th>
                            <th className="py-3" style={{ minWidth: '150px' }}>Marca & Unidade</th>
                            <th className="text-end py-3">Preço de Venda</th>
                            <th className="text-center py-3">Estoque Atual</th>
                            <th className="text-center py-3">Status</th>
                            <th className="text-center py-3" style={{ minWidth: '180px' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {produtos.map((item) => (
                            <tr key={item.id} className="align-middle">
                                <td className="px-4 py-3">
                                    <div className="fw-bold text-primary fs-5">{item.descricao}</div>
                                    <div className="text-muted small">
                                        <span className="badge bg-light text-dark border me-1">ID: {item.id}</span>
                                        <span className="me-2">Cód: {item.codigo || 'N/A'}</span>
                                        <span>Cód Barras: {item.codigo_de_barras || '-'}</span>
                                    </div>
                                </td>
                                <td className="py-3">
                                    <div className="fw-semibold text-secondary">{item.descricao_marca || 'Sem Marca'}</div>
                                    <Badge bg="info" text="dark" className="mt-1">{item.unidade_medida}</Badge>
                                </td>
                                <td className="text-end fw-bold py-3">
                                    <span className="text-success fs-5">
                                        R$ {parseFloat(item.preco_venda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </td>
                                <td className="text-center py-3">
                                    <div className={`fs-5 fw-bold ${item.estoque <= item.estoque_minimo ? 'text-danger' : 'text-dark'}`}>
                                        {item.estoque}
                                    </div>
                                    <div className="text-muted fw-bold" style={{ fontSize: '0.7rem' }}>MIN: {item.estoque_minimo}</div>
                                </td>
                                <td className="text-center py-3">
                                    <Badge pill bg={item.ativo ? "success" : "danger"} className="px-3 py-2">
                                        {item.ativo ? "ATIVO" : "INATIVO"}
                                    </Badge>
                                </td>
                                <td className="text-center py-3">
                                    {props.modoSelecao ? (
                                        <Button variant="success" className="w-100" onClick={() => props.onSelecionar(item)}>
                                            Selecionar
                                        </Button>
                                    ) : (
                                        <div className="d-flex justify-content-center gap-2">
                                            <Button variant="outline-warning" className="d-flex align-items-center shadow-sm" onClick={() => editarProduto(item)}>
                                                <i className="bi bi-pencil-square me-1"></i> Editar
                                            </Button>
                                            <Button variant="outline-danger" className="d-flex align-items-center shadow-sm" onClick={() => excluirProduto(item)}>
                                                <i className="bi bi-trash3-fill me-1"></i> Excluir
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top flex-wrap gap-2">
                    <div className="text-muted small">
                        Exibindo <strong>{produtos.length}</strong> de <strong>{totalRegistros}</strong> produtos
                    </div>

                    <Pagination className="mb-0 shadow-sm">
                        <Pagination.First onClick={() => mudarPagina(1)} disabled={props.paginaAtual === 1} />
                        <Pagination.Prev onClick={() => mudarPagina(props.paginaAtual - 1)} disabled={props.paginaAtual === 1} />
                        {itensPaginacao}
                        <Pagination.Next onClick={() => mudarPagina(props.paginaAtual + 1)} disabled={props.paginaAtual === totalDePaginas} />
                        <Pagination.Last onClick={() => mudarPagina(totalDePaginas)} disabled={props.paginaAtual === totalDePaginas} />
                    </Pagination>

                    <div className="d-flex align-items-center gap-2 border-start ps-3">
                        <Form.Select 
                            size="sm" 
                            style={{ width: '80px', cursor: 'pointer'}}
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
                        Esta ação não poderá ser desfeita. O produto selecionada 
                        <strong className="text-danger fw-bold">
                            {produtoParaExcluir ? ` ${produtoParaExcluir.descricao} ` : ""}
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
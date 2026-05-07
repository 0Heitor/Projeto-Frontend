import { Button, Container, Spinner, Table, Modal, Col, FloatingLabel, Form, Card, Row, Pagination } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { buscarFornecedores, removerFornecedor } from "../../redux/redutores/fornecedorReducer";
import ESTADO from "../../recursos/estado";
import { toast } from "react-toastify";
import { useRef, useEffect, useState } from "react";

export default function TabelaFornecedores(props) {
    const { estado, mensagem, fornecedores, totalRegistros } = useSelector(state => state.fornecedor);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [fornecedorParaExcluir, setFornecedorParaExcluir] = useState(null);

    const totalDePaginas = Math.ceil(totalRegistros / props.itensPorPagina);
    const sucessoExibido = useRef(false);
    const dispatch = useDispatch();

    const manipulaMudanca = (evento) => {
        props.setFiltros({ ...props.filtros, [evento.target.name]: evento.target.value });
    }

    function excluirFornecedor(fornecedor) {
        setFornecedorParaExcluir(fornecedor);
        setMostrarConfirmacao(true);
    }

    function confirmarExclusao() {
        if (fornecedorParaExcluir) {
            dispatch(removerFornecedor(fornecedorParaExcluir));
            setMostrarConfirmacao(false);
            setFornecedorParaExcluir(null);
            buscarComFiltro();
        }
    }

    function editarFornecedor(fornecedor) {
        props.setFornecedorParaEdicao(fornecedor);
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
        dispatch(buscarFornecedores(novosFiltros));
    }

    function mudarPagina(numero) {
        props.setPaginaAtual(numero);
        const novoOffset = props.itensPorPagina * (numero - 1);
        const novosFiltros = {
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: novoOffset
        };
        dispatch(buscarFornecedores(novosFiltros));
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
        dispatch(buscarFornecedores(novosFiltros));
    }

    useEffect(() => {
        dispatch(buscarFornecedores({
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
                toast.success("Fornecedores carregados com sucesso!", { toastId: "sucesso-carga", autoClose: 2000 });
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
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border" style={{ opacity: estado === ESTADO.PENDENTE ? 0.7 : 1 }}>
            
            {/* CABEÇALHO */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h2 className="text-primary mb-0">Fornecedores</h2>
                    <small className="text-muted">Gerencie sua rede de parceiros e fornecedores</small>
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
                        <i className="bi bi-plus-circle-fill"></i> Novo Fornecedor
                    </Button>
                )}
            </div>

            {/* FILTROS ADAPTADOS */}
            <Card className="mb-4 border-0 shadow-sm bg-light">
                <Card.Body>
                    <h5 className="mb-3 text-secondary"><i className="bi bi-funnel"></i> Filtros de Busca</h5>
                    <Row className="g-2">
                        <Col md={2}>
                            <FloatingLabel label="Código">
                                <Form.Control name="codigo" value={props.filtros.codigo} onChange={manipulaMudanca} placeholder="Código" />
                            </FloatingLabel>
                        </Col>
                        <Col md={4}>
                            <FloatingLabel label="Nome Fantasia">
                                <Form.Control name="nome_fantasia" value={props.filtros.nome_fantasia} onChange={manipulaMudanca} placeholder="Nome Fantasia" />
                            </FloatingLabel>
                        </Col>
                        <Col md={3}>
                            <FloatingLabel label="CNPJ">
                                <Form.Control name="cnpj" value={props.filtros.cnpj} onChange={manipulaMudanca} placeholder="CNPJ" />
                            </FloatingLabel>
                        </Col>
                        <Col md={2}>
                            <FloatingLabel label="Status">
                                <Form.Select name="ativo" value={props.filtros.ativo} onChange={manipulaMudanca}>
                                    <option value="">Todos</option>
                                    <option value="true">Ativos</option>
                                    <option value="false">Inativos</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col md={1} className="d-flex align-items-center">
                            <Button variant="primary" className="w-100 py-3" onClick={buscarComFiltro}>
                                <i className="bi bi-search"></i> Buscar
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* TABELA */}
            <div className="table-responsive shadow-sm rounded border">
                <Table hover className="mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>Código</th>
                            <th>Fornecedor / CNPJ</th>
                            <th>Contato</th>
                            <th>Localização</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fornecedores.map((item) => (
                            <tr key={item.id} className="align-middle">
                                <td className="px-4">
                                    <div className="fw-bold text-primary" style={{ fontSize: '1.2rem' }}>{item.codigo}</div>
                                </td>
                                <td>
                                    <div className="fw-bold text-primary">{item.nome_fantasia}</div>
                                    <small className="text-muted">{item.cnpj}</small>
                                </td>
                                <td>
                                    <div><i className="bi bi-telephone me-1"></i>{item.telefone}</div>
                                </td>
                                <td>
                                    <small>{item.cidade} - {item.uf}</small>
                                    <div className="text-muted" style={{fontSize: '0.8rem'}}>{item.bairro}</div>
                                </td>
                                <td className="text-center">
                                    <span className={`badge rounded-pill ${item.ativo ? 'bg-success' : 'bg-danger'}`}>
                                        {item.ativo ? "ATIVO" : "INATIVO"}
                                    </span>
                                </td>
                                <td className="text-center">
                                    {props.modoSelecao ? (
                                        <Button 
                                            variant="success" 
                                            className="shadow-sm" 
                                            onClick={() => props.onSelecionar(item)}
                                        >
                                            <i className="bi bi-check2-square me-1"></i> Selecionar
                                        </Button>
                                    ) : (
                                        <div className="d-flex justify-content-center gap-3">
                                            <Button variant="outline-warning" className="p-2 d-flex align-items-center" onClick={() => editarFornecedor(item)}>
                                                <i className="bi bi-pencil-fill fs-5"></i>
                                            </Button>
                                            <Button variant="outline-danger" className="p-2 d-flex align-items-center" onClick={() => excluirFornecedor(item)}>
                                                <i className="bi bi-trash-fill fs-5"></i>
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* RODAPÉ E PAGINAÇÃO */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top flex-wrap gap-2">
                    <div className="text-muted small">
                        Exibindo <strong>{fornecedores.length}</strong> de <strong>{totalRegistros}</strong> fornecedores
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

            {/* MODAL DE EXCLUSÃO */}
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
                        Esta ação não poderá ser desfeita. O fornecedor selecionado 
                        <strong className="text-danger fw-bold">
                            {fornecedorParaExcluir ? ` ${fornecedorParaExcluir.nome_fantasia} ` : ""}
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
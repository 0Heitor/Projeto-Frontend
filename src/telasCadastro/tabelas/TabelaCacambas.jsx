import { Button, Container, Spinner, Table, Modal, Col, FloatingLabel, Form, Card, Row, Pagination, Badge } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { buscarCacambas, removerCacamba } from "../../redux/redutores/cacambaReducer";
import ESTADO from "../../recursos/estado";
import { toast } from "react-toastify";
import { useRef, useEffect, useState } from "react";

export default function TabelaCacambas(props){
    const { estado, mensagem, cacambas, totalRegistros } = useSelector(state => state.cacamba);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [cacambaParaExcluir, setCacambaParaExcluir] = useState(null);

    const totalDePaginas = Math.ceil(totalRegistros / props.itensPorPagina);
    const sucessoExibido = useRef(false);
    const dispatch = useDispatch();

    const manipulaMudanca = (evento) => {
        props.setFiltros({ ...props.filtros, [evento.target.name]: evento.target.value });
    }

    function excluirCacamba(cacamba) {
        setCacambaParaExcluir(cacamba);
        setMostrarConfirmacao(true);
    }

    function confirmarExclusao() {
        if (cacambaParaExcluir) {
            dispatch(removerCacamba(cacambaParaExcluir));
            setMostrarConfirmacao(false);
            setCacambaParaExcluir(null);
            buscarComFiltro();
        }
    }

    function editarCacamba(cacamba) {
        props.setCacambaParaEdicao(cacamba);
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
        dispatch(buscarCacambas(novosFiltros));
    }

    function mudarPagina(numero) {
        props.setPaginaAtual(numero);
        const novoOffset = props.itensPorPagina * (numero - 1);
        const novosFiltros = {
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: novoOffset
        };
        dispatch(buscarCacambas(novosFiltros));
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
        dispatch(buscarCacambas(novosFiltros));
    }

    useEffect(() => {
        dispatch(buscarCacambas({
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: props.itensPorPagina * (props.paginaAtual - 1)
        }));
    }, [dispatch, props.paginaAtual, props.itensPorPagina]);

    useEffect(() => {
        if (estado === ESTADO.PENDENTE) {
            sucessoExibido.current = false;
            // Exibe o toast de processamento
            toast.info(
                <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span>Sincronizando dados com o servidor...</span>
                </div>, 
                { toastId: "processando", autoClose: false, theme: "colored" }
            );
        } 
        else if (estado === ESTADO.ERRO) {
            // Remove o de processamento antes de mostrar o erro
            toast.dismiss("processando");
            toast.error(`Ops! ${mensagem}`, { 
                toastId: "erro", 
                theme: "dark",
                autoClose: 5000,
                pauseOnHover: true
            });
        } 
        else if (estado === ESTADO.OCIOSO) {
            // SEMPRE remove o de processamento ao ficar ocioso
            toast.dismiss("processando");

            // Só mostra o sucesso se ele ainda não foi exibido para este ciclo
            if (!sucessoExibido.current) {
                toast.success("Caçambas carregadas com sucesso!", {
                    toastId: "sucesso-carga", // Adicionado ID fixo para evitar duplicatas
                    autoClose: 3000,
                    theme: "light"
                });
                sucessoExibido.current = true;
            }
        }
    }, [estado, mensagem]);

    let itensPaginacao = [];
    for (let numero = 1; numero <= totalDePaginas; numero++) {
        itensPaginacao.push(
            <Pagination.Item
                key={numero}
                active={numero === props.paginaAtual}
                onClick={() => mudarPagina(numero)}
            >
                {numero}
            </Pagination.Item>
        );
    }

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border" style={{ opacity: estado === ESTADO.PENDENTE ? 0.5 : 1 }}>
            
            {/* CABEÇALHO PADRONIZADO */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h2 className="text-primary mb-0">Gestão de Caçambas</h2>
                    <small className="text-muted">Visualize e gerencie o inventário de caçambas do sistema</small>
                </div>
                <Button 
                    variant="success" 
                    className="d-flex align-items-center gap-2 shadow-sm"
                    onClick={() => {
                        props.setModoEdicao(false);
                        props.exibirFormulario(true);
                    }}
                >
                    <i className="bi bi-plus-circle-fill"></i> Nova Caçamba
                </Button>
            </div>

            {/* SEÇÃO DE FILTROS */}
            <Card className="mb-4 border-0 shadow-sm bg-light">
                <Card.Body>
                    <h5 className="mb-3 text-secondary"><i className="bi bi-funnel"></i> Filtros de Busca</h5>
                    <Row className="g-2">
                        <Col md={3}>
                            <FloatingLabel label="Número da Caçamba">
                                <Form.Control name="numero" placeholder="Número" value={props.filtros.numero} onChange={manipulaMudanca} />
                            </FloatingLabel>
                        </Col>
                        <Col md={3}>
                            <FloatingLabel label="Modelo / Tamanho">
                                <Form.Control name="modelo" placeholder="Modelo" value={props.filtros.modelo} onChange={manipulaMudanca} />
                            </FloatingLabel>
                        </Col>
                        <Col md={2}>
                            <FloatingLabel label="Status">
                                <Form.Select name="status" value={props.filtros.status} onChange={manipulaMudanca}>
                                    <option value="">Todos</option>
                                    <option value="DISPONIVEL">DISPONÍVEL</option>
                                    <option value="ALUGADA">ALUGADA</option>
                                    <option value="MANUTENCAO">MANUTENÇÃO</option>
                                    <option value="AGUARDANDO_RETIRADA">AGUARDANDO RETIRADA</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col md={2}>
                            <FloatingLabel label="Situação">
                                <Form.Select name="ativo" value={props.filtros.ativo} onChange={manipulaMudanca}>
                                    <option value="">Todos</option>
                                    <option value="true">Ativas</option>
                                    <option value="false">Inativas</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col md={2} className="d-flex align-items-center">
                            <Button variant="primary" className="w-100 py-3" onClick={() => buscarComFiltro()}>
                                <i className="bi bi-search"></i> Buscar
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* TABELA COM COLUNAS DA IMAGEM E TAMANHO DO EXEMPLO DE USUÁRIOS */}
            <div className="table-responsive shadow-sm rounded border">
                <Table hover className="mb-0 fs-5">
                    <thead className="table-dark">
                        <tr className="align-middle" style={{ height: '60px' }}>
                            <th className="px-4">Nº Caçamba</th>
                            <th>Modelo / Tamanho</th>
                            <th className="text-center">Status</th>
                            <th>Última Revisão</th>
                            <th className="text-center">Situação</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cacambas.map((item) => (
                            <tr key={item.id} className="align-middle" style={{ height: '80px' }}>
                                <td className="px-4">
                                    <div className="fw-bold text-primary" style={{ fontSize: '1.2rem' }}>{item.numero}</div>
                                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>ID: #{item.id}</div>
                                </td>
                                <td>
                                    <div className="fw-bold" style={{ fontSize: '1.1rem' }}>{item.modelo}</div>
                                    <span className="badge bg-secondary" style={{ fontSize: '0.85rem' }}>{item.tipoCacamba !== undefined ? item.tipoCacamba.volume : 'N/A'} m³</span>
                                </td>
                                <td className="text-center">
                                    <span className={`badge p-2 ${item.status === 'DISPONIVEL' ? 'bg-success' : item.status === 'ALUGADA' ? 'bg-info' : 'bg-warning text-dark'}`} style={{ minWidth: '110px' }}>
                                        {
                                            item.status === 'DISPONIVEL' ? "DISPONÍVEL" :
                                            item.status === 'ALUGADA' ? "ALUGADA" :
                                            item.status === 'MANUTENCAO' ? "MANUTENÇÃO" :
                                            item.status
                                        }
                                    </span>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.95rem' }}>
                                        <i className="bi bi-calendar-check me-2"></i>
                                        {item.ultima_revisao ? new Date(item.ultima_revisao).toLocaleDateString('pt-BR') : 'Pendente'}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <span className={`badge rounded-pill p-2 ${item.ativo ? 'bg-success' : 'bg-danger'}`} style={{ minWidth: '100px' }}>
                                        {item.ativo ? "ATIVO" : "INATIVO"}
                                    </span>
                                </td>
                                <td className="text-center">
                                    <div className="d-flex justify-content-center gap-3">
                                        <Button variant="outline-warning" className="p-2 d-flex align-items-center" onClick={() => editarCacamba(item)}>
                                            <i className="bi bi-pencil-fill fs-5"></i>
                                        </Button>
                                        <Button variant="outline-danger" className="p-2 d-flex align-items-center" onClick={() => excluirCacamba(item)}>
                                            <i className="bi bi-trash-fill fs-5"></i>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* RODAPÉ IGUAL AO DE USUÁRIOS */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top flex-wrap gap-2">
                    <div className="text-muted small">
                        Exibindo <strong>{cacambas.length}</strong> de <strong>{totalRegistros}</strong> caçambas
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
                        Esta ação não poderá ser desfeita. A caçamba selecionada 
                        <strong className="text-danger fw-bold">
                            {cacambaParaExcluir ? ` ${cacambaParaExcluir.numero} ` : ""}
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
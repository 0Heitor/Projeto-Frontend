import { Button, Container, Spinner, Table, Modal, Col, FloatingLabel, Form, Card, Row, Pagination } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { buscarUsuarios, removerUsuario } from "../../redux/redutores/usuarioReducer.js";
import ESTADO from "../../recursos/estado";
import { toast } from "react-toastify";
import { useRef, useEffect, useState } from "react";

export default function TabelaUsuarios(props){

    const { estado, mensagem, usuarios, totalRegistros } = useSelector(state => state.usuario);
    const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
    const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null);
    //const [itensPorPagina, setItensPorPagina] = useState(props.itensPorPagina);
    //const [paginaAtual, setPaginaAtual] = useState(props.paginaAtual);

    const totalDePaginas = Math.ceil(totalRegistros / props.itensPorPagina);
    const sucessoExibido = useRef(false);
    const dispatch = useDispatch();
    
    /*const [filtros, setFiltros] = useState({
        nome: "",
        email: "",
        nivel: "",
        ativo: "true"
    });*/

    const manipulaMudanca = (evento) => {
        props.setFiltros({ ...props.filtros, [evento.target.name]: evento.target.value });
    }

    function excluirUsuario(usuario){
        setUsuarioParaExcluir(usuario);
        setMostrarConfirmacao(true);
    }

    function confirmarExclusao(){
        if(usuarioParaExcluir){
            dispatch(removerUsuario(usuarioParaExcluir));
            setMostrarConfirmacao(false);
            setUsuarioParaExcluir(null);
        }
    }

    function editarUsuario(usuario){
        props.setUsuarioParaEdicao(usuario);
        props.setModoEdicao(true);
        props.exibirFormulario(true);
    }

    function buscarComFiltro() {
        //setPaginaAtual(1);
        props.setPaginaAtual(1);
        const novosFiltros = {
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: 0
        };
        dispatch(buscarUsuarios(novosFiltros));
    }

    function mudarPagina(numero) {
        //setPaginaAtual(numero);
        props.setPaginaAtual(numero);
        const novoOffset = props.itensPorPagina * (numero - 1);
        const novosFiltros = {
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: novoOffset
        };
        dispatch(buscarUsuarios(novosFiltros));
    }

    function mudarQtdItens(novaQuantidade) {
        const qtd = Number(novaQuantidade);
        props.setItensPorPagina(qtd);
        //setItensPorPagina(qtd);
        //setPaginaAtual(1);
        props.setPaginaAtual(1);
        
        const novosFiltros = {
            ...props.filtros,
            limit: qtd,
            offset: 0
        };
        dispatch(buscarUsuarios(novosFiltros));
    }

    useEffect(() => {
        dispatch(buscarUsuarios({
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: props.itensPorPagina * (props.paginaAtual - 1)
        }));
    }, [dispatch]);

    useEffect(() => {
        if(estado === ESTADO.PENDENTE){
            sucessoExibido.current = false;
            toast.info(
                <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span>Sincronizando dados com o servidor...</span>
                </div>, 
                { toastId: "processando", autoClose: false, theme: "colored" }
            );
        } 
        else 
        if(estado === ESTADO.ERRO){
            toast.dismiss("processando");
            toast.error(`Ops! ${mensagem}`, { 
                toastId: "erro", 
                theme: "dark",
                autoClose: 5000,
                pauseOnHover: true
            });
        } 
        else 
        if(!sucessoExibido.current && estado === ESTADO.OCIOSO){
            toast.dismiss("processando");
            toast.success("Usuários carregados com sucesso!", {
                autoClose: 3000,
                theme: "light"
            });
            sucessoExibido.current = true;
        }
    }, [estado, mensagem]);

    let itensPaginacao = [];
    for(let numero = 1; numero <= totalDePaginas; numero++){
        itensPaginacao.push(
            <Pagination.Item 
                key={numero} 
                active={numero === props.paginaAtual/*paginaAtual*/}
                value={props.filtros.filtroLimit} 
                onChange={manipulaMudanca}
                onClick={() => mudarPagina(numero)}
            >{numero}</Pagination.Item>
        );
    }

    return(
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border" style={{ opacity: estado === ESTADO.PENDENTE ? 0.5 : 1 }}>
            {/* CABEÇALHO E BOTÃO NOVO */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h2 className="text-primary mb-0">Gestão de Usuários</h2>
                    <small className="text-muted">Visualize e gerencie os acessos ao sistema</small>
                </div>
                <Button 
                    variant="success" 
                    className="d-flex align-items-center gap-2 shadow-sm"
                    onClick={() => {
                        props.setModoEdicao(false);
                        props.exibirFormulario(true);
                    }}
                >
                    <i className="bi bi-person-plus-fill"></i> Novo Usuário
                </Button>
            </div>

            {/* SEÇÃO DE FILTROS */}
            <Card className="mb-4 border-0 shadow-sm bg-light">
                <Card.Body>
                    <h5 className="mb-3 text-secondary"><i className="bi bi-funnel"></i> Filtros de Busca</h5>
                    <Row className="g-2">
                        <Col md={3}>
                            <FloatingLabel label="Filtrar por Nome">
                                <Form.Control 
                                    type="text" 
                                    name="nome" 
                                    placeholder="Nome" 
                                    value={props.filtros.nome} 
                                    onChange={manipulaMudanca} 
                                />
                            </FloatingLabel>
                        </Col>
                        <Col md={3}>
                            <FloatingLabel label="Filtrar por Email">
                                <Form.Control 
                                    type="email" 
                                    name="email" 
                                    placeholder="Email" 
                                    value={props.filtros.email} 
                                    onChange={manipulaMudanca} 
                                />
                            </FloatingLabel>
                        </Col>
                        <Col md={2}>
                            <FloatingLabel label="Nível">
                                <Form.Select name="nivel" value={props.filtros.nivel} onChange={manipulaMudanca}>
                                    <option value="">Todos</option>
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="OPERADOR">OPERADOR</option>
                                    <option value="BAIXO">BAIXO</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col md={2}>
                            <FloatingLabel label="Status">
                                <Form.Select name="ativo" value={props.filtros.ativo} onChange={manipulaMudanca}>
                                    <option value="">Todos</option>
                                    <option value="true">Ativos</option>
                                    <option value="false">Desativados</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col md={2} className="d-flex align-items-center">
                            <Button 
                                variant="primary" 
                                className="w-100 py-3" 
                                onClick={() => buscarComFiltro()}
                            >
                                <i className="bi bi-search"></i> Buscar
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* TABELA */}
            <div className="table-responsive shadow-sm rounded border">
                <Table hover className="mb-0 fs-5">
                    <thead className="table-dark">
                        <tr className="align-middle" style={{ height: '60px' }}>
                            <th className="px-4">ID</th>
                            <th className="px-4">Usuário</th>
                            <th>Nível</th>
                            <th>Status</th>
                            <th>Datas (Acesso/Criação)</th>
                            <th className="text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((usuario) => (
                            <tr key={usuario.email} className="align-middle" style={{ height: '80px' }}>
                                <td className="px-4">
                                    <span className="badge bg-light text-dark border p-2">#{usuario.id}</span>
                                </td>
                                <td className="px-4">
                                    <div className="fw-bold" style={{ fontSize: '1.2rem' }}>{usuario.nome}</div>
                                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>{usuario.email}</div>
                                </td>
                                <td>
                                    <span className={`badge p-2 ${usuario.nivel === 'ADMIN' ? 'bg-info' : 'bg-secondary'}`} style={{ minWidth: '100px' }}>
                                        {usuario.nivel}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge rounded-pill p-2 ${usuario.ativo ? 'bg-success' : 'bg-danger'}`} style={{ minWidth: '100px' }}>
                                        {usuario.ativo ? "ATIVO" : "INATIVO"}
                                    </span>
                                </td>
                                <td style={{ fontSize: '0.95rem' }}>
                                    <div><i className="bi bi-box-arrow-in-right me-2"></i> {new Date(usuario.ultimo_login).toLocaleString('pt-BR')}</div>
                                    <div className="text-muted"><i className="bi bi-calendar-plus me-2"></i> {new Date(usuario.criado).toLocaleString('pt-BR')}</div>
                                </td>
                                <td className="text-center">
                                    <div className="d-flex justify-content-center gap-3"> {/* Aumentei o gap entre botões */}
                                        {/* Removi o size="sm" para os botões ficarem maiores */}
                                        <Button variant="outline-warning" className="p-2 d-flex align-items-center" onClick={() => editarUsuario(usuario)} title="Editar">
                                            <i className="bi bi-pencil-fill fs-5"></i>
                                        </Button>
                                        <Button variant="outline-danger" className="p-2 d-flex align-items-center" onClick={() => excluirUsuario(usuario)} title="Excluir">
                                            <i className="bi bi-trash-fill fs-5"></i>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {/* RODAPÉ COM PAGINAÇÃO E SELETOR */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top flex-wrap gap-2">
                    
                    {/* 1. INFORMAÇÃO DE CONTAGEM */}
                    <div className="text-muted small">
                        Exibindo <strong>{usuarios.length}</strong> usuários de um total de <strong>{totalRegistros || usuarios.length}</strong>
                    </div>

                    {/* 2. PAGINAÇÃO (CENTRALIZADA) */}
                    <Pagination className="mb-0 shadow-sm">
                        <Pagination.First onClick={() => mudarPagina(1)} disabled={props.paginaAtual === 1} />
                        <Pagination.Prev onClick={() => mudarPagina(props.paginaAtual - 1)} disabled={props.paginaAtual === 1} />
                        
                        {/* Renderização dinâmica dos itens aqui */}
                        {/* <Pagination.Item active={paginaAtual === 1} onClick={() => mudarPagina(1)}>{1}</Pagination.Item>
                        {totalDePaginas > 1 && <Pagination.Item active={paginaAtual === 2} onClick={() => mudarPagina(2)}>{2}</Pagination.Item>}
                        {totalDePaginas > 2 && <Pagination.Item active={paginaAtual === 3} onClick={() => mudarPagina(3)}>{3}</Pagination.Item>} */}

                        {itensPaginacao}

                        <Pagination.Next onClick={() => mudarPagina(props.paginaAtual + 1)} disabled={props.paginaAtual === totalDePaginas} />
                        <Pagination.Last onClick={() => mudarPagina(totalDePaginas)} disabled={props.paginaAtual === totalDePaginas} />
                    </Pagination>

                    {/* 3. SELETOR DE QUANTIDADE (À DIREITA) */}
                    <div className="d-flex align-items-center gap-2 border-start ps-3">
                        <span className="small text-muted">Itens por página:</span>
                        <Form.Select 
                            size="sm" 
                            style={{ width: '80px', cursor: 'pointer' }}
                            value={props.itensPorPagina} // Esta variável deve estar no seu useState
                            onChange={(e) => {mudarQtdItens(e.target.value)}}
                        >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
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
                        Esta ação não poderá ser desfeita. O usuário selecionado 
                        <strong className="text-danger fw-bold">
                            {usuarioParaExcluir ? ` ${usuarioParaExcluir.nome} ` : ""}
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
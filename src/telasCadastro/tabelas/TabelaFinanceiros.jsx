import { Button, Container, Spinner, Table, Col, FloatingLabel, Form, Card, Row, Pagination, Badge } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { buscarFinanceiros } from "../../redux/redutores/financeiroReducer.js";
import ESTADO from "../../recursos/estado";
import { toast } from "react-toastify";
import { useRef, useEffect } from "react";

export default function TabelaFinanceiros(props) {
    const { estado, mensagem, financeiros, totalRegistros } = useSelector(state => state.financeiro);

    const totalDePaginas = Math.ceil((totalRegistros || 0) / props.itensPorPagina);
    const sucessoExibido = useRef(false);
    const dispatch = useDispatch();

    const manipulaMudanca = (evento) => {
        props.setFiltros({ ...props.filtros, [evento.target.name]: evento.target.value });
    };

    function buscarComFiltro() {
        props.setPaginaAtual(1);
        const novosFiltros = {
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: 0
        };
        dispatch(buscarFinanceiros(novosFiltros));
    }

    function mudarPagina(numero) {
        props.setPaginaAtual(numero);
        const novoOffset = props.itensPorPagina * (numero - 1);
        const novosFiltros = {
            ...props.filtros,
            limit: props.itensPorPagina,
            offset: novoOffset
        };
        dispatch(buscarFinanceiros(novosFiltros));
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
        dispatch(buscarFinanceiros(novosFiltros));
    }

    useEffect(() => {
        dispatch(buscarFinanceiros({
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
                toast.success("Títulos a receber carregados com sucesso!", { toastId: "sucesso-carga", autoClose: 2000 });
                sucessoExibido.current = true;
            }
        }
    }, [estado, mensagem]);

    // Formatação de moeda e datas
    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
    };

    const formatarData = (dataString) => {
        if (!dataString) return "-";
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const renderizarBadgeStatus = (status) => {
        const statusUpper = status?.toUpperCase();
        switch (statusUpper) {
            case 'PAGO':
                return <Badge bg="success"><i className="bi bi-check-circle me-1"></i>PAGO</Badge>;
            case 'ATRASADO':
                return <Badge bg="danger"><i className="bi bi-exclamation-triangle me-1"></i>ATRASADO</Badge>;
            default:
                return <Badge bg="warning" text="dark"><i className="bi bi-clock me-1"></i>PENDENTE</Badge>;
        }
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
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border" style={{ opacity: estado === ESTADO.PENDENTE ? 0.7 : 1 }}>
            
            {/* CABEÇALHO */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <div>
                    <h2 className="text-primary mb-0">Contas a Receber</h2>
                    <small className="text-muted">Consulta de lançamentos e recebimentos financeiros</small>
                </div>
            </div>

            {/* FILTROS ADAPTADOS (NOME CLIENTE, STATUS E ATIVO) */}
            <Card className="mb-4 border-0 shadow-sm bg-light">
                <Card.Body>
                    <h5 className="mb-3 text-secondary"><i className="bi bi-funnel"></i> Filtros de Busca</h5>
                    <Row className="g-2">
                        <Col md={5}>
                            <FloatingLabel label="Nome do Cliente">
                                <Form.Control name="nome" value={props.filtros.nome || ""} onChange={manipulaMudanca} placeholder="Cliente" />
                            </FloatingLabel>
                        </Col>
                        <Col md={3}>
                            <FloatingLabel label="Status">
                                <Form.Select name="status" value={props.filtros.status || ""} onChange={manipulaMudanca}>
                                    <option value="">Todos</option>
                                    <option value="PENDENTE">Pendente</option>
                                    <option value="PAGO">Pago</option>
                                    <option value="ATRASADO">Atrasado</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col md={2}>
                            <FloatingLabel label="Ativo">
                                <Form.Select name="ativo" value={props.filtros.ativo || ""} onChange={manipulaMudanca}>
                                    <option value="">Todos</option>
                                    <option value="true">Sim (Ativos)</option>
                                    <option value="false">Não (Inativos)</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col md={2} className="d-flex align-items-center">
                            <Button variant="primary" className="w-100 py-3" onClick={buscarComFiltro}>
                                <i className="bi bi-search"></i> Buscar
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* TABELA DE CONSULTA */}
            <div className="table-responsive shadow-sm rounded border">
                <Table hover className="mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-center">Cód.</th>
                            <th>Cliente</th>
                            <th>Origem / Pagamento</th>
                            <th>Valor Total</th>
                            <th className="text-center">Vencimento</th>
                            <th className="text-center">Data Pagto.</th>
                            <th className="text-center">Status</th>
                            {props.modoSelecao && <th className="text-center">Ações</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {financeiros && financeiros.length > 0 ? (
                            financeiros.map((item) => (
                                <tr key={item.id} className="align-middle">
                                    <td className="text-center fw-bold text-primary">
                                        #{item.id}
                                    </td>
                                    <td>
                                        <div className="fw-bold text-dark">{item.cliente.nome || `Cliente #${item.cliente.id}`}</div>
                                        {item.cliente.cpf_cnpj && <small className="text-muted">{item.cliente.cpf_cnpj}</small>}
                                    </td>
                                    <td>
                                        <Badge bg="secondary" className="me-2">{item.origem_tipo}</Badge>
                                        <small className="text-muted d-block mt-1"><i className="bi bi-credit-card me-1"></i>{item.forma_pagamento}</small>
                                    </td>
                                    <td className="fw-bold text-success">
                                        {formatarMoeda(item.valor_total)}
                                    </td>
                                    <td className="text-center fw-semibold">
                                        {formatarData(item.data_vencimento)}
                                    </td>
                                    <td className="text-center text-muted">
                                        {formatarData(item.data_pagamento)}
                                    </td>
                                    <td className="text-center">
                                        {renderizarBadgeStatus(item.status)}
                                    </td>
                                    {props.modoSelecao && (
                                        <td className="text-center">
                                            <Button 
                                                variant="success" 
                                                size="sm"
                                                className="shadow-sm" 
                                                onClick={() => props.onSelecionar(item)}
                                            >
                                                <i className="bi bi-check2-square me-1"></i> Selecionar
                                            </Button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={props.modoSelecao ? 8 : 7} className="text-center py-4 text-muted">
                                    Nenhum registro financeiro encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>

                {/* RODAPÉ E PAGINAÇÃO */}
                <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top flex-wrap gap-2">
                    <div className="text-muted small">
                        Exibindo <strong>{financeiros?.length || 0}</strong> de <strong>{totalRegistros || 0}</strong> financeiros
                    </div>

                    <Pagination className="mb-0 shadow-sm">
                        <Pagination.First onClick={() => mudarPagina(1)} disabled={props.paginaAtual === 1} />
                        <Pagination.Prev onClick={() => mudarPagina(props.paginaAtual - 1)} disabled={props.paginaAtual === 1} />
                        {itensPaginacao}
                        <Pagination.Next onClick={() => mudarPagina(props.paginaAtual + 1)} disabled={props.paginaAtual === totalDePaginas || totalDePaginas === 0} />
                        <Pagination.Last onClick={() => mudarPagina(totalDePaginas)} disabled={props.paginaAtual === totalDePaginas || totalDePaginas === 0} />
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
        </Container>
    );
}
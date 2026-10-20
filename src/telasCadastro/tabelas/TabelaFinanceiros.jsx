import { Button, Container, Spinner, Table, Col, FloatingLabel, Form, Card, Row, Pagination, Badge, Modal } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { buscarFinanceiros, atualizarFinanceiro } from "../../redux/redutores/financeiroReducer.js";
import ESTADO from "../../recursos/estado";
import { toast } from "react-toastify";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "../../contexto/AuthContext";

export default function TabelaFinanceiros(props) {
    const { estado, mensagem, financeiros, totalRegistros } = useSelector(state => state.financeiro);

    const totalDePaginas = Math.ceil((totalRegistros || 0) / props.itensPorPagina);
    const sucessoExibido = useRef(false);
    const dispatch = useDispatch();

    const { user } = useAuth();
    const isAdmin = user?.nivel === "ADMIN";

    // ESTADOS PARA O MODAL DE EDIÇÃO
    const [exibirModalEdicao, setExibirModalEdicao] = useState(false);
    const [itemEditando, setItemEditando] = useState(null);

    const manipulaMudanca = (evento) => {
        props.setFiltros({ ...props.filtros, [evento.target.name]: evento.target.value });
    };

    // ABRIR E FECHAR MODAL DE EDIÇÃO
    const abrirModalEdicao = (item) => {
        setItemEditando({
            ...item,
            descricao: item.descricao || '',
            valor_recebido: item.valor_recebido || item.valor_total || '',
            forma_pagamento: item.forma_pagamento || 'PIX',
            status: item.status || 'PENDENTE',
            ativo: item.ativo !== undefined ? String(item.ativo) : 'true'
        });
        setExibirModalEdicao(true);
    };

    const fecharModalEdicao = () => {
        setExibirModalEdicao(false);
        setItemEditando(null);
    };

    const manipulaMudancaEdicao = (evento) => {
        const { name, value } = evento.target;
        setItemEditando(prev => ({ ...prev, [name]: value }));
    };

    const salvarEdicao = () => {
        if (!itemEditando) return;

        // Monta o objeto formatado para atualizar via Redux
        const dadosAtualizados = {
            ...itemEditando,
            data_pagamento: new Date().toISOString().split('T')[0] || null,
            ativo: itemEditando.ativo === 'true' || itemEditando.ativo === true
        };
        dispatch(atualizarFinanceiro(dadosAtualizados));
        fecharModalEdicao();
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

            {/* FILTROS ADAPTADOS (NOME CLIENTE, STATUS, ATIVO E PERÍODO DE DATA) */}
            <Card className="mb-4 border-0 shadow-sm bg-light">
                <Card.Body>
                    <h5 className="mb-3 text-secondary"><i className="bi bi-funnel"></i> Filtros de Busca</h5>
                    <Row className="g-2">
                        <Col md={4}>
                            <FloatingLabel label="Nome do Cliente">
                                <Form.Control name="nome" value={props.filtros.nome || ""} onChange={manipulaMudanca} placeholder="Cliente" />
                            </FloatingLabel>
                        </Col>
                        <Col md={2}>
                            <FloatingLabel label="Data Vencimento">
                                <Form.Control 
                                    type="date" 
                                    name="data_vencimento" 
                                    value={props.filtros.data_vencimento || ""} 
                                    onChange={manipulaMudanca} 
                                />
                            </FloatingLabel>
                        </Col>
                        <Col md={2}>
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
                                    <option value="true">Sim</option>
                                    <option value="false">Não</option>
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
                            <th className="text-center">Ações</th>
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
                                        <div className="fw-bold text-dark">{item.cliente?.nome || `Cliente #${item.cliente?.id}`}</div>
                                        {item.cliente?.cpf_cnpj && <small className="text-muted">{item.cliente.cpf_cnpj}</small>}
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
                                    {isAdmin && (    
                                        <td className="text-center py-3">
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button 
                                                    variant="outline-warning" 
                                                    className="d-flex align-items-center shadow-sm" 
                                                    onClick={() => abrirModalEdicao(item)}
                                                >
                                                    <i className="bi bi-pencil-square me-1"></i> Editar
                                                </Button>
                                            </div>
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

            {/* MODAL DE EDIÇÃO DE REGISTRO FINANCEIRO */}
            <Modal show={exibirModalEdicao} onHide={fecharModalEdicao} centered backdrop="static" size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>
                        <i className="bi bi-pencil-square me-2"></i>
                        Editar Financeiro #{itemEditando?.id}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {itemEditando && (() => {
                        // Cálculos dinâmicos de Troco / Saldo
                        const valorTotal = Number(itemEditando.valor_total || 0);
                        const valorRecebido = Number(itemEditando.valor_recebido || 0);
                        const diferenca = valorRecebido - valorTotal;

                        // Definição da cor e mensagem do status de troco/saldo
                        let badgeBg = "secondary";
                        let mensagemTroco = "Informe o valor recebido";
                        let iconeTroco = "bi-cash-stack";

                        if (itemEditando.valor_recebido !== undefined && itemEditando.valor_recebido !== "") {
                            if (Math.abs(diferenca) < 0.01) {
                                badgeBg = "success";
                                mensagemTroco = "Valor exato! Sem troco.";
                                iconeTroco = "bi-check-circle-fill";
                            } else if (diferenca > 0) {
                                badgeBg = "info";
                                mensagemTroco = `Troco a devolver: ${formatarMoeda(diferenca)}`;
                                iconeTroco = "bi-arrow-left-right";
                            } else {
                                badgeBg = "danger";
                                mensagemTroco = `Valor insuficiente! Faltando: ${formatarMoeda(Math.abs(diferenca))}`;
                                iconeTroco = "bi-exclamation-triangle-fill";
                            }
                        }

                        return (
                            <Form>
                                {/* INFORMAÇÕES BÁSICAS DO REGISTRO */}
                                <div className="mb-3 p-3 bg-light rounded border">
                                    <Row>
                                        <Col md={6}>
                                            <div><strong>Cliente:</strong> {itemEditando.cliente?.nome || `Cliente #${itemEditando.cliente?.id}`}</div>
                                            <div><strong>Vencimento:</strong> {formatarData(itemEditando.data_vencimento)}</div>
                                        </Col>
                                        <Col md={6} className="text-md-end">
                                            <div><strong>Valor Total da Conta:</strong></div>
                                            <div className="fs-4 fw-bold text-primary">{formatarMoeda(valorTotal)}</div>
                                        </Col>
                                    </Row>
                                </div>

                                <Row className="g-3">
                                    {/* CAMPO DE DESCRIÇÃO (TEXTAREA) */}
                                    <Col md={12}>
                                        <FloatingLabel label="Descrição / Observações">
                                            <Form.Control 
                                                as="textarea"
                                                rows={2}
                                                style={{ height: '80px' }}
                                                name="descricao" 
                                                placeholder="Descrição"
                                                value={itemEditando.descricao || ''} 
                                                onChange={manipulaMudancaEdicao}
                                            />
                                        </FloatingLabel>
                                    </Col>

                                    {/* VALOR RECEBIDO E CÁLCULO DE TROCO */}
                                    <Col md={6}>
                                        <FloatingLabel label="Valor Recebido (R$)">
                                            <Form.Control 
                                                type="number"
                                                step="0.01"
                                                name="valor_recebido" 
                                                placeholder="0,00"
                                                value={itemEditando.valor_recebido ?? ''} 
                                                onChange={manipulaMudancaEdicao}
                                            />
                                        </FloatingLabel>
                                    </Col>

                                    {/* DISPLAY DINÂMICO DE TROCO OU PENDÊNCIA */}
                                    <Col md={6} className="d-flex align-items-center">
                                        <Card className={`w-100 border-0 bg-${badgeBg} bg-opacity-10 border-start border-4 border-${badgeBg}`}>
                                            <Card.Body className="py-2 px-3">
                                                <small className={`text-${badgeBg === 'info' ? 'dark' : badgeBg} fw-bold d-block`}>
                                                    <i className={`bi ${iconeTroco} me-1`}></i> Situação do Pagamento:
                                                </small>
                                                <div className={`fs-6 fw-bold text-${badgeBg === 'info' ? 'dark' : badgeBg}`}>
                                                    {mensagemTroco}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    {/* FORMA DE PAGAMENTO */}
                                    <Col md={4}>
                                        <FloatingLabel label="Forma de Pagamento">
                                            <Form.Select 
                                                name="forma_pagamento" 
                                                value={itemEditando.forma_pagamento || ''} 
                                                onChange={manipulaMudancaEdicao}
                                            >
                                                <option value="PIX">PIX</option>
                                                <option value="BOLETO">Boleto</option>
                                                <option value="DINHEIRO">Dinheiro</option>
                                                <option value="CARTAO">Cartão</option>
                                            </Form.Select>
                                        </FloatingLabel>
                                    </Col>

                                    {/* STATUS FINANCEIRO */}
                                    <Col md={4}>
                                        <FloatingLabel label="Status Financeiro">
                                            <Form.Select 
                                                name="status" 
                                                value={itemEditando.status || 'PENDENTE'} 
                                                onChange={manipulaMudancaEdicao}
                                            >
                                                <option value="PENDENTE">PENDENTE</option>
                                                <option value="PAGO">PAGO</option>
                                                <option value="ATRASADO">ATRASADO</option>
                                            </Form.Select>
                                        </FloatingLabel>
                                    </Col>

                                    {/* REGISTRO ATIVO */}
                                    <Col md={4}>
                                        <FloatingLabel label="Registro Ativo">
                                            <Form.Select 
                                                name="ativo" 
                                                value={String(itemEditando.ativo)} 
                                                onChange={manipulaMudancaEdicao}
                                            >
                                                <option value="true">Sim (Ativo)</option>
                                                <option value="false">Não (Inativo)</option>
                                            </Form.Select>
                                        </FloatingLabel>
                                    </Col>
                                </Row>
                            </Form>
                        );
                    })()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={fecharModalEdicao}>
                        <i className="bi bi-x-circle me-1"></i> Cancelar
                    </Button>
                    <Button variant="success" onClick={salvarEdicao}>
                        <i className="bi bi-check-circle me-1"></i> Confirmar Alteração
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
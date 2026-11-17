import { Button, Container, Spinner, Table, Modal, Col, FloatingLabel, Form, Card, Row, Pagination, ButtonGroup, Badge } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { buscarVendas } from "../../redux/redutores/vendaReducer";
import ESTADO from "../../recursos/estado";
import { toast } from "react-toastify";
import { useRef, useEffect, useState } from "react";
import { useAuth } from "../../contexto/AuthContext";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RelatorioVendas(props) {
    const { estado, mensagem, vendas = [], totalRegistros = 0 } = useSelector(state => state.venda);
    
    // Estados específicos para o relatório
    const [modoVisualizacao, setModoVisualizacao] = useState("tabela"); // "tabela" ou "grafico"
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
        } else {
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

    // Funções de Download (Simuladas - Integre com sua biblioteca de preferência)
    const exportarExcel = () => {
        toast.success("Gerando relatório em Excel...");
        // Exemplo: exportar usando a biblioteca 'xlsx'
    };

    const exportarPDF = () => {
        toast.success("Gerando relatório estilizado em PDF...");
        // Exemplo: exportar usando 'jspdf' ou 'html2pdf.js'
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
                    <span>Sincronizando relatório com o servidor...</span>
                </div>, 
                { toastId: "processando-rel", autoClose: false, theme: "colored" }
            );
        } else if (estado === ESTADO.ERRO) {
            toast.dismiss("processando-rel");
            toast.error(`Ops! ${mensagem}`, { toastId: "erro-rel", theme: "dark" });
        } else if (estado === ESTADO.OCIOSO) {
            toast.dismiss("processando-rel");
            if (!sucessoExibido.current) {
                toast.success("Relatório de vendas carregado!", { toastId: "sucesso-carga-rel", autoClose: 2000 });
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
            case 'PAGO': return <Badge bg="success">PAGO</Badge>;
            case 'CANCELADO': return <Badge bg="danger">CANCELADO</Badge>;
            default: return <Badge bg="warning" text="dark">PENDENTE</Badge>;
        }
    };

    // Configuração dos dados do Gráfico
    const dadosGrafico = {
        labels: vendas.map(v => `#${v.id} - ${v.criado_em ? new Date(v.criado_em).toLocaleDateString('pt-BR') : ''}`),
        datasets: [
            {
                label: 'Valor Total (R$)',
                data: vendas.map(v => parseFloat(v.total || 0)),
                backgroundColor: 'rgba(13, 110, 253, 0.7)',
                borderColor: 'rgba(13, 110, 253, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border" style={{ opacity: estado === ESTADO.PENDENTE ? 0.5 : 1 }}>
            
            {/* CABEÇALHO COM BOTÕES DE DOWNLOAD E ALTERNÂNCIA */}
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 flex-wrap gap-3">
                <div>
                    <h2 className="text-primary mb-0"><i className="bi bi-file-earmark-bar-graph me-2"></i> Relatório de Vendas</h2>
                    <small className="text-muted">Acompanhamento analítico e exportação de dados</small>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                    {/* Botões para alternar Tabela / Gráfico */}
                    <ButtonGroup className="shadow-sm">
                        <Button 
                            variant={modoVisualizacao === "tabela" ? "primary" : "outline-primary"}
                            onClick={() => setModoVisualizacao("tabela")}
                        >
                            <i className="bi bi-table me-1"></i> Tabela
                        </Button>
                        <Button 
                            variant={modoVisualizacao === "grafico" ? "primary" : "outline-primary"}
                            onClick={() => setModoVisualizacao("grafico")}
                        >
                            <i className="bi bi-bar-chart-fill me-1"></i> Gráfico
                        </Button>
                    </ButtonGroup>

                    {/* Botões de Download Superior Direito */}
                    <Button variant="outline-success" className="d-flex align-items-center shadow-sm" onClick={exportarExcel} title="Baixar Excel">
                        <i className="bi bi-file-earmark-excel-fill fs-5 me-1"></i> Excel
                    </Button>
                    <Button variant="outline-danger" className="d-flex align-items-center shadow-sm" onClick={exportarPDF} title="Baixar PDF">
                        <i className="bi bi-file-earmark-pdf-fill fs-5 me-1"></i> PDF
                    </Button>
                </div>
            </div>

            {/* SEÇÃO DE FILTROS COM DATA INÍCIO, FIM E FORMA DE PAGAMENTO */}
            <Card className="mb-4 border-0 shadow-sm bg-light">
                <Card.Body>
                    <h5 className="mb-3 text-secondary">
                        <i className="bi bi-funnel"></i> Filtros do Relatório
                    </h5>
                    <Row className="g-2">
                        {/* Filtro por ID */}
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

                        {/* Filtro por Cliente */}
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

                        {/* Filtro por Forma de Pagamento (Formato de Seleção) */}
                        <Col md={2}>
                            <FloatingLabel label="Forma de Pagamento">
                                <Form.Select name="forma_pagamento" value={props.filtros.forma_pagamento || ''} onChange={manipulaMudanca}>
                                    <option value="">Todas</option>
                                    <option value="DINHEIRO">Dinheiro</option>
                                    <option value="PIX">Pix</option>
                                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                                    <option value="CARTAO_DEBITO">Cartão de Débito</option>
                                    <option value="BOLETO">Boleto</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>

                        {/* Filtro por Data Início */}
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

                        {/* Filtro por Data Fim */}
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
                            <Button variant="primary" className="w-100 py-3 shadow-sm" onClick={buscarComFiltro}>
                                <i className="bi bi-search me-1"></i> Filtrar
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* RENDERIZAÇÃO CONDICIONAL: TABELA OU GRÁFICO */}
            {modoVisualizacao === "tabela" ? (
                <div className="table-responsive shadow-sm rounded border">
                    <Table hover className="mb-0">
                        <thead className="table-dark text-center">
                            <tr className="align-middle" style={{ height: '60px' }}>
                                <th className="px-4">ID</th>
                                <th>Data</th>
                                <th className="text-start">Cliente</th>
                                <th>Forma Pagamento</th>
                                <th>Status</th>
                                <th>Valor Total</th>
                                <th>Itens</th>
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
                                            <small className="text-muted">{venda.cliente?.cpf_cnpj || 'Sem Documento'}</small>
                                        </td>
                                        <td>{venda.forma_pagamento || 'N/D'}</td>
                                        <td>{renderBadgeStatus(venda.status)}</td>
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
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        Nenhum registro encontrado para este relatório.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {/* RODAPÉ E PAGINAÇÃO */}
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light border-top flex-wrap gap-2">
                        <div className="text-muted small">
                            Exibindo <strong>{vendas.length}</strong> de <strong>{totalRegistros}</strong> registros
                        </div>

                        <Pagination className="mb-0 shadow-sm">
                            <Pagination.First onClick={() => mudarPagina(1)} disabled={props.paginaAtual === 1} />
                            <Pagination.Prev onClick={() => mudarPagina(props.paginaAtual - 1)} disabled={props.paginaAtual === 1} />
                            {itensPaginacao}
                            <Pagination.Next onClick={() => mudarPagina(props.paginaAtual + 1)} disabled={props.paginaAtual === totalDePaginas} />
                            <Pagination.Last onClick={() => mudarPagina(totalDePaginas)} disabled={props.paginaAtual === totalDePaginas} />
                        </Pagination>

                        <div className="d-flex align-items-center gap-2 border-start ps-3">
                            <span className="small text-muted">Por página:</span>
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
            ) : (
                /* EXIBIÇÃO EM GRÁFICO */
                <Card className="border-0 shadow-sm p-4">
                    <div style={{ height: '400px', display: 'flex', justifyContent: 'center' }}>
                        <Bar 
                            data={dadosGrafico} 
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'top' },
                                    title: { display: true, text: 'Desempenho de Vendas por Período' }
                                }
                            }} 
                        />
                    </div>
                </Card>
            )}

            {/* MODAL PARA VISUALIZAR ITENS DA VENDA */}
            <Modal show={mostrarItens} onHide={() => setMostrarItens(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title><i className="bi bi-list-check me-2"></i> Itens da Venda #{vendaSelecionada?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover responsive>
                        <thead className="table-light">
                            <tr>
                                <th>Produto</th>
                                <th>Marca</th>
                                <th className="text-center">Qtd</th>
                                <th className="text-end">Preço Unitário</th>
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
                                        <td className="text-end fw-bold">R$ {(qtd * preco).toFixed(2)}</td>
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

        </Container>
    );
}
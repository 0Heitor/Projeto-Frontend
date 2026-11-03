import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner, Table, Card, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { adicionarVenda, atualizarVenda } from '../../redux/redutores/vendaReducer';
import ModalSelecaoCliente from "../modais/ModalSelecaoCliente";
import ModalSelecaoUsuario from "../modais/ModalSelecaoUsuario";
import ModalSelecaoProduto from "../modais/ModalSelecaoProduto";
import ESTADO from '../../recursos/estado';

export default function FormCadVenda(props) {
    const vendaVazia = {
        id: '0',
        data_venda: new Date().toISOString().split('T')[0],
        cliente: { id: '0', nome: '', cpf_cnpj: '' },
        usuario: { id: '0', nome: '' },
        itens: [],
        total: 0,
        forma_pagamento: 'PIX',
        status: 'PENDENTE',
        ativo: true,
    };

    function mapearItensEdicao(itens = []) {
        return itens.map(item => ({
            ...item,
            quantidade: parseFloat(item.quantidade) || 1,
            valor_unitario: parseFloat(item.produto?.preco_venda ?? item.valor_unitario ?? 0),
            status: item.status || 'PROCESSANDO',
            ativo: item.ativo ?? true
        }));
    }

    const [venda, setVenda] = useState(() => {
        if (props.vendaParaEdicao) {
            return {
                ...props.vendaParaEdicao,
                itens: mapearItensEdicao(props.vendaParaEdicao.itens)
            };
        }
        return vendaVazia;
    });

    const [showModalCliente, setShowModalCliente] = useState(false);
    const [showModalUsuario, setShowModalUsuario] = useState(false);
    const [showModalProduto, setShowModalProduto] = useState(false);
    const [formValidado, setFormValidado] = useState(false);

    // ESTADOS PARA A MODAL DE PAGAMENTO / FINANCEIRO
    const [exibirModalEdicao, setExibirModalEdicao] = useState(false);
    const [itemEditando, setItemEditando] = useState(null);

    const { estado, mensagem } = useSelector((state) => state.venda);
    const dispatch = useDispatch();

    useEffect(() => {
        if (props.vendaParaEdicao && props.vendaParaEdicao.id !== '0') {
            setVenda({
                ...props.vendaParaEdicao,
                itens: mapearItensEdicao(props.vendaParaEdicao.itens)
            });
        }
    }, [props.vendaParaEdicao]);

    function manipularMudancas(e) {
        const { name, value, type, checked } = e.target;
        setVenda({ 
            ...venda, 
            [name]: type === 'checkbox' ? checked : value 
        });
    }

    function adicionarItem(produto) {
        if (venda.itens.find(item => item.produto?.id === produto.id)) {
            toast.warn("Produto já adicionado!");
            return;
        }

        const precoVenda = parseFloat(produto.preco_venda || 0);

        const novoItem = {
            produto: produto,
            quantidade: 1,
            valor_unitario: precoVenda,
            status: 'PROCESSANDO',
            ativo: true
        };

        setVenda({ ...venda, itens: [...venda.itens, novoItem] });
        setShowModalProduto(false);
    }

    function removerItem(index) {
        const novaLista = venda.itens.filter((_, i) => i !== index);
        setVenda({ ...venda, itens: novaLista });
    }

    function atualizarDadosItem(index, campo, valor) {
        const novaLista = [...venda.itens];
        
        let valorTratado = valor;
        if (campo === 'quantidade' || campo === 'valor_unitario') {
            valorTratado = valor === '' ? 0 : parseFloat(valor);
        }

        novaLista[index] = { 
            ...novaLista[index], 
            [campo]: valorTratado 
        };

        setVenda({ ...venda, itens: novaLista });
    }

    // FUNÇÕES DE FORMATAÇÃO E CONTROLE DA MODAL
    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
    };

    const formatarData = (dataString) => {
        if (!dataString) return "-";
        const data = new Date(dataString);
        return isNaN(data.getTime()) ? "-" : data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const fecharModalEdicao = () => {
        setExibirModalEdicao(false);
        setItemEditando(null);
    };

    const manipulaMudancaEdicao = (evento) => {
        const { name, value } = evento.target;
        setItemEditando(prev => ({ ...prev, [name]: value }));
    };

    const salvarEdicaoModal = () => {
        if (!itemEditando) return;
        
        const vendaAtualizada = {
            ...venda,
            forma_pagamento: itemEditando.forma_pagamento,
            data_vencimento: itemEditando.data_vencimento,
            descricao: `Venda de ${venda.itens.length} produto(s)`,
            status: itemEditando.status,
            valor_recebido: Number(itemEditando.valor_recebido || 0),
            ativo_conta: itemEditando.ativo_conta === 'true' || itemEditando.ativo_conta === true,
            status_conta: itemEditando.status_conta || 'PENDENTE',
        };

        if (!props.modoEdicao) {
            dispatch(adicionarVenda(vendaAtualizada));
        } else {
            dispatch(atualizarVenda(vendaAtualizada));
        }

        fecharModalEdicao();
        props.exibirFormulario(false);
    };

    // AO SUBmeter O FORMULÁRIO, ABRE A MODAL PRIMEIRO
    async function manipularSubmissao(e) {
        e.preventDefault();
        const form = e.currentTarget;

        if (venda.cliente.id === '0' || venda.usuario.id === '0' || venda.itens.length === 0) {
            toast.error("Selecione um cliente, um usuário/vendedor e pelo menos um produto!");
            setFormValidado(true);
            return;
        }

        if (form.checkValidity()) {
            setItemEditando({
                id: venda.id || 'NOVA',
                cliente: venda.cliente,
                valor_total: venda.total,
                data_vencimento: venda.data_venda,
                descricao: `Venda de ${venda.itens.length} produto(s)`,
                valor_recebido: venda.total,
                forma_pagamento: venda.forma_pagamento || 'PIX',
                status_conta: venda.status || 'PENDENTE',
                status: venda.status || 'PENDENTE',
                ativo_conta: venda.ativo === 'true' || venda.ativo === true,
                ativo: venda.ativo === 'true' || venda.ativo === true
            });
            setExibirModalEdicao(true);
        }
        setFormValidado(true);
    }

    // Calcula o valor total automaticamente com base nos itens
    useEffect(() => {
        const totalCalculado = venda.itens.reduce((acc, item) => {
            const qtd = parseFloat(item.quantidade) || 0;
            const vlr = parseFloat(item.valor_unitario) || 0;
            return acc + (qtd * vlr);
        }, 0);

        setVenda(prev => ({ ...prev, total: totalCalculado }));
    }, [venda.itens]);

    useEffect(() => {
        if (estado === ESTADO.ERRO) {
            toast.error(mensagem, { toastId: "erro-cad-venda" });
        }
        else if (estado === ESTADO.PENDENTE) {
            toast.info("Processando venda...", { toastId: "pend-cad-venda", autoClose: false });
        }
        else {
            toast.dismiss("pend-cad-venda");
        }
    }, [estado, mensagem]);

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border">
            <h2 className="mb-4 text-primary border-bottom pb-2">
                {props.modoEdicao ? "Alterar Venda" : "Registrar Nova Venda"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                
                {/* DADOS DO CLIENTE E USUÁRIO */}
                <Row className="mb-3 g-3">
                    <Col md={6}>
                        <FloatingLabel label="Cliente (Clique para Selecionar):">
                            <Form.Control
                                readOnly
                                placeholder="Selecione..."
                                value={venda.cliente?.nome ? `${venda.cliente.nome} - ${venda.cliente.cpf_cnpj || 'Sem Doc.'}` : ""}
                                onClick={() => setShowModalCliente(true)}
                                style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                                required
                            />
                        </FloatingLabel>
                    </Col>

                    <Col md={6}>
                        <FloatingLabel label="Vendedor / Usuário (Clique para Selecionar):">
                            <Form.Control
                                readOnly
                                placeholder="Selecione..."
                                value={venda.usuario?.nome || ""}
                                onClick={() => setShowModalUsuario(true)}
                                style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                                required
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* SEÇÃO DE PRODUTOS */}
                <Card className="mb-4 border-primary">
                    <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Produtos da Venda</h5>
                        <Button variant="light" size="sm" onClick={() => setShowModalProduto(true)}>
                            <i className="bi bi-plus-circle me-1"></i> Adicionar Produto
                        </Button>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive hover>
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th style={{ width: '150px' }}>Qtd</th>
                                    <th style={{ width: '200px' }}>Vlr. Unitário</th>
                                    <th>Subtotal</th>
                                    <th style={{ width: '80px' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {venda.itens && venda.itens.length > 0 ? (
                                    venda.itens.map((item, index) => {
                                        const quantidade = parseFloat(item.quantidade) || 0;
                                        const valorUnitario = parseFloat(item.valor_unitario) || 0;
                                        const subtotal = quantidade * valorUnitario;

                                        return (
                                            <tr key={index}>
                                                <td className="align-middle">{item.produto?.descricao || item.produto?.nome || 'Produto Sem Nome'}</td>
                                                <td className="align-middle">
                                                    <Form.Control 
                                                        type="number" 
                                                        min="1"
                                                        value={item.quantidade}
                                                        onChange={(e) => atualizarDadosItem(index, 'quantidade', e.target.value)}
                                                    />
                                                </td>
                                                <td className="align-middle">
                                                    <Form.Control 
                                                        type="number" 
                                                        step="0.01"
                                                        value={item.valor_unitario}
                                                        onChange={(e) => atualizarDadosItem(index, 'valor_unitario', e.target.value)}
                                                    />
                                                </td>
                                                <td className="align-middle fw-bold text-success">
                                                    R$ {subtotal.toFixed(2)}
                                                </td>
                                                <td className="align-middle">
                                                    <Button variant="outline-danger" size="sm" onClick={() => removerItem(index)}>
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-3">
                                            Nenhum produto adicionado. Clique em "Adicionar Produto".
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {/* TOTAL DA VENDA E CADASTRO ATIVO */}
                <Card className="mb-4 bg-light border-0">
                    <Card.Body>
                        <Row className="align-items-center justify-content-between">
                            <Col md={4}>
                                {props.modoEdicao && (
                                    <Form.Check 
                                        type="checkbox"
                                        id="ativo-checkbox"
                                        label="Cadastro Ativo"
                                        name="ativo"
                                        checked={venda.ativo}
                                        onChange={manipularMudancas}
                                    />
                                )}
                            </Col>
                            <Col md={4} className="text-end">
                                <span className="text-muted d-block small">Total da Venda</span>
                                <h3 className="text-success m-0 fw-bold">
                                    R$ {Number(venda.total || 0).toFixed(2)}
                                </h3>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* BOTÕES DE AÇÃO */}
                <Row className="mt-4">
                    <Col md={12} className="d-flex justify-content-end gap-2">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                                props.setVendaParaEdicao(vendaVazia);
                                props.exibirFormulario(false);
                            }}
                        >
                            <i className="bi bi-x-circle me-1"></i> Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="warning"
                            onClick={() => {
                                setVenda(vendaVazia);
                                setFormValidado(false);
                            }}
                        >
                            <i className="bi bi-arrow-counterclockwise me-1"></i> Resetar
                        </Button>
                        <Button
                            type="submit"
                            variant="success"
                            className="px-4 shadow-sm"
                            disabled={estado === ESTADO.PENDENTE}
                        >
                            {estado === ESTADO.PENDENTE ? (
                                <Spinner size="sm" />
                            ) : (
                                <>
                                    <i className={props.modoEdicao ? "bi bi-pencil-square me-1" : "bi bi-check-lg me-1"}></i>
                                    {props.modoEdicao ? "Alterar" : "Gravar"}
                                </>
                            )}
                        </Button>
                    </Col>
                </Row>
            </Form>

            {/* MODAIS DE SELEÇÃO */}
            <ModalSelecaoCliente
                show={showModalCliente}
                onHide={() => setShowModalCliente(false)}
                onSelecionar={(cli) => {
                    setVenda({ ...venda, cliente: cli });
                    setShowModalCliente(false);
                }}
            />

            <ModalSelecaoUsuario
                show={showModalUsuario}
                onHide={() => setShowModalUsuario(false)}
                onSelecionar={(usr) => {
                    setVenda({ ...venda, usuario: usr });
                    setShowModalUsuario(false);
                }}
            />

            <ModalSelecaoProduto
                show={showModalProduto}
                onHide={() => setShowModalProduto(false)}
                onSelecionar={adicionarItem}
            />

            {/* MODAL DE PAGAMENTO / FINANCEIRO (EXIBIDA APÓS CLICAR EM GRAVAR/ALTERAR) */}
            <Modal show={exibirModalEdicao} onHide={fecharModalEdicao} centered backdrop="static" size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>
                        <i className="bi bi-cash-coin me-2"></i>
                        Efetuar Pagamento / Finalizar Venda #{itemEditando?.id}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {itemEditando && (() => {
                        const valorTotal = Number(itemEditando.valor_total || 0);
                        const valorRecebido = Number(itemEditando.valor_recebido || 0);
                        const diferenca = valorRecebido - valorTotal;

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
                                {(() => {
                                    let dataVenc = itemEditando.data_vencimento;
                                    if (!dataVenc) {
                                        const hoje = new Date();
                                        hoje.setMonth(hoje.getMonth() + 1); // Adiciona 1 mês
                                        dataVenc = hoje.toISOString().split('T')[0];
                                        itemEditando.data_vencimento = dataVenc;
                                    }

                                    return (
                                        <div className="mb-3 p-3 bg-light rounded border">
                                            <Row>
                                                <Col md={6}>
                                                    <div><strong>Cliente:</strong> {itemEditando.cliente?.nome || `Cliente #${itemEditando.cliente?.id}`}</div>
                                                    <div><strong>Data Vencimento:</strong> {formatarData(dataVenc)}</div>
                                                </Col>
                                                <Col md={6} className="text-md-end">
                                                    <div><strong>Valor Total da Venda:</strong></div>
                                                    <div className="fs-4 fw-bold text-primary">{formatarMoeda(valorTotal)}</div>
                                                </Col>
                                            </Row>
                                        </div>
                                    );
                                })()}

                                <Row className="g-3">
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

                                    <Col md={4}>
                                        <FloatingLabel label="Status da Venda">
                                            <Form.Select 
                                                name="status_conta" 
                                                value={itemEditando.status_conta || 'PENDENTE'} 
                                                onChange={manipulaMudancaEdicao}
                                            >
                                                <option value="PENDENTE">PENDENTE</option>
                                                <option value="PAGO">PAGO</option>
                                                <option value="CANCELADO">CANCELADO</option>
                                            </Form.Select>
                                        </FloatingLabel>
                                    </Col>

                                    <Col md={4}>
                                        <FloatingLabel label="Registro Ativo">
                                            <Form.Select 
                                                name="ativo_conta" 
                                                value={String(itemEditando.ativo_conta)} 
                                                onChange={manipulaMudancaEdicao}
                                            >
                                                <option value="true">Sim (Ativo)</option>
                                                <option value="false">Não (Inativo)</option>
                                            </Form.Select>
                                        </FloatingLabel>
                                    </Col>

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

                                    {itemEditando.forma_pagamento === 'DINHEIRO' && (
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
                                    )}
                                </Row>
                            </Form>
                        );
                    })()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={fecharModalEdicao}>
                        <i className="bi bi-x-circle me-1"></i> Cancelar
                    </Button>
                    <Button variant="success" onClick={salvarEdicaoModal}>
                        <i className="bi bi-check-circle me-1"></i> Confirmar Pagamento
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
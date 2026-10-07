import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner, Table, Card } from 'react-bootstrap';
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
        forma_pagamento: '',
        status: 'PENDENTE',
        ativo: true,
    };

    // Mapeia os itens da prop para garantir que quantidade e valor_unitario venham do objeto correto
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

    const { estado, mensagem } = useSelector((state) => state.venda);
    const dispatch = useDispatch();

    // Sincroniza o estado caso a prop vendaParaEdicao mude
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

    async function manipularSubmissao(e) {
        e.preventDefault();
        const form = e.currentTarget;

        if (venda.cliente.id === '0' || venda.usuario.id === '0' || venda.itens.length === 0) {
            toast.error("Selecione um cliente, um usuário/vendedor e pelo menos um produto!");
            setFormValidado(true);
            return;
        }

        if (form.checkValidity()) {
            if (!props.modoEdicao) {
                dispatch(adicionarVenda(venda));
            } else {
                dispatch(atualizarVenda(venda));
            }
            props.exibirFormulario(false);
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
                {venda.cliente?.id !== '0' && venda.usuario?.id !== '0' && (
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
                                                    <td>{item.produto?.descricao || item.produto?.nome || 'Produto Sem Nome'}</td>
                                                    <td>
                                                        <Form.Control 
                                                            type="number" 
                                                            min="1"
                                                            value={item.quantidade}
                                                            onChange={(e) => atualizarDadosItem(index, 'quantidade', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control 
                                                            type="number" 
                                                            step="0.01"
                                                            value={item.valor_unitario}
                                                            onChange={(e) => atualizarDadosItem(index, 'valor_unitario', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="align-middle fw-bold">
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
                )}

                {/* PAGAMENTO, STATUS E STATUS ATIVO */}
                <Card className="mb-4 bg-light border-0">
                    <Card.Body>
                        <Row className="g-3 align-items-center">
                            <Col md={4}>
                                <FloatingLabel label="Forma de Pagamento:">
                                    <Form.Control
                                        type="text"
                                        name="forma_pagamento"
                                        placeholder="Ex: Cartão de Crédito, Pix, Dinheiro"
                                        value={venda.forma_pagamento}
                                        onChange={manipularMudancas}
                                        required
                                    />
                                </FloatingLabel>
                            </Col>

                            <Col md={3}>
                                <FloatingLabel label="Status da Venda:">
                                    <Form.Select
                                        name="status"
                                        value={venda.status}
                                        onChange={manipularMudancas}
                                        required
                                    >
                                        <option value="PENDENTE">PENDENTE</option>
                                        <option value="PAGO">PAGO</option>
                                        <option value="CANCELADO">CANCELADO</option>
                                    </Form.Select>
                                </FloatingLabel>
                            </Col>

                            <Col md={2}>
                                <Form.Check 
                                    type="checkbox"
                                    id="ativo-checkbox"
                                    label="Cadastro Ativo"
                                    name="ativo"
                                    checked={venda.ativo}
                                    onChange={manipularMudancas}
                                    disabled={!props.modoEdicao} 
                                    className="pt-2"
                                />
                            </Col>

                            <Col md={3} className="text-end">
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

            {/* MODAIS */}
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
        </Container>
    );
}
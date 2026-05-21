import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner, Table, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { adicionarCompra, atualizarCompra } from '../../redux/redutores/compraReducer';
import ModalSelecaoFornecedor from "../modais/ModalSelecaoFornecedor";
import ModalSelecaoProduto from "../modais/ModalSelecaoProduto";
import ESTADO from '../../recursos/estado';

export default function FormCadCompra(props) {
    const compraVazia = {
        id: '0',
        data_compra: new Date().toISOString().split('T')[0],
        fornecedor: { id: '0', nome_fantasia: '', cnpj: '' },
        itens: [], // Lista de produtos selecionados
        valor_total: 0,
        valor_unitario: 0,
        status: 'PROCESSANDO',
        ativo: true,
    };

    const [compra, setCompra] = useState(props.compraParaEdicao || compraVazia);
    const [showModalFornecedor, setShowModalFornecedor] = useState(false);
    const [showModalProduto, setShowModalProduto] = useState(false);
    const [formValidado, setFormValidado] = useState(false);

    const { estado, mensagem } = useSelector((state) => state.compra);
    const dispatch = useDispatch();

    function manipularMudancas(e) {
        const { name, value } = e.currentTarget;
        setCompra({ ...compra, [name]: value });
    }

    function adicionarItem(produto) {
        // Verifica se produto já está na lista
        if (compra.itens.find(item => item.produto.id === produto.id)) {
            toast.warn("Produto já adicionado!");
            return;
        }
        const novoItem = {
            produto: produto,
            quantidade: 1,
            valor_unitario: produto.preco_venda || 0, // ou preco_custo
            status: 'PROCESSANDO',
            ativo: true
        };
        setCompra({ ...compra, itens: [...compra.itens, novoItem] });
        setShowModalProduto(false);
    }

    function removerItem(index) {
        const novaLista = compra.itens.filter((_, i) => i !== index);
        setCompra({ ...compra, itens: novaLista });
    }

    function atualizarDadosItem(index, campo, valor) {
        const novaLista = [...compra.itens];
        novaLista[index] = { 
            ...novaLista[index], 
            [campo]: valor 
        };
        setCompra({ ...compra, itens: novaLista });
    }

    async function manipularSubmissao(e) {
        e.preventDefault();
        const form = e.currentTarget;

        if (compra.fornecedor.id === '0' || compra.itens.length === 0) {
            toast.error("Selecione um fornecedor e pelo menos um produto!");
            setFormValidado(true);
            return;
        }

        if (form.checkValidity()) {
            if (!props.modoEdicao) {
                dispatch(adicionarCompra(compra));
            } else {
                dispatch(atualizarCompra(compra));
            }
            props.exibirFormulario(false);
        }
        setFormValidado(true);
    }

    // Calcula o valor total sempre que a lista de itens mudar
    useEffect(() => {
        const total = compra.itens.reduce((acc, item) => {
            return acc + (parseFloat(item.quantidade) * parseFloat(item.valor_unitario || 0));
        }, 0);
        setCompra(prev => ({ ...prev, valor_total: total }));
    }, [compra.itens]);

    useEffect(() => {
        if (estado === ESTADO.ERRO) {
            toast.error(mensagem, { toastId: "erro-cad" });
        }
        else if (estado === ESTADO.PENDENTE) {
            toast.info("Processando...", { toastId: "pend-cad", autoClose: false });
        }
        else {
            toast.dismiss("pend-cad");
        }
    }, [estado, mensagem]);

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border">
            <h2 className="mb-4 text-primary border-bottom pb-2">
                {props.modoEdicao ? "Alterar Compra" : "Registrar Nova Compra"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                {/* DADOS DA COMPRA */}
                <Row className="mb-3">
                    {/* <Col md={3}>
                        <FloatingLabel label="Data da Compra:">
                            <Form.Control
                                type="date"
                                name="data_compra"
                                value={compra.data_compra}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col> */}
                    <Col md={9}>
                        <FloatingLabel label="Fornecedor (Clique para Selecionar):">
                            <Form.Control
                                readOnly
                                placeholder="Selecione..."
                                value={compra.fornecedor.nome_fantasia ? `${compra.fornecedor.nome_fantasia} - ${compra.fornecedor.cnpj}` : ""}
                                onClick={() => setShowModalFornecedor(true)}
                                style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                                required
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* SEÇÃO DE ITENS (SÓ APARECE SE HOUVER FORNECEDOR) */}
                {compra.fornecedor.id !== '0' && (
                    <Card className="mb-4 border-primary">
                        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Produtos da Compra</h5>
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
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compra.itens.length > 0 ? (
                                        compra.itens.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.produto?.descricao}</td>
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
                                                <td className="align-middle">
                                                    R$ {(item.quantidade * item.valor_unitario).toFixed(2)}
                                                </td>
                                                <td>
                                                    <Button variant="outline-danger" size="sm" onClick={() => removerItem(index)}>
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        // Se a lista estiver vazia, renderiza apenas esta mensagem limpa:
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-3">
                                                Nenhum produto adicionado à lista. Clique em "Adicionar Produto".
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            <div className="text-end mt-3">
                                <h4>Total da Compra: <span className="text-success">R$ {Number(compra.valor_total || 0).toFixed(2)}</span></h4>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* BOTÕES DE AÇÃO */}
                <Row className="mt-4">
                    <Col md={12} className="d-flex justify-content-end gap-2">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                                props.setCompraParaEdicao(compraVazia);
                                props.exibirFormulario(false);
                            }}
                        >
                            <i className="bi bi-x-circle me-1"></i> Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="warning"
                            onClick={() => {
                                setCompra(compraVazia);
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
            <ModalSelecaoFornecedor
                show={showModalFornecedor}
                onHide={() => setShowModalFornecedor(false)}
                onSelecionar={(forn) => setCompra({ ...compra, fornecedor: forn, itens: []})}
            />

            <ModalSelecaoProduto
                // filtros={{
                //     termo: "",
                //     fonecedor:{
                //         id: compra.fornecedor.id,
                //     },
                //     codigo: "",
                //     codigo_de_barras: "",
                //     descricao: "",
                //     ativo: "true"
                // }}
                show={showModalProduto}
                onHide={() => setShowModalProduto(false)}
                onSelecionar={adicionarItem}
            />
        </Container>
    );
}
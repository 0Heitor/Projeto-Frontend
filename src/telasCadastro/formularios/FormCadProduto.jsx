import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner, Card, InputGroup } from 'react-bootstrap';
import { adicionarProduto, atualizarProduto, buscarProdutos } from '../../redux/redutores/produtoReducer';
import { useSelector, useDispatch } from 'react-redux';
import ESTADO from '../../recursos/estado';
import ModalSelecaoSubgrupo from "../modais/ModalSelecaoCategoriaSubGrupo"; 
import ModalSelecaoFornecedor from "../modais/ModalSelecaoFornecedor";

export default function FormCadProduto(props) {

    const produtoVazio = {
        id: '0',
        categoriasubgrupo: {
            id: '0',
            nome: '',
            ncm_padrao: '',
            localizacao: '',
            ativo: true,
            categoriaGrupo: {
                id: '0', nome: '', margem_lucro: '', comissao_padrao: '', ativo: true, atualizado: '', criado: ''
            }
        },
        fornecedor: {
            id: '0', codigo: '', nome_fantasia: '', cnpj: '', telefone: '', uf: '', cidade: '', bairro: '', endereco: '', ativo: true
        },
        codigo: '',
        codigo_de_barras: '',
        descricao: '',
        descricao_marca: '',
        unidade_medida: '',
        preco_custo: '',
        preco_venda: '',
        percentual_financeiro: '',
        tributacao: '',
        estoque: '0.00',
        estoque_minimo: '1.00',
        ativo: true
    };

    const [produto, setProduto] = useState(props.produtoParaEdicao || produtoVazio);
    const [showModalSubgrupo, setShowModalSubgrupo] = useState(false);
    const [showModalFornecedor, setShowModalFornecedor] = useState(false);
    const [formValidado, setFormValidado] = useState(false);
    const [codigoDuplicado, setCodigoDuplicado] = useState(false);

    const { estado, mensagem } = useSelector((state) => state.produto);
    const dispatch = useDispatch();

    function manipularMudancas(e) {
        const componente = e.currentTarget;
        let valor = componente.value;

        // Trata campos booleanos
        if (componente.name === "ativo") {
            valor = (componente.value === "true");
        }

        // Reseta aviso de duplicidade ao digitar novos códigos
        if (componente.name === "codigo" || componente.name === "codigo_de_barras") {
            setCodigoDuplicado(false);
        }

        setProduto({ ...produto, [componente.name]: valor });
    }

    async function manipularSubmissao(e) {
        e.preventDefault();
        e.stopPropagation();

        const form = e.currentTarget;

        // Validação de campos obrigatórios via código antes do checkValidity
        if (!produto.descricao || !produto.preco_venda) {
            setFormValidado(true);
            return;
        }

        try {
            // Verifica duplicidade de código interno (se preenchido)
            if (produto.codigo) {
                const resp = await dispatch(buscarProdutos({
                    codigo: produto.codigo,
                    consulta: "equal"
                })).unwrap();

                const listaEncontrada = resp.listaProdutos || [];
                const duplicado = listaEncontrada.some(p => 
                    p.codigo === produto.codigo && p.id !== produto.id
                );

                if (duplicado) {
                    toast.error("Este código interno já pertence a outro produto!");
                    setCodigoDuplicado(true);
                    setFormValidado(true);
                    return;
                }
            }

            if (form.checkValidity()) {
                if (!props.modoEdicao) {
                    dispatch(adicionarProduto(produto));
                } else {
                    dispatch(atualizarProduto(produto));
                    props.setModoEdicao(false);
                    props.setProdutoParaEdicao(produtoVazio);
                }
                props.exibirFormulario(false);
                setProduto(produtoVazio);
            }
            setFormValidado(false);

        } catch (erro) {
            toast.error("Erro ao validar dados no servidor.");
        }
    }

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
                <i className="bi bi-box-seam me-2"></i>
                {props.modoEdicao ? "Alterar Produto" : "Novo Produto"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                
                {/* SEÇÃO: RELACIONAMENTOS (SUBGRUPO E FORNECEDOR) */}
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label className="fw-bold">Subgrupo / Categoria:</Form.Label>
                        <InputGroup>
                            <Form.Control
                                placeholder="Clique na lupa para selecionar..."
                                readOnly
                                value={produto.categoriasubgrupo.nome || ""}
                                required
                            />
                            <Button variant="outline-primary" onClick={() => setShowModalSubgrupo(true)}>
                                <i className="bi bi-search"></i>
                            </Button>
                        </InputGroup>
                    </Col>
                    <Col md={6}>
                        <Form.Label className="fw-bold">Fornecedor:</Form.Label>
                        <InputGroup>
                            <Form.Control
                                placeholder="Clique na lupa para selecionar..."
                                readOnly
                                value={produto.fornecedor.nome_fantasia || ""}
                                required
                            />
                            <Button variant="outline-primary" onClick={() => setShowModalFornecedor(true)}>
                                <i className="bi bi-search"></i>
                            </Button>
                        </InputGroup>
                    </Col>
                </Row>

                {/* SEÇÃO: DADOS BÁSICOS */}
                <Row className="mb-3">
                    <Col md={2}>
                        <FloatingLabel label="Cód. Interno:">
                            <Form.Control name="codigo" value={produto.codigo} onChange={manipularMudancas} placeholder="Ex: 001" />
                        </FloatingLabel>
                    </Col>
                    <Col md={4}>
                        <FloatingLabel label="Código de Barras:">
                            <Form.Control name="codigo_de_barras" value={produto.codigo_de_barras} onChange={manipularMudancas} />
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Descrição do Produto:">
                            <Form.Control name="descricao" value={produto.descricao} onChange={manipularMudancas} required />
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={4}>
                        <FloatingLabel label="Marca:">
                            <Form.Control name="descricao_marca" value={produto.descricao_marca} onChange={manipularMudancas} />
                        </FloatingLabel>
                    </Col>
                    <Col md={4}>
                        <FloatingLabel label="Unidade de Medida:">
                            <Form.Control name="unidade_medida" value={produto.unidade_medida} onChange={manipularMudancas} placeholder="Ex: UN, KG, PC" />
                        </FloatingLabel>
                    </Col>
                    <Col md={4}>
                        <FloatingLabel label="Tributação (CST/CSOSN):">
                            <Form.Control name="tributacao" value={produto.tributacao} onChange={manipularMudancas} />
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* SEÇÃO: FINANCEIRO E ESTOQUE */}
                <Card className="mb-4 bg-light">
                    <Card.Body>
                        <Row>
                            <Col md={3}>
                                <Form.Label className="small fw-bold">Preço Custo (R$):</Form.Label>
                                <Form.Control name="preco_custo" type="number" step="0.01" value={produto.preco_custo} onChange={manipularMudancas} />
                            </Col>
                            <Col md={3}>
                                <Form.Label className="small fw-bold text-success">Preço Venda (R$):</Form.Label>
                                <Form.Control name="preco_venda" type="number" step="0.01" value={produto.preco_venda} onChange={manipularMudancas} required />
                            </Col>
                            <Col md={2}>
                                <Form.Label className="small fw-bold">Encargos (%):</Form.Label>
                                <Form.Control name="percentual_financeiro" type="number" value={produto.percentual_financeiro} onChange={manipularMudancas} />
                            </Col>
                            
                            {/* ESTOQUE: Só aparece na Alteração conforme pedido */}
                            {props.modoEdicao && (
                                <>
                                    <Col md={2}>
                                        <Form.Label className="small fw-bold">Estoque Atual:</Form.Label>
                                        <Form.Control name="estoque" type="number" value={produto.estoque} onChange={manipularMudancas} />
                                    </Col>
                                    <Col md={2}>
                                        <Form.Label className="small fw-bold text-danger">Estoque Mínimo:</Form.Label>
                                        <Form.Control name="estoque_minimo" type="number" value={produto.estoque_minimo} onChange={manipularMudancas} />
                                    </Col>
                                </>
                            )}
                        </Row>
                    </Card.Body>
                </Card>

                {/* ATIVO: Só aparece na Alteração conforme pedido */}
                {props.modoEdicao && (
                    <Row className="mb-4">
                        <Col md={3}>
                            <FloatingLabel label="Status do Registro:">
                                <Form.Select name="ativo" value={produto.ativo} onChange={manipularMudancas}>
                                    <option value="true">ATIVO</option>
                                    <option value="false">INATIVO</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                    </Row>
                )}

                <Row className="mt-4">
                    <Col md={12} className="d-flex justify-content-end gap-2">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                                props.setProdutoParaEdicao(produtoVazio);
                                props.exibirFormulario(false);
                                props.setModoEdicao(false);
                            }}
                        >
                            <i className="bi bi-x-circle me-1"></i> Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="warning"
                            onClick={() => {
                                setProduto(props.modoEdicao ? props.produtoParaEdicao : produtoVazio);
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

            <ModalSelecaoSubgrupo 
                show={showModalSubgrupo} 
                onHide={() => setShowModalSubgrupo(false)}
                onSelecionar={(sub) => setProduto({...produto, categoriasubgrupo: sub})}
            />
            <ModalSelecaoFornecedor 
                show={showModalFornecedor} 
                onHide={() => setShowModalFornecedor(false)}
                onSelecionar={(forn) => setProduto({...produto, fornecedor: forn})}
            />
        </Container>
    );
}
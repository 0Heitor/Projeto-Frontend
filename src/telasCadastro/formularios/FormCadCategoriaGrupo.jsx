import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner } from 'react-bootstrap';
import { adicionarCategoriasGrupo, atualizarCategoriasGrupo, buscarCategoriasGrupo } from '../../redux/redutores/categoriagrupoReducer';
import { useSelector, useDispatch } from 'react-redux';
import ESTADO from '../../recursos/estado';

export default function FormCadCategoria(props) {

    const categoriaVazia = {
        id: '0',
        nome: '',
        margem_lucro: '',
        comissao_padrao: '',
        ativo: true
    }

    const [categoria, setCategoria] = useState(props.categoriaGrupoParaEdicao || categoriaVazia);
    const [formValidado, setFormValidado] = useState(false);
    const [nomeJaExiste, setNomeJaExiste] = useState(false);

    const { estado, mensagem } = useSelector((state) => state.categoriagrupo);
    const dispatch = useDispatch();

    function manipularMudancas(e) {
        const componente = e.currentTarget;
        let valor = componente.value;

        if (componente.name === "ativo") {
            valor = (componente.value === "true");
        }
        
        if (componente.name === "nome") {
            setNomeJaExiste(false);
        }

        setCategoria({ ...categoria, [componente.name]: valor });
    }

    async function manipularSubmissao(e) {
        e.preventDefault();
        e.stopPropagation();

        const form = e.currentTarget;

        // Validações básicas (Nome, Margem e Comissão são obrigatórios)
        if (!categoria.nome || !categoria.margem_lucro || !categoria.comissao_padrao) {
            setFormValidado(true);
            return;
        }

        try {
            // Verifica duplicidade pelo NOME
            const resp = await dispatch(buscarCategoriasGrupo({
                nome: categoria.nome,
                consulta: "equal"
            })).unwrap();

            const listaEncontrada = resp.listaCategoriasGrupo || [];
            const duplicado = listaEncontrada.some(c => 
                c.nome.toUpperCase() === categoria.nome.toUpperCase() && c.id !== categoria.id
            );

            if (duplicado) {
                toast.error("Esta categoria já está cadastrada!");
                setNomeJaExiste(true);
                setFormValidado(true);
                return;
            }

            if (form.checkValidity()) {
                if (!props.modoEdicao) {
                    dispatch(adicionarCategoriasGrupo(categoria));
                } else {
                    dispatch(atualizarCategoriasGrupo(categoria));
                    props.setModoEdicao(false);
                    props.setCategoriaGrupoParaEdicao(categoriaVazia);
                }
                props.exibirFormulario(false);
                setCategoria(categoriaVazia);
            }
            setFormValidado(false);

        } catch (erro) {
            toast.error("Erro ao validar dados no servidor.");
        }
    }

    useEffect(() => {
        if (estado === ESTADO.ERRO) {
            toast.error(mensagem, { toastId: "erro-cad-cat" });
        } else if (estado === ESTADO.PENDENTE) {
            toast.info("Processando...", { toastId: "pend-cad-cat", autoClose: false });
        } else {
            toast.dismiss("pend-cad-cat");
        }
    }, [estado, mensagem]);

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border">
            <h2 className="mb-4 text-primary border-bottom pb-2">
                {props.modoEdicao ? "Alterar Categoria de Grupo" : "Cadastrar Nova Categoria"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                {/* LINHA 1: NOME */}
                <Row className="mb-3">
                    <Col md={12}>
                        <FloatingLabel label="Nome da Categoria / Grupo:">
                            <Form.Control
                                type="text"
                                placeholder="Ex: Construção Civil"
                                name="nome"
                                value={categoria.nome}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && (categoria.nome === "" || nomeJaExiste)}
                            />
                            <Form.Control.Feedback type="invalid">
                                {nomeJaExiste ? "Este nome já existe!" : "Informe o nome da categoria!"}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* LINHA 2: MARGEM DE LUCRO E COMISSÃO */}
                <Row className="mb-3">
                    <Col md={6}>
                        <FloatingLabel label="Margem de Lucro (%):">
                            <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="Ex: 30"
                                name="margem_lucro"
                                value={categoria.margem_lucro}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && categoria.margem_lucro === ""}
                            />
                            <Form.Control.Feedback type="invalid">Informe a margem de lucro!</Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Comissão Padrão (%):">
                            <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="Ex: 5"
                                name="comissao_padrao"
                                value={categoria.comissao_padrao}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && categoria.comissao_padrao === ""}
                            />
                            <Form.Control.Feedback type="invalid">Informe a comissão padrão!</Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* LINHA 3: ATIVO (Apenas em modo de edição) */}
                {props.modoEdicao && (
                    <Row className="mb-4">
                        <Col md={12}>
                            <FloatingLabel label="Status da Categoria:">
                                <Form.Select 
                                    name="ativo" 
                                    value={categoria.ativo} 
                                    onChange={manipularMudancas}
                                >
                                    <option value="true">ATIVO</option>
                                    <option value="false">INATIVO</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                    </Row>
                )}

                {/* BOTÕES DE AÇÃO */}
                <Row className="mt-4">
                    <Col md={12} className="d-flex justify-content-end gap-2">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                                props.setCategoriaGrupoParaEdicao(categoriaVazia);
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
                                setCategoria(props.modoEdicao ? props.categoriaParaEdicao : categoriaVazia);
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
        </Container>
    );
}
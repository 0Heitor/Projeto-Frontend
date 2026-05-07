import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner } from 'react-bootstrap';
import { adicionarCategoriasSubGrupo, atualizarCategoriasSubGrupo, buscarCategoriasSubGrupo } from '../../redux/redutores/categoriasubgrupoReducer';
import { useSelector, useDispatch } from 'react-redux';
import ModalSelecaoCategoriaGrupo from "../modais/ModalSelecaoCategoriaGrupo";
import ESTADO from '../../recursos/estado';

export default function FormCadCategoriaSubGrupo(props) {

    const subGrupoVazio = {
        id: '0',
        nome: '',
        ncm_padrao: '',
        localizacao: '',
        ativo: true,
        categoriaGrupo: {
            id: '0',
            nome: '',
            margem_lucro: '',
            comissao_padrao: '',
            ativo: true,
            atualizado:'',
            criado:''
        }
    }

    const [subGrupo, setSubGrupo] = useState(props.categoriaSubGrupoParaEdicao || subGrupoVazio);
    const [showModal, setShowModal] = useState(false);
    const [formValidado, setFormValidado] = useState(false);
    const [nomeJaExiste, setNomeJaExiste] = useState(false);

    const { estado, mensagem } = useSelector((state) => state.categoriasubgrupo);
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

        setSubGrupo({ ...subGrupo, [componente.name]: valor });
    }

    async function manipularSubmissao(e) {
        e.preventDefault();
        e.stopPropagation();

        const form = e.currentTarget;

        // Validações básicas: Nome e Categoria Pai são obrigatórios
        if (!subGrupo.nome || subGrupo.categoriaGrupo.id === '0') {
            toast.warning("Por favor, preencha o nome e selecione uma Categoria Grupo.");
            setFormValidado(true);
            return;
        }

        try {
            // Verifica duplicidade pelo nome dentro do subgrupo
            const resp = await dispatch(buscarCategoriasSubGrupo({
                nome: subGrupo.nome,
                consulta: "equal"
            })).unwrap();

            const listaEncontrada = resp.listaCategoriasSubGrupo || [];
            const duplicado = listaEncontrada.some(s => 
                s.nome.toUpperCase() === subGrupo.nome.toUpperCase() && s.id !== subGrupo.id
            );

            if (duplicado) {
                toast.error("Este nome de Sub-Grupo já está cadastrado!");
                setNomeJaExiste(true);
                setFormValidado(true);
                return;
            }

            if (form.checkValidity()) {
                if (!props.modoEdicao) {
                    dispatch(adicionarCategoriasSubGrupo(subGrupo));
                } else {
                    dispatch(atualizarCategoriasSubGrupo(subGrupo));
                    props.setModoEdicao(false);
                    props.setCategoriaSubGrupoParaEdicao(subGrupoVazio);
                }
                props.exibirFormulario(false);
                setSubGrupo(subGrupoVazio);
            }
            setFormValidado(false);

        } catch (erro) {
            toast.error("Erro ao processar dados no servidor.");
        }
    }

    useEffect(() => {
        if (estado === ESTADO.ERRO) {
            toast.error(mensagem, { toastId: "erro-cad-sub" });
        } else if (estado === ESTADO.PENDENTE) {
            toast.info("Processando...", { toastId: "pend-cad-sub", autoClose: false });
        } else {
            toast.dismiss("pend-cad-sub");
        }
    }, [estado, mensagem]);

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border">
            <h2 className="mb-4 text-primary border-bottom pb-2">
                {props.modoEdicao ? "Alterar Sub-Grupo" : "Cadastrar Sub-Grupo"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                <Row className="mb-3">
                    {/* NOME DO SUB-GRUPO */}
                    <Col md={6}>
                        <FloatingLabel label="Nome do Sub-Grupo:">
                            <Form.Control
                                type="text"
                                placeholder="Ex: Peças de Reposição"
                                name="nome"
                                value={subGrupo.nome}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && (subGrupo.nome === "" || nomeJaExiste)}
                            />
                            <Form.Control.Feedback type="invalid">
                                {nomeJaExiste ? "Nome já cadastrado!" : "Informe o nome do sub-grupo!"}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    
                    {/* SELEÇÃO DA CATEGORIA PAI */}
                    <Col md={6}>
                        <FloatingLabel label="Categoria Grupo (Pai):">
                            <Form.Control 
                                readOnly 
                                required
                                placeholder="Clique para selecionar..." 
                                value={subGrupo.categoriaGrupo.nome || ""}
                                onClick={() => setShowModal(true)}
                                isInvalid={formValidado && subGrupo.categoriaGrupo.id === '0'}
                                style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                            />
                            <Form.Control.Feedback type="invalid">Selecione uma categoria grupo!</Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row className="mb-3">
                    {/* NCM PADRÃO */}
                    <Col md={6}>
                        <FloatingLabel label="NCM Padrão:">
                            <Form.Control
                                type="text"
                                placeholder="Ex: 8431.41.00"
                                name="ncm_padrao"
                                value={subGrupo.ncm_padrao}
                                onChange={manipularMudancas}
                            />
                        </FloatingLabel>
                    </Col>
                    
                    {/* LOCALIZAÇÃO */}
                    <Col md={6}>
                        <FloatingLabel label="Localização / Corredor:">
                            <Form.Control
                                type="text"
                                placeholder="Ex: Almoxarifado A-1"
                                name="localizacao"
                                value={subGrupo.localizacao}
                                onChange={manipularMudancas}
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row className="mb-4">
                    {/* ATIVO (Apenas em modo de edição) */}
                    {props.modoEdicao && (
                        <Col md={12}>
                            <FloatingLabel label="Registro Ativo:">
                                <Form.Select 
                                    name="ativo" 
                                    value={subGrupo.ativo} 
                                    onChange={manipularMudancas}
                                >
                                    <option value="true">SIM (Habilitado)</option>
                                    <option value="false">NÃO (Desabilitado)</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                    )}
                </Row>

                <Row className="mt-4">
                    <Col md={12} className="d-flex justify-content-end gap-2">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                                props.setCategoriaSubGrupoParaEdicao(subGrupoVazio);
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
                                setSubGrupo(props.modoEdicao ? props.categoriaSubGrupoParaEdicao : subGrupoVazio);
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

            {/* Modal de Seleção da Categoria Grupo Pai */}
            <ModalSelecaoCategoriaGrupo 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                onSelecionar={(categoriaSelecionada) => {
                    setSubGrupo({ ...subGrupo, categoriaGrupo: categoriaSelecionada });
                    setShowModal(false);
                }}
            />
        </Container>
    );
}
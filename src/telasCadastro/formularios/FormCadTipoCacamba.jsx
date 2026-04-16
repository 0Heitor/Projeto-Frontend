import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner } from 'react-bootstrap';
import { adicionarTipoCacamba, atualizarTipoCacamba, buscarTiposCacambas } from '../../redux/redutores/tipocacambaReducer';
import { useSelector, useDispatch } from 'react-redux';
import ESTADO from '../../recursos/estado';

export default function FormCadTipoCacamba(props) {

    const tipoVazio = {
        id: '0',
        nome: '',
        volume: '',
        preco: 0.00,
        descricao: '',
        ativo: true
    }

    const [tipo, setTipo] = useState(props.tipoCacambaParaEdicao || tipoVazio);
    const [formValidado, setFormValidado] = useState(false);
    const [nomeJaExiste, setNomeJaExiste] = useState(false);

    const { estado, mensagem } = useSelector((state) => state.tipocacamba);
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

        setTipo({ ...tipo, [componente.name]: valor });
    }

    async function manipularSubmissao(e) {
        e.preventDefault();
        e.stopPropagation();

        const form = e.currentTarget;

        // Validações básicas (Nome, Volume e Preço são obrigatórios)
        if (!tipo.nome || !tipo.volume || !tipo.preco) {
            setFormValidado(true);
            return;
        }

        try {
            // Verifica duplicidade pelo NOME
            const resp = await dispatch(buscarTiposCacambas({
                nome: tipo.nome,
                consulta: "equal"
            })).unwrap();

            const listaEncontrada = resp.listaTipos || [];
            const duplicado = listaEncontrada.some(t => 
                t.nome.toUpperCase() === tipo.nome.toUpperCase() && t.id !== tipo.id
            );

            if (duplicado) {
                toast.error("Este nome de tipo já está cadastrado!");
                setNomeJaExiste(true);
                setFormValidado(true);
                return;
            }

            if (form.checkValidity()) {
                if (!props.modoEdicao) {
                    dispatch(adicionarTipoCacamba(tipo));
                } else {
                    dispatch(atualizarTipoCacamba(tipo));
                    props.setModoEdicao(false);
                    props.setTipoCacambaParaEdicao(tipoVazio);
                }
                props.exibirFormulario(false);
                setTipo(tipoVazio);
            }
            setFormValidado(false);

        } catch (erro) {
            toast.error("Erro ao validar dados no servidor.");
        }
    }

    useEffect(() => {
        if (estado === ESTADO.ERRO) {
            toast.error(mensagem, { toastId: "erro-cad-tipo" });
        } else if (estado === ESTADO.PENDENTE) {
            toast.info("Processando...", { toastId: "pend-cad-tipo", autoClose: false });
        } else {
            toast.dismiss("pend-cad-tipo");
        }
    }, [estado, mensagem]);

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border">
            <h2 className="mb-4 text-primary border-bottom pb-2">
                {props.modoEdicao ? "Alterar Tipo de Caçamba" : "Cadastrar Novo Tipo de Caçamba"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                {/* LINHA 1: NOME */}
                <Row className="mb-3">
                    <Col md={12}>
                        <FloatingLabel label="Nome do Tipo / Modelo:">
                            <Form.Control
                                type="text"
                                placeholder="Ex: Média Standard"
                                name="nome"
                                value={tipo.nome}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && (tipo.nome === "" || nomeJaExiste)}
                            />
                            <Form.Control.Feedback type="invalid">
                                {nomeJaExiste ? "Este nome já existe!" : "Informe o nome do tipo!"}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* LINHA 2: VOLUME E PREÇO */}
                <Row className="mb-3">
                    <Col md={6}>
                        <FloatingLabel label="Volume (m³):">
                            <Form.Control
                                type="number"
                                step="0.1"
                                placeholder="Ex: 5.0"
                                name="volume"
                                value={tipo.volume}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && tipo.volume === ""}
                            />
                            <Form.Control.Feedback type="invalid">Informe o volume em m³!</Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Preço Base de Aluguel (R$):">
                            <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                name="preco"
                                value={tipo.preco}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && tipo.preco === ""}
                            />
                            <Form.Control.Feedback type="invalid">Informe o preço base!</Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* LINHA 3: DESCRIÇÃO */}
                <Row className="mb-3">
                    <Col md={12}>
                        <FloatingLabel label="Descrição Detalhada:">
                            <Form.Control
                                as="textarea"
                                style={{ height: '100px' }}
                                placeholder="Descreva as características deste tipo..."
                                name="descricao"
                                value={tipo.descricao}
                                onChange={manipularMudancas}
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* LINHA 4: ATIVO (Apenas em modo de edição) */}
                {props.modoEdicao && (
                    <Row className="mb-4">
                        <Col md={12}>
                            <FloatingLabel label="Status do Tipo:">
                                <Form.Select 
                                    name="ativo" 
                                    value={tipo.ativo} 
                                    onChange={manipularMudancas}
                                >
                                    <option value="true">ATIVO (Disponível para novos cadastros)</option>
                                    <option value="false">INATIVO (Ocultar em novas seleções)</option>
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
                                props.setTipoCacambaParaEdicao(tipoVazio);
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
                                setTipo(props.modoEdicao ? props.tipoCacambaParaEdicao : tipoVazio);
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
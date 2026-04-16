import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner } from 'react-bootstrap';
import { adicionarCacamba, atualizarCacamba, buscarCacambas } from '../../redux/redutores/cacambaReducer';
import { useSelector, useDispatch } from 'react-redux';
import ESTADO from '../../recursos/estado';

export default function FormCadCacamba(props) {

    const cacambaVazia = {
        id: '0',
        numero: "",
        tamanho: "",
        status: 'DISPONIVEL',
        modelo: "",
        ultima_revisao: '',
        ativo: true,
        atualizado_em: '',
        criado_em: ''
    }

    const [cacamba, setCacamba] = useState(props.cacambaParaEdicao || cacambaVazia);
    const [formValidado, setFormValidado] = useState(false);
    const [numeroJaExiste, setNumeroJaExiste] = useState(false);

    const { estado, mensagem } = useSelector((state) => state.cacamba);
    const dispatch = useDispatch();

    function manipularMudancas(e) {
        const componente = e.currentTarget;
        let valor = componente.value;

        if (componente.name === "ativo") {
            valor = (componente.value === "true");
        }
        
        // Se mudar o número, reseta o aviso de duplicidade
        if (componente.name === "numero") {
            setNumeroJaExiste(false);
        }

        setCacamba({ ...cacamba, [componente.name]: valor });
    }

    async function manipularSubmissao(e) {
        e.preventDefault();
        e.stopPropagation();

        const form = e.currentTarget;

        // Validações básicas
        if (cacamba.numero === "" || cacamba.tamanho === "") {
            setFormValidado(true);
            return;
        }

        try {
            // Verifica se o número da caçamba já existe no banco
            const resp = await dispatch(buscarCacambas({
                numero: cacamba.numero,
                consulta: "equal"
            })).unwrap();

            const listaEncontrada = resp.listaCacambas || [];
            
            const duplicado = listaEncontrada.some(c => 
                c.numero.toUpperCase() === cacamba.numero.toUpperCase() && c.id !== cacamba.id
            );

            if (duplicado) {
                toast.error("Este número de caçamba já está cadastrado!");
                setNumeroJaExiste(true);
                setFormValidado(true);
                return;
            }

            if (form.checkValidity()) {
                if (!props.modoEdicao) {
                    console.log(cacamba);
                    dispatch(adicionarCacamba(cacamba));
                } else {
                    console.log(cacamba);
                    dispatch(atualizarCacamba(cacamba));
                    props.setModoEdicao(false);
                    props.setCacambaParaEdicao(cacambaVazia);
                }
                props.exibirFormulario(false);
                setCacamba(cacambaVazia);
            }
            setFormValidado(false);

        } catch (erro) {
            toast.error("Erro ao validar dados no servidor.");
        }
    }

    useEffect(() => {
        if (estado === ESTADO.ERRO) {
            toast.error(mensagem, { toastId: "erro-cad-cac" });
        } else if (estado === ESTADO.PENDENTE) {
            toast.info("Processando...", { toastId: "pend-cad-cac", autoClose: false });
        } else {
            toast.dismiss("pend-cad-cac");
        }
    }, [estado, mensagem]);

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border">
            <h2 className="mb-4 text-primary border-bottom pb-2">
                {props.modoEdicao ? "Alterar Caçamba" : "Cadastrar Nova Caçamba"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                <Row className="mb-3">
                    <Col md={6}>
                        <FloatingLabel label="Número da Caçamba (Identificador):">
                            <Form.Control
                                type="text"
                                placeholder="Ex: C-123"
                                name="numero"
                                value={cacamba.numero}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && (cacamba.numero === "" || numeroJaExiste)}
                            />
                            <Form.Control.Feedback type="invalid">
                                {numeroJaExiste ? "Número já cadastrado!" : "Informe o número da caçamba!"}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Tamanho (m³):">
                            <Form.Control
                                type="number"
                                step="0.5"
                                placeholder="Ex: 5.0"
                                name="tamanho"
                                value={cacamba.tamanho}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && cacamba.tamanho === ""}
                            />
                            <Form.Control.Feedback type="invalid">Informe o tamanho!</Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <FloatingLabel label="Modelo / Fabricante:">
                            <Form.Control
                                type="text"
                                placeholder="Modelo"
                                name="modelo"
                                value={cacamba.modelo}
                                onChange={manipularMudancas}
                            />
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Status Atual:">
                            <Form.Select 
                                name="status" 
                                value={cacamba.status} 
                                onChange={manipularMudancas}
                            >
                                <option value="DISPONIVEL">DISPONÍVEL</option>
                                <option value="ALUGADA">ALUGADA</option>
                                <option value="MANUTENCAO">EM MANUTENÇÃO</option>
                                <option value="AGUARDANDO_RETIRADA">AGUARDANDO RETIRADA</option>
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row className="mb-4">
                    {/* CAMPO DATA: Aparece somente no modo de Edição/Alteração */}
                    {props.modoEdicao && (
                        <Col md={6}>
                            <FloatingLabel label="Data da Última Revisão:">
                                <Form.Control
                                    type="date"
                                    name="ultima_revisao"
                                    value={cacamba.ultima_revisao ? cacamba.ultima_revisao.split('T')[0] : ''}
                                    onChange={manipularMudancas}
                                />
                            </FloatingLabel>
                        </Col>
                    )}

                    <Col md={props.modoEdicao ? 6 : 12}>
                        <FloatingLabel label="Registro Ativo:">
                            <Form.Select 
                                name="ativo" 
                                value={cacamba.ativo} 
                                onChange={manipularMudancas}
                            >
                                <option value="true">SIM (Ativo)</option>
                                <option value="false">NÃO (Inativo)</option>
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row className="mt-4">
                    <Col md={12} className="d-flex justify-content-end gap-2">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                                props.setCacambaParaEdicao(cacambaVazia);
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
                                setCacamba(props.modoEdicao ? props.cacambaParaEdicao : cacambaVazia);
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
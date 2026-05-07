import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner } from 'react-bootstrap';
import { adicionarFornecedor, atualizarFornecedor, buscarFornecedores } from '../../redux/redutores/fornecedorReducer';
import { useSelector, useDispatch } from 'react-redux';
import ESTADO from '../../recursos/estado';

export default function FormCadFornecedor(props) {
    const fornecedorVazio = {
        id: '0',
        codigo: '',
        nome_fantasia: '',
        cnpj: '',
        telefone: '',
        uf: '',
        cidade: '',
        bairro: '',
        endereco: '',
        ativo: true
    };

    const [fornecedor, setFornecedor] = useState(props.fornecedorParaEdicao || fornecedorVazio);
    const [formValidado, setFormValidado] = useState(false);
    const [errosDuplicidade, setErrosDuplicidade] = useState({ codigo: false, cnpj: false });

    const { estado, mensagem } = useSelector((state) => state.fornecedor);
    const dispatch = useDispatch();

    // Máscara para CNPJ (Aceita letras e números conforme regra 2026)
    function mascaraCNPJ(valor) {
        return valor
            .replace(/\D/g, "") // Remove o que não é alfanumérico se necessário, ou ajuste:
            .replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9])/, "$1.$2")
            .replace(/^(\S{2})\.(\S{3})([a-zA-Z0-9])/, "$1.$2.$3")
            .replace(/\.(\S{3})([a-zA-Z0-9])/, ".$1/$2")
            .replace(/\/(\S{4})([a-zA-Z0-9])/, "/$1-$2")
            .substring(0, 18).toUpperCase();
    }

    // Validação Algoritmo CNPJ (Adaptado para Alfanumérico)
    function validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\w]/g, '').toUpperCase();
        if (cnpj.length !== 14) return false;

        const calcularDV = (base) => {
            let peso = base.length - 7;
            let soma = 0;
            for (let i = 0; i < base.length; i++) {
                // Converte char para valor numérico conforme regra da Receita
                let valorPosicao = base.charCodeAt(i) - 48;
                soma += valorPosicao * peso--;
                if (peso < 2) peso = 9;
            }
            let resto = soma % 11;
            return resto < 2 ? 0 : 11 - resto;
        };

        let base = cnpj.substring(0, 12);
        let dv1 = calcularDV(base);
        let dv2 = calcularDV(base + dv1);

        return cnpj.endsWith("" + dv1 + dv2);
    }

    function manipularMudancas(e) {
        const componente = e.currentTarget;
        let valor = componente.value;

        if (componente.name === "cnpj") {
            valor = mascaraCNPJ(valor);
            setErrosDuplicidade(prev => ({ ...prev, cnpj: false }));
        }

        if (componente.name === "codigo") {
            setErrosDuplicidade(prev => ({ ...prev, codigo: false }));
        }

        if (componente.name === "ativo") {
            valor = (componente.value === "true");
        }

        setFornecedor({ ...fornecedor, [componente.name]: valor });
    }

    async function manipularSubmissao(e) {
        e.preventDefault();
        const form = e.currentTarget;

        // 1. Limpa erros de duplicidade anteriores e valida o formato básico
        setErrosDuplicidade({ codigo: false, cnpj: false });

        if (!form.checkValidity() || !validarCNPJ(fornecedor.cnpj)) {
            setFormValidado(true);
            if (!validarCNPJ(fornecedor.cnpj)) toast.error("CNPJ inválido!");
            return;
        }

        try {
            // 2. Busca a lista completa para conferir duplicidade
            // Nota: Certifique-se que buscarFornecedores() traz os dados necessários
            const resp = await dispatch(buscarFornecedores( {consulta: "OR", codigo: fornecedor.codigo, cnpj: fornecedor.cnpj, ativo: true})).unwrap();
            const lista = resp.listaFornecedores;// || [];
            
            // Verificação rigorosa: procuramos se existe ALGUÉM com o mesmo código OU mesmo CNPJ
            // Desconsideramos o próprio registro que estamos editando (f.id !== fornecedor.id)
            const fornecedorComMesmoCodigo = lista.find(f => 
                f.codigo.toString() === fornecedor.codigo.toString() && f.id !== fornecedor.id
            );
            
            const fornecedorComMesmoCNPJ = lista.find(f => 
                f.cnpj.replace(/\D/g, '') === fornecedor.cnpj.replace(/\D/g, '') && f.id !== fornecedor.id
            );

            // 3. BLOQUEIO CRÍTICO: Se um ou outro (ou ambos) existirem, para tudo aqui.
            if (fornecedorComMesmoCodigo || fornecedorComMesmoCNPJ) {
                setErrosDuplicidade({ 
                    codigo: !!fornecedorComMesmoCodigo, 
                    cnpj: !!fornecedorComMesmoCNPJ 
                });

                // Mensagens específicas para o usuário
                if (fornecedorComMesmoCodigo && fornecedorComMesmoCNPJ) {
                    toast.error("Erro: Código e CNPJ já estão em uso por outros fornecedores!");
                } else if (fornecedorComMesmoCodigo) {
                    toast.error("Erro: Este Código já está cadastrado!");
                } else {
                    toast.error("Erro: Este CNPJ já está cadastrado!");
                }

                setFormValidado(true); // Ativa o visual de erro nos campos
                return; // ESTE RETURN É O QUE IMPEDE O CADASTRO
            }

            // 4. GRAVAÇÃO (Só chega aqui se as validações acima passarem)
            if (form.checkValidity()) {
                if (!props.modoEdicao) {
                    //await dispatch(adicionarFornecedor(fornecedor)).unwrap();
                    //toast.success("Fornecedor cadastrado com sucesso!");
                    dispatch(adicionarFornecedor(fornecedor));
                } else {
                    //await dispatch(atualizarFornecedor(fornecedor)).unwrap();
                    //toast.success("Fornecedor atualizado com sucesso!");
                    dispatch(atualizarFornecedor(fornecedor));
                    props.setModoEdicao(false);
                    props.setFornecedorParaEdicao(fornecedorVazio);
                }
            }
            props.exibirFormulario(false);

        } catch (erro) {
            toast.error("Erro ao processar: " + (erro.message || "Falha na comunicação."));
        }
    }

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border">
            <h2 className="mb-4 text-primary border-bottom pb-2">
                <i className={`bi ${props.modoEdicao ? 'bi-pencil-square' : 'bi-person-plus-fill'} me-2`}></i>
                {props.modoEdicao ? "Alterar Fornecedor" : "Novo Fornecedor"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                <Row className="mb-3">
                    <Col md={3}>
                        <FloatingLabel label="Código Interno:">
                            <Form.Control
                                type="text"
                                name="codigo"
                                value={fornecedor.codigo}
                                onChange={manipularMudancas}
                                required
                                isInvalid={errosDuplicidade.codigo}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errosDuplicidade.codigo ? "Código já em uso!" : "Campo obrigatório!"}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={5}>
                        <FloatingLabel label="Nome Fantasia:">
                            <Form.Control
                                type="text"
                                name="nome_fantasia"
                                value={fornecedor.nome_fantasia}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col>
                    <Col md={4}>
                        <FloatingLabel label="CNPJ (Alfanumérico):">
                            <Form.Control
                                type="text"
                                name="cnpj"
                                placeholder="XX.XXX.XXX/XXXX-XX"
                                value={fornecedor.cnpj}
                                onChange={manipularMudancas}
                                required
                                isInvalid={errosDuplicidade.cnpj}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errosDuplicidade.cnpj ? "CNPJ já cadastrado!" : "CNPJ inválido!"}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={4}>
                        <FloatingLabel label="Telefone:">
                            <Form.Control
                                type="text"
                                name="telefone"
                                value={fornecedor.telefone}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Endereço:">
                            <Form.Control
                                type="text"
                                name="endereco"
                                value={fornecedor.endereco}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col>
                    <Col md={2}>
                        <FloatingLabel label="UF:">
                            <Form.Control
                                type="text"
                                name="uf"
                                maxLength="2"
                                value={fornecedor.uf}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={6}>
                        <FloatingLabel label="Cidade:">
                            <Form.Control
                                type="text"
                                name="cidade"
                                value={fornecedor.cidade}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Bairro:">
                            <Form.Control
                                type="text"
                                name="bairro"
                                value={fornecedor.bairro}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                {props.modoEdicao && (
                    <Row className="mb-4">
                        <Col md={12}>
                            <FloatingLabel label="Status do Fornecedor:">
                                <Form.Select 
                                    name="ativo" 
                                    value={fornecedor.ativo} 
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
                                props.setFornecedorParaEdicao(fornecedorVazio);
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
                                setTipo(props.modoEdicao ? props.fornecedorParaEdicao : fornecedorVazio);
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
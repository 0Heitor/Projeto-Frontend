import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { adicionarCliente, atualizarCliente, buscarClientes } from '../../redux/redutores/clienteReducer';
import { useSelector, useDispatch } from 'react-redux';
import ESTADO from '../../recursos/estado';

export default function FormCadCliente(props) {
    const clienteVazio = {
        id: '0',
        nome: '',
        tipoPessoa: 'PF', // PF para CPF, PJ para CNPJ
        cpf_cnpj: '',
        rg: '',
        data_nascimento: '',
        profissao: '',
        local_trabalho: '',
        telefone: '',
        cep: '',
        endereco: '',
        ativo: true,
        observacoes: ''
    };

    const [cliente, setCliente] = useState(props.clienteParaEdicao || clienteVazio);
    const [formValidado, setFormValidado] = useState(false);
    const [docJaExiste, setDocJaExiste] = useState(false);

    const { estado, mensagem } = useSelector((state) => state.cliente);
    const dispatch = useDispatch();

    // --- MÁSCARAS ---
    const maskCPF = (value) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
            .substring(0, 14);
    };

    const maskCNPJ = (value) => {
        return value
            .replace(/\D/g, "")
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d)/, "$1-$2")
            .substring(0, 18);
    };

    const formatarDataParaBR = (data) => {
        if (!data) return "";
        if (data.includes('/')) return data; // Já está formatada

        const parteData = data.split("T")[0]; // Pega 1985-05-20
        const [ano, mes, dia] = parteData.split("-");
        return `${dia}/${mes}/${ano}`;
    };

    const tratarDataParaInput = (data) => {
        if (!data) return "";
        // Se a data vier com 'T' (ISO) ou for completa, pegamos apenas a parte da data
        return data.includes("T") ? data.split("T")[0] : data;
    };

    // --- ALGORITMOS DE VALIDAÇÃO ---
    function validarCPF(cpf) {
        cpf = cpf.replace(/\D/g, "");
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        soma = 0;
        for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        return true;
    }

    function validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/\D/g, "");
        if (cnpj.length !== 14 || !!cnpj.match(/(\d)\1{13}/)) return false;
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(0))) return false;
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado !== parseInt(digitos.charAt(1))) return false;
        return true;
    }

    // --- MANIPULADORES ---
    function manipularMudancas(e) {
        const componente = e.currentTarget;
        const nome = componente.name;
        let valor = componente.value;

        if (nome === "ativo") valor = (valor === "true");

        if (nome === "cpf_cnpj") {
            setDocJaExiste(false);
            const apenasNumeros = valor.replace(/\D/g, "");
            valor = cliente.tipoPessoa === "PF" ? maskCPF(apenasNumeros) : maskCNPJ(apenasNumeros);
        }

        if (nome === "tipoPessoa") {
            setCliente({ ...cliente, [nome]: valor, cpf_cnpj: "" });
            setDocJaExiste(false);
            return;
        }

        setCliente({ ...cliente, [nome]: valor });
    }

    async function manipularSubmissao(e) {
        e.preventDefault();
        setFormValidado(true);

        const docLimpo = cliente.cpf_cnpj.replace(/\D/g, "");
        
        // 1. Validação de Algoritmo (CPF ou CNPJ)
        const isDocValido = cliente.tipoPessoa === "PF" ? validarCPF(docLimpo) : validarCNPJ(docLimpo);
        
        if (!isDocValido) {
            toast.error(`${cliente.tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'} inválido! Verifique os números.`);
            return;
        }

        // 2. Validação de campos obrigatórios básicos
        if (!cliente.nome || !cliente.telefone) {
            toast.warning("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            // 3. Busca por duplicidade no banco
            const resp = await dispatch(buscarClientes({ ativo: true, cpf_cnpj: cliente.cpf_cnpj })).unwrap();
            const lista = resp.listaClientes || [];
            
            const duplicado = lista.find(c => 
                c.cpf_cnpj.replace(/\D/g, '') === docLimpo && c.id !== cliente.id
            );

            if (duplicado) {
                setDocJaExiste(true);
                toast.error(`Este ${cliente.tipoPessoa} já está cadastrado para o cliente: ${duplicado.nome}`);
                return;
            }

            // 4. Se passou em tudo, salva
            if (!props.modoEdicao) {
                dispatch(adicionarCliente(cliente));
                //toast.success("Cliente cadastrado!");
            } else {
                dispatch(atualizarCliente(cliente));
                //toast.success("Cliente atualizado!");
                props.setModoEdicao(false);
                props.setClienteParaEdicao(clienteVazio);
            }
            props.exibirFormulario(false);
            setCliente(clienteVazio);
            setFormValidado(false);

        } catch (erro) {
            toast.error("Erro ao processar dados.");
        }
    }

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border">
            <h2 className="mb-4 text-primary border-bottom pb-2">
                {props.modoEdicao ? "Alterar Cliente" : "Cadastrar Novo Cliente"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                {/* LINHA 1: NOME E TIPO DE PESSOA */}
                <Row className="mb-3">
                    <Col md={7}>
                        <FloatingLabel label="Nome Completo / Razão Social:">
                            <Form.Control
                                type="text"
                                name="nome"
                                placeholder="Digite o nome"
                                value={cliente.nome}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && !cliente.nome}
                            />
                            <Form.Control.Feedback type="invalid">Informe o nome!</Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={5} className="d-flex flex-column justify-content-center">
                        <Form.Label className="text-muted small mb-1">Tipo de Cliente:</Form.Label>
                        <ButtonGroup>
                            <ToggleButton
                                id="tbg-radio-1"
                                type="radio"
                                variant="outline-primary"
                                name="tipoPessoa" // O nome deve ser igual à chave no objeto cliente
                                value="PF"
                                checked={cliente.tipoPessoa === 'PF'}
                                onChange={manipularMudancas}
                            >
                                <i className="bi bi-person me-1"></i> Pessoa Física
                            </ToggleButton>
                            <ToggleButton
                                id="tbg-radio-2"
                                type="radio"
                                variant="outline-primary"
                                name="tipoPessoa"
                                value="PJ"
                                checked={cliente.tipoPessoa === 'PJ'}
                                onChange={manipularMudancas}
                            >
                                <i className="bi bi-building me-1"></i> Pessoa Jurídica
                            </ToggleButton>
                        </ButtonGroup>
                    </Col>
                </Row>

                {/* LINHA 2: DOCUMENTO DINÂMICO */}
                <Row className="mb-3">
                    <Col md={6}>
                        <FloatingLabel label={cliente.tipoPessoa === 'PF' ? "CPF (apenas números):" : "CNPJ (apenas números):"}>
                            <Form.Control
                                type="text"
                                name="cpf_cnpj"
                                placeholder="Documento"
                                maxLength={cliente.tipoPessoa === 'PF' ? 14 : 18}
                                value={cliente.cpf_cnpj}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && (cliente.cpf_cnpj.length < 14 && cliente.tipoPessoa === "PF" || docJaExiste)}
                            />
                            <Form.Control.Feedback type="invalid">
                                {docJaExiste ? "Este documento já está na nossa base!" : "Campo obrigatório!"}
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label={cliente.tipoPessoa === 'PF' ? "RG:" : "Inscrição Estadual:"}>
                            <Form.Control
                                type="text"
                                name="rg"
                                maxLength={20}
                                value={cliente.rg}
                                onChange={manipularMudancas}
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* LINHA 3: DATA NASC E TELEFONE */}
                <Row className="mb-3">
                    <Col md={4}>
                        <FloatingLabel 
                            label="Data de Nascimento:" 
                            controlId="data_nascimento"
                            className="mb-3"
                        >
                            <Form.Control
                                type="date"
                                name="data_nascimento"
                                placeholder="Data de Nascimento"
                                value={tratarDataParaInput(cliente.data_nascimento)}
                                onChange={manipularMudancas}
                                style={{ paddingTop: '1.5rem' }} 
                            />
                        </FloatingLabel>
                    </Col>
                    <Col md={4}>
                        <FloatingLabel label="Telefone/WhatsApp:">
                            <Form.Control
                                type="text"
                                name="telefone"
                                placeholder="(00) 00000-0000"
                                value={cliente.telefone}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col>
                    <Col md={4}>
                        <FloatingLabel label="CEP:">
                            <Form.Control
                                type="text"
                                name="cep"
                                value={cliente.cep}
                                onChange={manipularMudancas}
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* LINHA 4: PROFISSÃO E LOCAL TRABALHO */}
                <Row className="mb-3">
                    <Col md={6}>
                        <FloatingLabel label="Profissão:">
                            <Form.Control
                                type="text"
                                name="profissao"
                                value={cliente.profissao}
                                onChange={manipularMudancas}
                            />
                        </FloatingLabel>
                    </Col>
                    <Col md={6}>
                        <FloatingLabel label="Local de Trabalho:">
                            <Form.Control
                                type="text"
                                name="local_trabalho"
                                value={cliente.local_trabalho}
                                onChange={manipularMudancas}
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* LINHA 5: ENDEREÇO */}
                <Row className="mb-3">
                    <Col md={12}>
                        <FloatingLabel label="Endereço Completo:">
                            <Form.Control
                                type="text"
                                name="endereco"
                                value={cliente.endereco}
                                onChange={manipularMudancas}
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* LINHA 6: OBSERVAÇÕES */}
                <Row className="mb-3">
                    <Col md={12}>
                        <FloatingLabel label="Observações:">
                            <Form.Control
                                as="textarea"
                                style={{ height: '80px' }}
                                name="observacoes"
                                value={cliente.observacoes}
                                onChange={manipularMudancas}
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* LINHA 7: ATIVO (Apenas em edição) */}
                {props.modoEdicao && (
                    <Row className="mb-4">
                        <Col md={4}>
                            <FloatingLabel label="Status do Cliente:">
                                <Form.Select 
                                    name="ativo" 
                                    value={cliente.ativo} 
                                    onChange={manipularMudancas}
                                >
                                    <option value="true">ATIVO</option>
                                    <option value="false">INATIVO</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                    </Row>
                )}

                {/* BOTÕES */}
                <Row className="mt-4">
                    <Col md={12} className="d-flex justify-content-end gap-2">
                        <Button variant="danger" onClick={() => {
                            props.setClienteParaEdicao(clienteVazio);
                            props.exibirFormulario(false);
                            props.setModoEdicao(false);
                        }}>
                            <i className="bi bi-x-circle me-1"></i> Cancelar
                        </Button>
                        <Button variant="warning" onClick={() => setCliente(props.modoEdicao ? props.clienteParaEdicao : clienteVazio)}>
                            <i className="bi bi-arrow-counterclockwise me-1"></i> Resetar
                        </Button>
                        <Button
                            type="submit"
                            variant="success"
                            disabled={estado === ESTADO.PENDENTE}
                        >
                            {estado === ESTADO.PENDENTE ? <Spinner size="sm" /> : (
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
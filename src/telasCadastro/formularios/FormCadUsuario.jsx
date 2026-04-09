import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner, InputGroup } from 'react-bootstrap';
import { adicionarUsuario, atualizarUsuario, buscarUsuarios } from '../../redux/redutores/usuarioReducer';
import { useSelector, useDispatch } from 'react-redux';
import ESTADO from '../../recursos/estado';

export default function FormCadUsuario(props) {

    const usuarioVazio = {
        id: '0',
        nome: "",
        email: "",
        senha: "",
        nivel: 'BAIXO',
        ativo: true,
        ultimo_login: '',
        criado: ''
    }

    const [usuario, setUsuario] = useState(props.usuarioParaEdicao || usuarioVazio);
    const [formValidado, setFormValidado] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarSenha2, setMostrarSenha2] = useState(false);
    const [emailIgual, setEmailIgual] = useState(props.modoEdicao);
    const [confirmarSenha, setConfirmarSenha] = useState(props.modoEdicao ? props.usuarioParaEdicao.senha : '');

    const { estado, mensagem, usuarios ,totalRegistros } = useSelector((state) => state.usuario);
    const dispatch = useDispatch();

    const senhasDiferentes = confirmarSenha !== "" && usuario.senha !== confirmarSenha;
    const senhasPreenchidasEIguais = usuario.senha !== "" && confirmarSenha !== "" && !senhasDiferentes;
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email);
    //const emailBuscadoIgual = false;

    const impedirEspaco = (e) => {
        if (e.key === ' ') {
            e.preventDefault();
        }
    };

    function manipularMudancas(e) {
        const componente = e.currentTarget;
        let valor = componente.value;
        if (["senha", "confirmarSenha", "email"].includes(componente.name)) {
            valor = valor.replace(/\s/g, '');
        } 
        if (componente.name === "ativo") {
            valor = (componente.value === "true");
        }
        if (componente.name === "confirmarSenha") {
            setConfirmarSenha(valor);
        }
        else{
            setUsuario({ ...usuario, [componente.name]: valor });   
        }
    }

    async function manipularSubmissao(e){
        e.preventDefault();
        e.stopPropagation();

        const form = e.currentTarget;
        
        // 1. Validações básicas de UI
        if(!emailValido || senhasDiferentes || usuario.nome === ""){
            setFormValidado(true);
            if (senhasDiferentes) toast.error("As senhas não coincidem!");
            return;
        }

        // 2. Busca o usuário pelo e-mail antes de gravar
        // Precisamos de um dispatch que retorne os dados ou usar a lista atualizada
        try{
            const resp = await dispatch(buscarUsuarios({
                email: usuario.email,
                //ativo: usuario.ativo,
                consulta: "equal"
            })).unwrap();

            // Se o seu buscarUsuarios retorna a lista de usuários encontrados:
            const listaEncontrada = resp.listaUsuarios;
            
            // Verifica se existe alguém com esse e-mail que não seja o próprio usuário (em caso de edição)
            const emailJaExiste = listaEncontrada.some(u => 
                u.email.toLowerCase() === usuario.email.toLowerCase() && u.id !== usuario.id
            );

            if(emailJaExiste){
                toast.error("Este e-mail já está cadastrado!");
                setEmailIgual(true);
                setFormValidado(true);
                return; // Interrompe aqui
            }
            else
                setEmailIgual(false);

            // 3. Se passou pela checagem de e-mail, prossegue com a gravação
            if(form.checkValidity()){
                if(!props.modoEdicao){
                    dispatch(adicionarUsuario(usuario));
                } 
                else{
                    dispatch(atualizarUsuario(usuario));
                    props.setModoEdicao(false);
                    props.setUsuarioParaEdicao(usuarioVazio);
                }
                // Limpa tudo após sucesso
                props.exibirFormulario(false);
                setUsuario(usuarioVazio);
                setConfirmarSenha('');
            }
            setFormValidado(false);
        } 
        catch(erro){
            toast.error("Erro ao validar e-mail no servidor.");
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
                {props.modoEdicao ? "Editar Usuário" : "Cadastro de Usuário"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                <Row className="mb-3">
                    <Col md={12}>
                        <FloatingLabel label="Nome Completo:">
                            <Form.Control
                                type="text"
                                placeholder="Nome"
                                name="nome"
                                value={usuario.nome}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && usuario.nome === ""}
                                isValid={usuario.nome !== "" && usuario.nome.length >= 4}
                            />
                            <Form.Control.Feedback type="invalid">Informe o nome!</Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col md={4}>
                        <FloatingLabel label="E-mail:">
                            <Form.Control
                                type="email"
                                placeholder="email@exemplo.com"
                                name="email"
                                value={usuario.email}
                                onKeyDown={(e) => {
                                    if(emailIgual) setEmailIgual(false);
                                    impedirEspaco(e);
                                }}
                                onChange={manipularMudancas}
                                required
                                isInvalid={formValidado && (!emailValido || emailIgual)}
                                isValid={usuario.email !== "" && emailValido && (props.modoEdicao ? emailIgual : !emailIgual)}
                            />
                            <Form.Control.Feedback type="invalid">{emailIgual ? "Este e-mail já está em uso!" : "Informe um e-mail válido!"}</Form.Control.Feedback>
                        </FloatingLabel>
                    </Col>
                    <Col md={4}>
                        <InputGroup>
                            <FloatingLabel label="Senha:" style={{ flex: "1" }}>
                                <Form.Control
                                    type={mostrarSenha ? "text" : "password"}
                                    placeholder="Senha"
                                    name="senha"
                                    value={usuario.senha}
                                    onChange={manipularMudancas}
                                    required
                                    isInvalid={(formValidado && usuario.senha === "") || senhasDiferentes}
                                    isValid={senhasPreenchidasEIguais}
                                />
                            </FloatingLabel>
                            <Button
                                variant="outline-secondary"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                            >
                                {mostrarSenha ? <i className="bi bi-eye"></i> : <i className="bi bi-eye-slash"></i>}
                            </Button>
                            <Form.Control.Feedback type="invalid">As senhas não coincidem!</Form.Control.Feedback>
                        </InputGroup>
                    </Col>
                    <Col md={4}>
                        <InputGroup>
                            <FloatingLabel label="Confirmar Senha:">
                                <Form.Control
                                    type={mostrarSenha2 ? "text" : "password"}
                                    placeholder="Repita a senha"
                                    name="confirmarSenha"
                                    value={confirmarSenha}
                                    onChange={manipularMudancas}
                                    required
                                    isInvalid={(formValidado && usuario.senha === "") || senhasDiferentes}
                                    isValid={senhasPreenchidasEIguais}
                                />
                            </FloatingLabel>
                            <Button
                                variant="outline-secondary"
                                onClick={() => setMostrarSenha2(!mostrarSenha2)}
                            >
                                {mostrarSenha2 ? <i className="bi bi-eye"></i> : <i className="bi bi-eye-slash"></i>}
                            </Button>
                            <Form.Control.Feedback type="invalid">As senhas devem ser iguais!</Form.Control.Feedback>
                        </InputGroup>
                    </Col>
                </Row>
                <Row className="mb-4">
                    <Col md={props.modoEdicao ? 6 : 12}>
                        <FloatingLabel label="Nível de Acesso:">
                            <Form.Select 
                                name="nivel" 
                                value={usuario.nivel} 
                                onChange={manipularMudancas}
                                isInvalid={(formValidado && usuario.nivel === "")}
                                isValid={usuario.nivel !== ""}
                            >
                                <option value="ADMIN">ADMIN (Acesso Total)</option>
                                <option value="OPERADOR">OPERADOR (Gestão)</option>
                                <option value="BAIXO">BAIXO (Consulta)</option>
                            </Form.Select>
                        </FloatingLabel>
                    </Col>

                    {/* Mostrar o campo Ativo SOMENTE no modo de edição */}
                    {props.modoEdicao && (
                        <Col md={6}>
                            <FloatingLabel label="Status da Conta:">
                                <Form.Select 
                                    name="ativo" 
                                    value={usuario.ativo} 
                                    onChange={manipularMudancas}
                                    isInvalid={(formValidado && usuario.ativo === "")}
                                    isValid={usuario.ativo !== ""}
                                >
                                    <option value="true">ATIVO</option>
                                    <option value="false">DESATIVADO</option>
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
                                props.setUsuarioParaEdicao(usuarioVazio);
                                props.exibirFormulario(false);
                            }}
                        >
                            <i className="bi bi-x-circle me-1"></i> Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="warning"
                            onClick={() => {
                                setUsuario(usuarioVazio);
                                setConfirmarSenha('');
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
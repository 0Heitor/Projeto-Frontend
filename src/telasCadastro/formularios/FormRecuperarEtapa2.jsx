import { Form, Button, FloatingLabel, InputGroup } from 'react-bootstrap';
import { atualizarUsuario } from '../../redux/redutores/usuarioReducer';
import { useState } from "react";
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

export default function FormRecuperarEtapa2({ setEtapa, dados }) {
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarSenha2, setMostrarSenha2] = useState(false);
    const dispatch = useDispatch();


    async function finalizarTroca(e) {
        e.preventDefault();
    
        if (novaSenha !== confirmarSenha) {
            return toast.error("As senhas não coincidem!");
        }

        try {
            const resp = await dispatch(atualizarUsuario({ ...dados, senha: novaSenha })).unwrap();
            
            //console.log("Resposta da API:", resp);
            if (resp && (resp.status === true || resp.id)) { 
                toast.success("Senha redefinida com sucesso!");
                setDados({ email: "", codigo: "" });
                setTimeout(() => {
                    setEtapa('login');
                }, 500);
            } else {
                toast.error(resp.mensagem || "Erro ao redefinir senha.");
            }
        } catch (error) {
            //console.error("Erro no Dispatch:", error);
            toast.error("Erro técnico ao redefinir senha.");
        }
    }

    return (
        <Form onSubmit={finalizarTroca}>
            <h4 className="mb-3 text-primary text-center">Nova Senha</h4>
            <p className="text-muted small text-center">Redefinindo para: {dados.email}</p>
            
            {/* Reduzi a margem inferior de mb-3 para mb-2 para ficarem mais próximos */}
            <InputGroup className="mb-2">
                <FloatingLabel label="Nova Senha" style={{ flex: "1" }}>
                    <Form.Control 
                        type={mostrarSenha ? "text" : "password"} 
                        required 
                        onChange={(e) => setNovaSenha(e.target.value)} 
                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    />
                </FloatingLabel>

                <Button
                    variant="outline-secondary"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="d-flex align-items-center"
                    style={{ 
                        borderTopLeftRadius: 0, 
                        borderBottomLeftRadius: 0,
                        height: "58px"
                    }}
                >
                    {mostrarSenha ? <i className="bi bi-eye"></i> : <i className="bi bi-eye-slash"></i>}
                </Button>
            </InputGroup>

            {/* Margem mb-3 aqui para separar o último campo do botão de "Salvar" */}
            <InputGroup className="mb-3">
                <FloatingLabel label="Confirmar Nova Senha" style={{ flex: "1" }}>
                    <Form.Control 
                        type={mostrarSenha2 ? "text" : "password"} 
                        required 
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        isInvalid={confirmarSenha !== "" && novaSenha !== confirmarSenha}
                        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    />
                    <Form.Control.Feedback type="invalid">As senhas não coincidem!</Form.Control.Feedback>
                </FloatingLabel>

                <Button
                    variant="outline-secondary"
                    onClick={() => setMostrarSenha2(!mostrarSenha2)}
                    className="d-flex align-items-center"
                    style={{ 
                        borderTopLeftRadius: 0, 
                        borderBottomLeftRadius: 0,
                        height: "58px"
                    }}
                >
                    {mostrarSenha2 ? <i className="bi bi-eye"></i> : <i className="bi bi-eye-slash"></i>}
                </Button>
            </InputGroup>

            <Button variant="primary" className="w-100" type="submit">Salvar Senha</Button>
        </Form>
    );
}
import { Form, Button, FloatingLabel, InputGroup } from 'react-bootstrap';
import { useState } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { atualizarUsuario, buscarUsuariosEmail } from '../../redux/redutores/usuarioReducer';
import { useAuth } from '../../contexto/AuthContext';
import { toast } from 'react-toastify';

export default function FormLogin({ setEtapa }) {
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { login } = useAuth();

    const impedirEspaco = (e) => {
        if (e.key === ' ') {
            e.preventDefault();
        }
    };

    async function handleLogin(e) {
        e.preventDefault();
        if(email.includes("@") && senha){
            try {
                const resp = await dispatch(buscarUsuariosEmail({ email, senha })).unwrap();
                if(resp.totalRegistros === 1 && resp.listaUsuarios[0].email === email){
                    dispatch(atualizarUsuario({ ...resp.listaUsuarios[0], ultimo_login: new Date().toISOString() }));
                    toast.success("Login realizado com sucesso!");
                    login(resp.listaUsuarios[0]);
                    navigate("/Sistema");
                } 
                else{
                    toast.error("Credenciais inválidas");
                }
            } catch (err) {
                toast.error("Erro ao conectar ao servidor");
            }
        }
        else{
            toast.error("Por favor, insira um e-mail válido e senha");
        }
        
    }

    return (
        <Form onSubmit={handleLogin}>
            <h2 className="mb-4 text-primary text-center">Login</h2>
            
            <FloatingLabel label="E-mail" className="mb-3">
                <Form.Control type="email" required onKeyDown={(e) => impedirEspaco(e)} onChange={(e) => setEmail(e.target.value)} />
            </FloatingLabel>

            <InputGroup className="mb-3">
                <FloatingLabel label="Senha" style={{ flex: "1" }}>
                    <Form.Control 
                        type={mostrarSenha ? "text" : "password"} 
                        required 
                        onChange={(e) => setSenha(e.target.value)}
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

            <div className="mb-3 text-end">
                <Button variant="link" size="sm" onClick={() => setEtapa('esqueceu')}>
                    Esqueceu sua senha?
                </Button>
            </div>
            
            <Button variant="primary" className="w-100" type="submit">Entrar</Button>
        </Form>
    );
}
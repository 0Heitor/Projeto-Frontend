import { Form, Button, FloatingLabel } from 'react-bootstrap';
import { useState } from "react";
import { useDispatch } from 'react-redux';
import { enviarCodigoRecuperacao, validarCodigoRecuperacao } from '../../redux/redutores/usuarioReducer';
import { toast } from 'react-toastify';

export default function FormRecuperarEtapa1({ setEtapa, dados, setDados }) {
    const [mostraCodigo, setMostraCodigo] = useState(false);
    const dispatch = useDispatch();

    const impedirEspaco = (e) => {
        if (e.key === ' ') {
            e.preventDefault();
        }
    };

    const apenasNumeros = (e) => {
        const teclasPermitidas = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];

        if (teclasPermitidas.includes(e.key)) {
            return;
        }
        
        if (/\D/.test(e.key)) {
            e.preventDefault();
        }
    };

    async function enviarCodigo(e) {
        e.preventDefault();
        if(dados.email.includes("@")){
            /*try {
                const resp = await dispatch(buscarUsuariosEmail({ email: dados.email })).unwrap();
                if(resp.totalRegistros === 1 && resp.listaUsuarios[0].email === dados.email){*/
                    try{
                        const respC = await dispatch(enviarCodigoRecuperacao({ email: dados.email })).unwrap();
                        if(respC.status){
                            toast.info("Código enviado para " + dados.email + ". Verifique sua caixa de entrada (ou spam) e insira o código aqui.");
                            setMostraCodigo(true);
                        }
                    } 
                    catch(error){
                        toast.error("Erro ao enviar código pro e-mail");
                    }
                /*} 
                else{
                    toast.error("Credenciais inválidas");
                }
            } catch (err) {
                toast.error("Erro ao conectar ao servidor");
            }*/
        }
        //toast.info("Se este e-mail estiver cadastrado em nosso sistema, você receberá um código de recuperação no seu e-mail em instantes..");
    }

    async function validarCodigo(e) {
        e.preventDefault();
        try {
            const resp = await dispatch(validarCodigoRecuperacao({ email: dados.email, codigo: dados.codigo })).unwrap();
            if(resp.status && dados.codigo.length === 6){
                toast.success("Código validado com sucesso!");
                setEtapa('resetar');
            }
            else{
                if(resp.tentativas_restantes <= 0){
                    toast.error("Número máximo de tentativas atingido. Por favor, solicite um novo código.");
                    setDados({ ...dados, codigo: '' });
                    setMostraCodigo(false);
                }
                else
                    toast.error(resp.mensagem || "Código inválido");
            }
        } 
        catch(error) {
            toast.error("Erro ao validar código: " + (error.mensagem || error.message));
        }
    }

    return (
        <>
            {!mostraCodigo ? (
                <Form onSubmit={enviarCodigo}>
                    <h4 className="mb-3 text-primary">Recuperar Senha</h4>
                    <FloatingLabel label="Digite seu E-mail" className="mb-4">
                        <Form.Control 
                            type="email" 
                            required 
                            value={dados.email}
                            onKeyDown={(e) => impedirEspaco(e)}
                            onChange={(e) => setDados({...dados, email: e.target.value})} 
                        />
                    </FloatingLabel>
                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" className="w-50" onClick={() => {setEtapa('login'); setDados({ ...dados, email: '' })}}>Voltar</Button>
                        <Button variant="success" className="w-50" type="submit">Enviar Código</Button>
                    </div>
                </Form>
            ) : (
                <Form onSubmit={validarCodigo}>
                    <h4 className="mb-3 text-primary text-center">Verificar Código</h4>
                    <FloatingLabel label="Código de 6 dígitos" className="mb-4">
                        <Form.Control 
                            type="text" 
                            required 
                            value={dados.codigo}
                            maxLength={6} 
                            className="text-center fw-bold"
                            style={{ fontSize: '1.5rem', letterSpacing: '5px' }}
                            onKeyDown={(e) => apenasNumeros(e)}
                            onChange={(e) => setDados({...dados, codigo: e.target.value})} 
                        />
                    </FloatingLabel>
                    <Button variant="success" className="w-100" type="submit">Validar Código</Button>
                </Form>
            )}
        </>
    );
}
import { useState } from "react";
import { Container } from 'react-bootstrap';
import FormLogin from "./formularios/FormLogin";
import FormRecuperarEtapa1 from "./formularios/FormRecuperarEtapa1";
import FormRecuperarEtapa2 from "./formularios/FormRecuperarEtapa2";

export default function TelaLogin() {
    // etapas: 'login' | 'esqueceu' | 'resetar'
    const [etapa, setEtapa] = useState('login');
    const [dadosRecuperacao, setDadosRecuperacao] = useState({ email: "", codigo: "" });

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="p-4 shadow-sm bg-white rounded border" style={{ width: '100%', maxWidth: '450px' }}>
                {etapa === 'login' && (
                    <FormLogin setEtapa={setEtapa} />
                )}

                {etapa === 'esqueceu' && (
                    <FormRecuperarEtapa1 
                        setEtapa={setEtapa} 
                        dados={dadosRecuperacao} 
                        setDados={setDadosRecuperacao} 
                    />
                )}

                {etapa === 'resetar' && (
                    <FormRecuperarEtapa2 
                        setEtapa={setEtapa} 
                        dados={dadosRecuperacao}
                        setDados={setDadosRecuperacao}
                    />
                )}
            </div>
        </Container>
    );
}
import { Container } from "react-bootstrap";
import { useState } from "react";
import Pagina from "../templates/Pagina";
import FormCadUsuario from "./formularios/FormCadUsuario";
import TabelaUsuarios from "./tabelas/TabelaUsuarios";

export default function TelaCadastroUsuario(props) {
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [usuarioParaEdicao, setUsuarioParaEdicao] = useState({
        id: '0',
        nome: '',
        email: '',
        senha: '',
        nivel: 'BASICO',
        ativo: true,
        ultimo_login:'',
        criado:''
    });
    const [filtros, setFiltros] = useState({
        nome: "",
        email: "",
        nivel: "",
        ativo: "true"
    }); 
    
    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina>
                    {
                        exibirFormulario ? <FormCadUsuario exibirFormulario={setExibirFormulario}
                            usuarioParaEdicao={usuarioParaEdicao}
                            setUsuarioParaEdicao={setUsuarioParaEdicao}
                            modoEdicao={modoEdicao}
                            setModoEdicao={setModoEdicao}
                        /> 
                            :
                            <TabelaUsuarios exibirFormulario={setExibirFormulario}
                                usuarioParaEdicao={usuarioParaEdicao}
                                setUsuarioParaEdicao={setUsuarioParaEdicao}
                                modoEdicao={modoEdicao}
                                setModoEdicao={setModoEdicao}
                                itensPorPagina={itensPorPagina}
                                setItensPorPagina={setItensPorPagina}
                                paginaAtual={paginaAtual}
                                setPaginaAtual={setPaginaAtual}
                                filtros={filtros}
                                setFiltros={setFiltros}
                            />
                    }
                </Pagina>
            </Container>
        </div>
    )
}
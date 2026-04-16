import { Container } from "react-bootstrap";
import { useState } from "react";
import Pagina from "../templates/Pagina";
import FormCadTipoCacamba from "./formularios/FormCadTipoCacamba";
import TabelaTipoCacambas from "./tabelas/TabelaTipoCacambas";

export default function TelaCadastroTipoCacamba(props) {
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [tipoCacambaParaEdicao, setTipoCacambaParaEdicao] = useState({
        id: '0',
        nome: '',
        volume: '',
        preco: 0.00,
        descricao: '',
        ativo: true,
        atualizado_em:'',
        criado_em:''
    });
    const [filtros, setFiltros] = useState({
        nome: "",
        volume: "",
        descricao: "",
        ativo: "true"
    }); 
    
    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina>
                    {
                        exibirFormulario ? <FormCadTipoCacamba exibirFormulario={setExibirFormulario}
                            tipoCacambaParaEdicao={tipoCacambaParaEdicao}
                            setTipoCacambaParaEdicao={setTipoCacambaParaEdicao}
                            modoEdicao={modoEdicao}
                            setModoEdicao={setModoEdicao}
                        /> 
                            :
                            <TabelaTipoCacambas exibirFormulario={setExibirFormulario}
                                tipoCacambaParaEdicao={tipoCacambaParaEdicao}
                                setTipoCacambaParaEdicao={setTipoCacambaParaEdicao}
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
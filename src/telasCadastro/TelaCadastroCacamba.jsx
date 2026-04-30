import { Container } from "react-bootstrap";
import { useState } from "react";
import Pagina from "../templates/Pagina";
import FormCadCacamba from "./formularios/FormCadCacamba";
import TabelaCacambas from "./tabelas/TabelaCacambas";
import ModalSelecaoTipo from "./modais/ModalSelecaoTipo";

export default function TelaCadastroCacamba(props) {
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [showModalTipo, setShowModalTipo] = useState(false);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [cacambaParaEdicao, setCacambaParaEdicao] = useState({
        id: '0',
        tipoCacamba: {
            id: '0',
            nome: '',
            volume: '',
            preco: 0.00,
            descricao: '',
            ativo: true,
            atualizado_em:'',
            criado_em:''
        },
        numero: '',
        status: 'DISPONIVEL',
        modelo: '',
        endereco_atual:'',
        ultima_revisao: '',
        ativo: true,
        atualizado_em:'',
        criado_em:''
    });
    const [filtros, setFiltros] = useState({
        numero: "",
        modelo: "",
        tamanho: "",
        status: "",
        ativo: "true"
    }); 
    
    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina>
                    {
                        exibirFormulario ? <FormCadCacamba exibirFormulario={setExibirFormulario}
                            cacambaParaEdicao={cacambaParaEdicao}
                            setCacambaParaEdicao={setCacambaParaEdicao}
                            modoEdicao={modoEdicao}
                            setModoEdicao={setModoEdicao}
                            abrirModalTipo={() => setShowModalTipo(true)}
                        /> 
                            :
                            <TabelaCacambas exibirFormulario={setExibirFormulario}
                                cacambaParaEdicao={cacambaParaEdicao}
                                setCacambaParaEdicao={setCacambaParaEdicao}
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

            <ModalSelecaoTipo 
                show={showModalTipo} 
                onHide={() => setShowModalTipo(false)}
                onSelecionar={(tipoSelecionado) => {
                    setCacambaParaEdicao({
                        ...cacambaParaEdicao,
                        tipo: tipoSelecionado
                    });
                }}
            />
        </div>
    )
}
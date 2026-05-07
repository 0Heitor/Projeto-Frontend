import { Container } from "react-bootstrap";
import { useState } from "react";
import Pagina from "../templates/Pagina";
import FormCadCategoriaGrupo from "./formularios/FormCadCategoriaGrupo";
import TabelaCategoriaGrupo from "./tabelas/TabelaCategoriaGrupos";

export default function TelaCadastroCategoriaGrupo(props) {
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [categoriaGrupoParaEdicao, setCategoriaGrupoParaEdicao] = useState({
        id: '0',
        nome: '',
        margem_lucro: '',
        comissao_padrao: '',
        ativo: true,
        atualizado:'',
        criado:''
    });
    const [filtros, setFiltros] = useState({
        nome: "",
        margem_lucro: "",
        comissao_padrao: "",
        ativo: "true"
    });

    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina>
                    {
                        exibirFormulario ? <FormCadCategoriaGrupo exibirFormulario={setExibirFormulario}
                            categoriaGrupoParaEdicao={categoriaGrupoParaEdicao}
                            setCategoriaGrupoParaEdicao={setCategoriaGrupoParaEdicao}
                            modoEdicao={modoEdicao}
                            setModoEdicao={setModoEdicao}
                        /> 
                            :
                            <TabelaCategoriaGrupo exibirFormulario={setExibirFormulario}
                                categoriaGrupoParaEdicao={categoriaGrupoParaEdicao}
                                setCategoriaGrupoParaEdicao={setCategoriaGrupoParaEdicao}
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
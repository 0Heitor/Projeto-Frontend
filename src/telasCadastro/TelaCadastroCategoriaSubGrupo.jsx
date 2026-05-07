import { Container } from "react-bootstrap";
import { useState } from "react";
import Pagina from "../templates/Pagina";
import FormCadCategoriaSubGrupo from "./formularios/FormCadCategoriaSubGrupo";
import TabelaCategoriaSubGrupo from "./tabelas/TabelaCategoriaSubGrupos";
import ModalSelecaoCategoriaGrupo from "./modais/ModalSelecaoCategoriaGrupo";

export default function TelaCadastroCategoriaSubGrupo(props) {
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [showModalCategoria, setShowModalCategoria] = useState(false);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [categoriaSubGrupoParaEdicao, setCategoriaSubGrupoParaEdicao] = useState({
        id: '0',
        nome: '',
        ncm_padrao: '',
        localizacao: '',
        ativo: true,
        atualizado:'',
        criado:'',
        categoriaGrupo: {
            id: '0',
            nome: '',
            margem_lucro: '',
            comissao_padrao: '',
            ativo: true,
            atualizado:'',
            criado:''
        }
    });
    const [filtros, setFiltros] = useState({
        nome: "",
        ncm_padrao: "",
        localizacao: "",
        ativo: "true"
    });

    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina>
                    {
                        exibirFormulario ? <FormCadCategoriaSubGrupo exibirFormulario={setExibirFormulario}
                            categoriaSubGrupoParaEdicao={categoriaSubGrupoParaEdicao}
                            setCategoriaSubGrupoParaEdicao={setCategoriaSubGrupoParaEdicao}
                            modoEdicao={modoEdicao}
                            setModoEdicao={setModoEdicao}
                            abrirModalCategoriaGrupo={() => setShowModalCategoria(true)}
                        /> 
                            :
                            <TabelaCategoriaSubGrupo exibirFormulario={setExibirFormulario}
                                categoriaSubGrupoParaEdicao={categoriaSubGrupoParaEdicao}
                                setCategoriaSubGrupoParaEdicao={setCategoriaSubGrupoParaEdicao}
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

            <ModalSelecaoCategoriaGrupo 
                show={showModalCategoria} 
                onHide={() => setShowModalCategoria(false)}
                onSelecionar={(categoriaSelecionada) => {
                    setCategoriaSubGrupoParaEdicao({
                        ...categoriaSubGrupoParaEdicao,
                        categoriaGrupo: categoriaSelecionada
                    });
                }}
            />
        </div>
    )
}
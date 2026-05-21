import { Container } from "react-bootstrap";
import { useState } from "react";
import Pagina from "../templates/Pagina";
import FormCadProduto from "./formularios/FormCadProduto";
import TabelaProdutos from "./tabelas/TabelaProdutos";
import ModalSelecaoSubgrupo from "./modais/ModalSelecaoCategoriaSubGrupo"; 
import ModalSelecaoFornecedor from "./modais/ModalSelecaoFornecedor";

export default function TelaCadastroProduto(props) {
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [showModalSubgrupo, setShowModalSubgrupo] = useState(false);
    const [showModalFornecedor, setShowModalFornecedor] = useState(false);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [produtoParaEdicao, setProdutoParaEdicao] = useState({
        id: '0',
        categoriasubgrupo:{
            id: '0',
            nome: '',
            ncm_padrao: '',
            localizacao: '',
            ativo: true,
            categoriaGrupo: {
                id: '0',
                nome: '',
                margem_lucro: '',
                comissao_padrao: '',
                ativo: true,
                atualizado:'',
                criado:''
            }
        },
        fornecedor:{
            id: '0',
            codigo: '',
            nome_fantasia: '',
            cnpj: '',
            telefone: '',
            uf: '',
            cidade: '',
            bairro: '',
            endereco: '',
            ativo: true
        },
        codigo: '',
        codigo_de_barras: '',
        descricao: '',
        descricao_marca: '',
        unidade_medida: '',
        preco_custo: '',
        preco_venda: '',
        percentual_financeiro: '',
        tributacao: '',
        estoque: '0.00',
        estoque_minimo: '1.00',
        ativo: true
    });
    const [filtros, setFiltros] = useState({
        termo: "",
        codigo: "",
        codigo_de_barras: "",
        descricao: "",
        ativo: "true"
    }); 
    
    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina>
                    {
                        exibirFormulario ? <FormCadProduto exibirFormulario={setExibirFormulario}
                            produtoParaEdicao={produtoParaEdicao}
                            setProdutoParaEdicao={setProdutoParaEdicao}
                            modoEdicao={modoEdicao}
                            setModoEdicao={setModoEdicao}
                            abrirModalSubgrupo={() => setShowModalSubgrupo(true)}
                            abrirModalFornecedor={() => setShowModalFornecedor(true)}
                        /> 
                            :
                            <TabelaProdutos exibirFormulario={setExibirFormulario}
                                produtoParaEdicao={produtoParaEdicao}
                                setProdutoParaEdicao={setProdutoParaEdicao}
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

            <ModalSelecaoSubgrupo 
                show={showModalSubgrupo} 
                onHide={() => setShowModalSubgrupo(false)}
                onSelecionar={(subgrupoSelecionado) => {
                    setProdutoParaEdicao({
                        ...produtoParaEdicao,
                        categoriasubgrupo: subgrupoSelecionado
                    });
                }}
            />
            <ModalSelecaoFornecedor 
                show={showModalFornecedor} 
                onHide={() => setShowModalFornecedor(false)}
                onSelecionar={(fornecedorSelecionado) => {
                    setProdutoParaEdicao({
                        ...produtoParaEdicao,
                        fornecedor: fornecedorSelecionado
                    });
                }}
            />
        </div>
    )
}
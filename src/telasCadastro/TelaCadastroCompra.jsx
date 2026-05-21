import { Container } from "react-bootstrap";
import { useState } from "react";
import Pagina from "../templates/Pagina";
import FormCadCompra from "./formularios/FormCadCompra";
import TabelaCompras from "./tabelas/TabelaCompras";
import ModalSelecaoFornecedor from "./modais/ModalSelecaoFornecedor";
import ModalSelecaoProduto from "./modais/ModalSelecaoProduto";

export default function TelaCadastroCompra(props) {
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [showModalFornecedor, setShowModalFornecedor] = useState(false);
    const [showModalProduto, setShowModalProduto] = useState(false);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [compraParaEdicao, setCompraParaEdicao] = useState({
        id: '0',
        fornecedor: {
            id: '0',
            codigo: '',
            nome_fantasia: '',
            cnpj: '',
            telefone: '',
            uf: '',
            cidade: '',
            bairro: '',
            endereco: '',
            ativo: true,
            criado:''
        },
        itens: [
            {
                id: '0',
                produto: {
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
                },
                quantidade: '0.00',
                valor_unitario: '0.00',
                ativo: true,
                criado: '',
                atualizado: ''
            }
        ],
        valor_total: '0.00',
        data_compra: '',
        status: '',
        ativo: true,
        criado: '',
        atualizado: ''
    });
    const [filtros, setFiltros] = useState({
        id: '',
        fornecedor: {
            nome_fantasia: ''
        },
        produto: '',
        data_compra_inicio: '',
        data_compra_fim: '',
        ativo: "true"
    }); 
    
    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina>
                    {
                        exibirFormulario ? <FormCadCompra exibirFormulario={setExibirFormulario}
                            compraParaEdicao={compraParaEdicao}
                            setCompraParaEdicao={setCompraParaEdicao}
                            modoEdicao={modoEdicao}
                            setModoEdicao={setModoEdicao}
                            abrirModalFornecedor={() => setShowModalFornecedor(true)}
                            abrirModalProduto={() => setShowModalProduto(true)}
                        /> 
                            :
                            <TabelaCompras exibirFormulario={setExibirFormulario}
                                compraParaEdicao={compraParaEdicao}
                                setCompraParaEdicao={setCompraParaEdicao}
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

            <ModalSelecaoFornecedor 
                show={showModalFornecedor} 
                onHide={() => setShowModalFornecedor(false)}
                onSelecionar={(fornecedorSelecionado) => {
                    setCompraParaEdicao({
                        ...compraParaEdicao,
                        fornecedor: fornecedorSelecionado
                    });
                }}
            />
            <ModalSelecaoProduto 
                show={showModalProduto} 
                onHide={() => setShowModalProduto(false)}
                onSelecionar={(produtoSelecionado) => {
                    setCompraParaEdicao({
                        ...compraParaEdicao,
                        produto: produtoSelecionado
                    });
                }}
            />
        </div>
    )
}
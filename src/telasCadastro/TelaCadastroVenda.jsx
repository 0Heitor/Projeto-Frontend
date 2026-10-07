import { Container } from "react-bootstrap";
import { useState } from "react";
import Pagina from "../templates/Pagina";
import FormCadVenda from "./formularios/FormCadVenda";
import TabelaVendas from "./tabelas/TabelaVendas";
import ModalSelecaoCliente from "./modais/ModalSelecaoCliente";
import ModalSelecaoUsuario from "./modais/ModalSelecaoUsuario";
import ModalSelecaoProduto from "./modais/ModalSelecaoProduto";

export default function TelaCadastroVenda(props) {
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [showModalCliente, setShowModalCliente] = useState(false);
    const [showModalUsuario, setShowModalUsuario] = useState(false);
    const [showModalProduto, setShowModalProduto] = useState(false);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [vendaParaEdicao, setVendaParaEdicao] = useState({
        id: '0',
        cliente: {
            id: '0',
            nome: '',
            tipoPessoa: 'PF',
            cpf_cnpj: '',
            rg: '',
            data_nascimento: '',
            profissao: '',
            local_trabalho: '',
            telefone: '',
            cep: '',
            endereco: '',
            ativo: true,
            observacoes: '',
            criado:''
        },
        usuario: {
            id: '0',
            nome: '',
            email: '',
            senha: '',
            nivel: 'BASICO',
            ativo: true,
            ultimo_login:'',
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
                //valor_unitario: '0.00',
                ativo: true,
                criado: '',
                atualizado: ''
            }
        ],
        total: '0.00',
        forma_pagamento: '',
        status: '',
        ativo: true,
        atualizado: '',
        criado: ''
    });
    const [filtros, setFiltros] = useState({
        id: '',
        cliente: {
            nome: ''
        },
        usuario: {
            nome: ''
        },
        produto: '',
        ativo: "true"
    }); 
    
    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina>
                    {
                        exibirFormulario ? <FormCadVenda exibirFormulario={setExibirFormulario}
                            vendaParaEdicao={vendaParaEdicao}
                            setVendaParaEdicao={setVendaParaEdicao}
                            modoEdicao={modoEdicao}
                            setModoEdicao={setModoEdicao}
                            abrirModalCliente={() => setShowModalCliente(true)}
                            abrirModalUsuario={() => setShowModalUsuario(true)}
                            abrirModalProduto={() => setShowModalProduto(true)}
                        /> 
                            :
                            <TabelaVendas exibirFormulario={setExibirFormulario}
                                vendaParaEdicao={vendaParaEdicao}
                                setVendaParaEdicao={setVendaParaEdicao}
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

            <ModalSelecaoCliente
                show={showModalCliente} 
                onHide={() => setShowModalCliente(false)}
                onSelecionar={(clienteSelecionado) => {
                    setVendaParaEdicao({
                        ...vendaParaEdicao,
                        cliente: clienteSelecionado
                    });
                }}
            />
            <ModalSelecaoUsuario
                show={showModalUsuario} 
                onHide={() => setShowModalUsuario(false)}
                onSelecionar={(usuarioSelecionado) => {
                    setVendaParaEdicao({
                        ...vendaParaEdicao,
                        usuario: usuarioSelecionado
                    });
                }}
            />
            <ModalSelecaoProduto 
                show={showModalProduto} 
                onHide={() => setShowModalProduto(false)}
                onSelecionar={(produtoSelecionado) => {
                    setVendaParaEdicao({
                        ...vendaParaEdicao,
                        produto: produtoSelecionado
                    });
                }}
            />
        </div>
    )
}
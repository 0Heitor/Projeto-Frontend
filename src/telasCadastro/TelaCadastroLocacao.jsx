import { Container } from "react-bootstrap";
import { useState } from "react";
import Pagina from "../templates/Pagina";
import FormCadLocacao from "./formularios/FormCadLocacao";
import TabelaLocacoes from "./tabelas/TabelaLocacoes";
import ModalSelecaoCliente from "./modais/ModalSelecaoCliente";
import ModalSelecaoCacamba from "./modais/ModalSelecaoCacamba";

export default function TelaCadastroLocacao(props) {
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [showModalCliente, setShowModalCliente] = useState(false);
    const [showModalCacamba, setShowModalCacamba] = useState(false);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [locacaoParaEdicao, setLocacaoParaEdicao] = useState({
        id: '0',
        cliente: {
            id: '0',
            nome: "",
            cpf_cnpj: "",
            rg: "",
            data_nascimento: "",
            profissao: "",
            local_trabalho: "",
            telefone: "",
            cep: "",
            endereco: "",
            ativo: true,
            observacoes: "",
            criado:""
        },
        itens: [
            {
                id: '0',
                cacamba: {
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
                },
                valor_unitario: "",
                data_retirada_real: null,
                status_item: "AGENDADA",
                ativo: true,
                atualizado_em: null,
                criado_em: ""
            }
        ],
        data_pedido: "",
        data_entrega: "",
        data_retirada_prevista: "",
        data_retirada_real: "",
        endereco_entrega: "",
        valor_total: "",
        status: "AGENDADA",
        ativo: true,
        atualizado_em: "",
        criado_em: ""
    });
    const [filtros, setFiltros] = useState({
        id: '',
        cliente: {
            nome: ''
        },
        status: "AGENDADA",
        ativo: "true"
    }); 
    
    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina>
                    {
                        exibirFormulario ? <FormCadLocacao exibirFormulario={setExibirFormulario}
                            locacaoParaEdicao={locacaoParaEdicao}
                            setLocacaoParaEdicao={setLocacaoParaEdicao}
                            modoEdicao={modoEdicao}
                            setModoEdicao={setModoEdicao}
                            abrirModalCliente={() => setShowModalCliente(true)}
                            abrirModalCacamba={() => setShowModalCacamba(true)}
                        /> 
                            :
                            <TabelaLocacoes exibirFormulario={setExibirFormulario}
                                locacaoParaEdicao={locacaoParaEdicao}
                                setLocacaoParaEdicao={setLocacaoParaEdicao}
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
                    setLocacaoParaEdicao({
                        ...locacaoParaEdicao,
                        cliente: clienteSelecionado
                    });
                }}
            />
            <ModalSelecaoCacamba
                show={showModalCacamba}
                onHide={() => setShowModalCacamba(false)}
                onSelecionar={(cacambaSelecionada) => {
                    setLocacaoParaEdicao({
                        ...locacaoParaEdicao,
                        cacamba: cacambaSelecionada
                    });
                }}
            />
        </div>
    )
}
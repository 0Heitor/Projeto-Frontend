import { Container } from "react-bootstrap";
import { useState } from "react";
import Pagina from "../templates/Pagina";
//import FormCadFornecedor from "./formularios/FormCadFornecedor";
import TabelaFinanceiros from "./tabelas/TabelaFinanceiros";

export default function TelaCadastroFinanceiro(props) {
    const [exibirFormulario, setExibirFormulario] = useState(false);
    const [modoEdicao, setModoEdicao] = useState(false);
    const [itensPorPagina, setItensPorPagina] = useState(5);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [financeiroParaEdicao, setFinanceiroParaEdicao] = useState({
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
        origem_tipo: '',
        valor_total: '',
        forma_pagamento: '',
        data_vencimento: '',
        data_pagamento: '',
        status: '',
        ativo: true,
        atualizado:'',
        criado:''
    });
    const [filtros, setFiltros] = useState({
        nome: "",
        status: "",
        ativo: "true"
    }); 

    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina>
                    {
                        <TabelaFinanceiros exibirFormulario={setExibirFormulario}
                            financeiroParaEdicao={financeiroParaEdicao}
                            setFinanceiroParaEdicao={setFinanceiroParaEdicao}
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
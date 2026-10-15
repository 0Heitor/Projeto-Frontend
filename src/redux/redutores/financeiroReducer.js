import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
const API_URL = import.meta.env.VITE_API_URL;
let urlBaseConsulta = API_URL+'/api/contas-receber/consulta';
let urlBase = API_URL+'/api/contas-receber';

export const buscarFinanceiros = createAsyncThunk('financeiros/buscarFinanceiros', async (financeiro) => {
    try{
        const resposta = await fetch(urlBaseConsulta, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(financeiro)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o financeiro:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaFinanceiros: dados.listaFinanceiros,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar os financeiros.',
                listaFinanceiros: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar os financeiros da base de dados:' + erro.message,
            listaFinanceiros: [],
            totalRegistros: 0
        }
    }
});

export const atualizarFinanceiro = createAsyncThunk('financeiros/atualizar', async (financeiro) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(financeiro)
    }).catch(erro => {
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o financeiro:' + erro.message
        }
    });
    if (resposta.ok) {
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            financeiro
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o financeiro.',
            financeiro
        }
    }
});

const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    financeiros: [],
    totalRegistros: 0,
};

const financeiroSlice = createSlice({
    name: 'financeiro',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(buscarFinanceiros.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Buscando financeiros...";
        })
        .addCase(buscarFinanceiros.fulfilled, (state, action) => {
            if (action.payload.status) {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.financeiros = action.payload.listaFinanceiros;
                state.totalRegistros = action.payload.totalRegistros;
            } else {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.payload.mensagem;
            }
        })
        .addCase(buscarFinanceiros.rejected, (state, action) => {
            state.estado = ESTADO.ERRO;
            state.mensagem = action.error.message;
        })
        /*.addCase(adicionarFornecedor.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.fornecedores.push(action.payload.fornecedor);
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(adicionarFornecedor.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Adicionando fornecedor...";
        })
        .addCase(adicionarFornecedor.rejected, (state, action) => {
            state.mensagem = "Erro ao adicionar o fornecedor: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })*/
        .addCase(atualizarFinanceiro.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            const indice = state.financeiros.findIndex(financeiro => financeiro.id === action.payload.financeiro.id);
            state.financeiros[indice] = action.payload.financeiro;
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(atualizarFinanceiro.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Atualizando financeiro...";
        })
        .addCase(atualizarFinanceiro.rejected, (state, action) => {
            state.mensagem = "Erro ao atualizar o financeiro: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        /*.addCase(removerFornecedor.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.mensagem = action.payload.mensagem;
            state.fornecedores = state.fornecedores.filter(fornecedor => fornecedor.id !== action.payload.fornecedor.id);
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(removerFornecedor.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Removendo fornecedor...";
        })
        .addCase(removerFornecedor.rejected, (state, action) => {
            state.mensagem = "Erro ao remover o fornecedor: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })*/
    }
});

export default financeiroSlice.reducer;
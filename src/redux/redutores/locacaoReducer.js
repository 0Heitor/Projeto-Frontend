import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
const API_URL = import.meta.env.VITE_API_URL;
let urlBaseConsulta = API_URL+'/api/locacoes/consulta';
let urlBase = API_URL+'/api/locacoes';

export const buscarLocacoes = createAsyncThunk('locacoes/buscarLocacoes', async (locacao) => {
    try{
        const resposta = await fetch(urlBaseConsulta, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(locacao)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a locação:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaLocacoes: dados.listaLocacoes,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a locação.',
                listaLocacoes: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar as locações da base de dados:' + erro.message,
            listaLocacoes: [],
            totalRegistros: 0
        }
    }
});

export const buscarLocacoesPorItem = createAsyncThunk('locacoes/buscarLocacoesPorItem', async (locacao) => {
    try{
        const resposta = await fetch(urlBaseConsulta+"-itens", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(locacao)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a locação:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                itens: dados.listaLocacoes,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a locação.',
                itens: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar as locações da base de dados:' + erro.message,
            itens: [],
            totalRegistros: 0
        }
    }
});

export const adicionarLocacao = createAsyncThunk('locacoes/adicionar', async (locacao) => {
    const resposta = await fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(locacao)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar a locação:' + erro.message
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            locacao
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar a locação.',
            locacao
        }
    }
});

export const atualizarLocacao = createAsyncThunk('locacoes/atualizar', async (locacao) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(locacao)
    }).catch(erro => {
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar a locação:' + erro.message
        }
    });
    if (resposta.ok) {
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            locacao
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar a locação.',
            locacao
        }
    }
});

export const removerLocacao = createAsyncThunk('locacoes/remover', async (locacao) => {
    const resposta = await fetch(urlBase, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(locacao)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover a locação:' + erro.message,
            locacao
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return{
            status: dados.status,
            mensagem: dados.mensagem,
            locacao
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover a locação.',
            locacao
        }
    }
});


const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    locacoes: [],
    itens: [],
    totalRegistros: 0,
};

const locacaoSlice = createSlice({
    name: 'locacao',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(buscarLocacoes.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Buscando locações...";
        })
        .addCase(buscarLocacoes.fulfilled, (state, action) => {
            if (action.payload.status) {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.locacoes = action.payload.listaLocacoes;
                state.totalRegistros = action.payload.totalRegistros;
            } else {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.payload.mensagem;
            }
        })
        .addCase(buscarLocacoes.rejected, (state, action) => {
            state.estado = ESTADO.ERRO;
            state.mensagem = action.error.message;
        })
        .addCase(adicionarLocacao.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.locacoes.push(action.payload.locacao);
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(adicionarLocacao.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Adicionando locação...";
        })
        .addCase(adicionarLocacao.rejected, (state, action) => {
            state.mensagem = "Erro ao adicionar a locação: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(atualizarLocacao.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            const indice = state.locacoes.findIndex(locacao => locacao.id === action.payload.locacao.id);
            state.locacoes[indice] = action.payload.locacao;
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(atualizarLocacao.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Atualizando locação...";
        })
        .addCase(atualizarLocacao.rejected, (state, action) => {
            state.mensagem = "Erro ao atualizar a locação: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(removerLocacao.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.mensagem = action.payload.mensagem;
            state.locacoes = state.locacoes.filter(locacao => locacao.id !== action.payload.locacao.id);
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(removerLocacao.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Removendo locação...";
        })
        .addCase(removerLocacao.rejected, (state, action) => {
            state.mensagem = "Erro ao remover a locação: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
    }
});

export default locacaoSlice.reducer;
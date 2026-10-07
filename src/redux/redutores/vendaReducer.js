import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
const API_URL = import.meta.env.VITE_API_URL;
let urlBaseConsulta = API_URL+'/api/vendas/consulta';
let urlBase = API_URL+'/api/vendas';

export const buscarVendas = createAsyncThunk('vendas/buscarVendas', async (venda) => {
    try{
        const resposta = await fetch(urlBaseConsulta, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(venda)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a venda:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaVendas: dados.listaVendas,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a venda.',
                listaVendas: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar as vendas da base de dados:' + erro.message,
            listaVendas: [],
            totalRegistros: 0
        }
    }
});

export const adicionarVenda = createAsyncThunk('vendas/adicionar', async (venda) => {
    const resposta = await fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(venda)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar a venda:' + erro.message
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            venda
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar a venda.',
            venda
        }
    }
});

export const atualizarVenda = createAsyncThunk('vendas/atualizar', async (venda) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(venda)
    }).catch(erro => {
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar a venda:' + erro.message
        }
    });
    if (resposta.ok) {
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            venda
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar a venda.',
            venda
        }
    }
});

export const removerVenda = createAsyncThunk('vendas/remover', async (venda) => {
    const resposta = await fetch(urlBase, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(venda)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover a venda:' + erro.message,
            venda
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return{
            status: dados.status,
            mensagem: dados.mensagem,
            venda
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover a venda.',
            venda
        }
    }
});

const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    vendas: [],
    itens: [],
    totalRegistros: 0,
};

const vendaSlice = createSlice({
    name: 'venda',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(buscarVendas.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Buscando vendas...";
        })
        .addCase(buscarVendas.fulfilled, (state, action) => {
            if (action.payload.status) {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.vendas = action.payload.listaVendas;
                state.totalRegistros = action.payload.totalRegistros;
            } else {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.payload.mensagem;
            }
        })
        .addCase(buscarVendas.rejected, (state, action) => {
            state.estado = ESTADO.ERRO;
            state.mensagem = action.error.message;
        })
        .addCase(adicionarVenda.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.vendas.push(action.payload.venda);
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(adicionarVenda.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Adicionando venda...";
        })
        .addCase(adicionarVenda.rejected, (state, action) => {
            state.mensagem = "Erro ao adicionar a venda: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(atualizarVenda.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            const indice = state.vendas.findIndex(venda => venda.id === action.payload.venda.id);
            state.vendas[indice] = action.payload.venda;
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(atualizarVenda.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Atualizando venda...";
        })
        .addCase(atualizarVenda.rejected, (state, action) => {
            state.mensagem = "Erro ao atualizar a venda: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(removerVenda.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.mensagem = action.payload.mensagem;
            state.vendas = state.vendas.filter(venda => venda.id !== action.payload.venda.id);
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(removerVenda.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Removendo venda...";
        })
        .addCase(removerVenda.rejected, (state, action) => {
            state.mensagem = "Erro ao remover a venda: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
    }
});

export default vendaSlice.reducer;
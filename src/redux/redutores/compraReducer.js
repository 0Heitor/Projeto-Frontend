import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
const API_URL = import.meta.env.VITE_API_URL;
let urlBaseConsulta = API_URL+'/api/compras/consulta';
let urlBase = API_URL+'/api/compras';

export const buscarCompras = createAsyncThunk('compras/buscarCompras', async (compra) => {
    try{
        const resposta = await fetch(urlBaseConsulta, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(compra)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a compra:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaCompras: dados.listaCompras,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a compra.',
                listaCompras: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar as compras da base de dados:' + erro.message,
            listaCompras: [],
            totalRegistros: 0
        }
    }
});

export const adicionarCompra = createAsyncThunk('compras/adicionar', async (compra) => {
    const resposta = await fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(compra)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar a compra:' + erro.message
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            compra
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar a compra.',
            compra
        }
    }
});

export const atualizarCompra = createAsyncThunk('compras/atualizar', async (compra) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(compra)
    }).catch(erro => {
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar a compra:' + erro.message
        }
    });
    if (resposta.ok) {
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            compra
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar a compra.',
            compra
        }
    }
});

export const removerCompra = createAsyncThunk('compras/remover', async (compra) => {
    const resposta = await fetch(urlBase, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(compra)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover a compra:' + erro.message,
            compra
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return{
            status: dados.status,
            mensagem: dados.mensagem,
            compra
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover a compra.',
            compra
        }
    }
});


const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    compras: [],
    totalRegistros: 0,
};

const compraSlice = createSlice({
    name: 'compra',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(buscarCompras.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Buscando compras...";
        })
        .addCase(buscarCompras.fulfilled, (state, action) => {
            if (action.payload.status) {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.compras = action.payload.listaCompras;
                state.totalRegistros = action.payload.totalRegistros;
            } else {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.payload.mensagem;
            }
        })
        .addCase(buscarCompras.rejected, (state, action) => {
            state.estado = ESTADO.ERRO;
            state.mensagem = action.error.message;
        })
        .addCase(adicionarCompra.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.compras.push(action.payload.compra);
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(adicionarCompra.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Adicionando compra...";
        })
        .addCase(adicionarCompra.rejected, (state, action) => {
            state.mensagem = "Erro ao adicionar a compra: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(atualizarCompra.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            const indice = state.compras.findIndex(compra => compra.id === action.payload.compra.id);
            state.compras[indice] = action.payload.compra;
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(atualizarCompra.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Atualizando compra...";
        })
        .addCase(atualizarCompra.rejected, (state, action) => {
            state.mensagem = "Erro ao atualizar a compra: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(removerCompra.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.mensagem = action.payload.mensagem;
            state.compras = state.compras.filter(compra => compra.id !== action.payload.compra.id);
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(removerCompra.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Removendo compra...";
        })
        .addCase(removerCompra.rejected, (state, action) => {
            state.mensagem = "Erro ao remover a compra: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
    }
});

export default compraSlice.reducer;
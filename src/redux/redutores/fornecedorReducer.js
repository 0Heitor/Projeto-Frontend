import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
const API_URL = import.meta.env.VITE_API_URL;
let urlBaseConsulta = API_URL+'/api/fornecedores/consulta';
let urlBase = API_URL+'/api/fornecedores';

export const buscarFornecedores = createAsyncThunk('fornecedores/buscarFornecedores', async (fornecedor) => {
    try{
        const resposta = await fetch(urlBaseConsulta, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fornecedor)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o fornecedor:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaFornecedores: dados.listaFornecedores,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o fornecedor.',
                listaFornecedores: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar os fornecedores da base de dados:' + erro.message,
            listaFornecedores: [],
            totalRegistros: 0
        }
    }
});

export const adicionarFornecedor = createAsyncThunk('fornecedores/adicionar', async (fornecedor) => {
    const resposta = await fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(fornecedor)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar o fornecedor:' + erro.message
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            fornecedor
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar o fornecedor.',
            fornecedor
        }
    }
});

export const atualizarFornecedor = createAsyncThunk('fornecedores/atualizar', async (fornecedor) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(fornecedor)
    }).catch(erro => {
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o fornecedor:' + erro.message
        }
    });
    if (resposta.ok) {
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            fornecedor
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o fornecedor.',
            fornecedor
        }
    }
});

export const removerFornecedor = createAsyncThunk('fornecedores/remover', async (fornecedor) => {
    const resposta = await fetch(urlBase, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(fornecedor)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover o fornecedor:' + erro.message,
            fornecedor
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return{
            status: dados.status,
            mensagem: dados.mensagem,
            fornecedor
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover o fornecedor.',
            fornecedor
        }
    }
});


const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    fornecedores: [],
    totalRegistros: 0,
};

const fornecedorSlice = createSlice({
    name: 'fornecedor',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(buscarFornecedores.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Buscando fornecedores...";
        })
        .addCase(buscarFornecedores.fulfilled, (state, action) => {
            if (action.payload.status) {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.fornecedores = action.payload.listaFornecedores;
                state.totalRegistros = action.payload.totalRegistros;
            } else {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.payload.mensagem;
            }
        })
        .addCase(buscarFornecedores.rejected, (state, action) => {
            state.estado = ESTADO.ERRO;
            state.mensagem = action.error.message;
        })
        .addCase(adicionarFornecedor.fulfilled, (state, action) => {
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
        })
        .addCase(atualizarFornecedor.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            const indice = state.fornecedores.findIndex(fornecedor => fornecedor.id === action.payload.fornecedor.id);
            state.fornecedores[indice] = action.payload.fornecedor;
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(atualizarFornecedor.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Atualizando fornecedor...";
        })
        .addCase(atualizarFornecedor.rejected, (state, action) => {
            state.mensagem = "Erro ao atualizar o fornecedor: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(removerFornecedor.fulfilled, (state, action) => {
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
        })
    }
});

export default fornecedorSlice.reducer;
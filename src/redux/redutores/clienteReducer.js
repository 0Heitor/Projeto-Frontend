import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
const API_URL = import.meta.env.VITE_API_URL;
let urlBaseConsulta = API_URL+'/api/clientes/consulta';
let urlBase = API_URL+'/api/clientes';

export const buscarClientes = createAsyncThunk('clientes/buscarClientes', async (cliente) => {
    try{
        const resposta = await fetch(urlBaseConsulta, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o cliente:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaClientes: dados.listaClientes,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o cliente.',
                listaClientes: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar os clientes da base de dados:' + erro.message,
            listaClientes: [],
            totalRegistros: 0
        }
    }
});

export const adicionarCliente = createAsyncThunk('clientes/adicionar', async (cliente) => {
    const resposta = await fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cliente)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar o cliente:' + erro.message
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            cliente
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar o cliente.',
            cliente
        }
    }
});

export const atualizarCliente = createAsyncThunk('clientes/atualizar', async (cliente) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cliente)
    }).catch(erro => {
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o cliente:' + erro.message
        }
    });
    if (resposta.ok) {
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            cliente
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o cliente.',
            cliente
        }
    }
});

export const removerCliente = createAsyncThunk('clientes/remover', async (cliente) => {
    const resposta = await fetch(urlBase, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cliente)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover o cliente:' + erro.message,
            cliente
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return{
            status: dados.status,
            mensagem: dados.mensagem,
            cliente
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover o cliente.',
            cliente
        }
    }
});


const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    clientes: [],
    totalRegistros: 0,
};

const clienteSlice = createSlice({
    name: 'cliente',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(buscarClientes.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Buscando clientes...";
        })
        .addCase(buscarClientes.fulfilled, (state, action) => {
            if (action.payload.status) {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.clientes = action.payload.listaClientes;
                state.totalRegistros = action.payload.totalRegistros;
            } else {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.payload.mensagem;
            }
        })
        .addCase(buscarClientes.rejected, (state, action) => {
            state.estado = ESTADO.ERRO;
            state.mensagem = action.error.message;
        })
        .addCase(adicionarCliente.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.clientes.push(action.payload.cliente);
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(adicionarCliente.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Adicionando cliente...";
        })
        .addCase(adicionarCliente.rejected, (state, action) => {
            state.mensagem = "Erro ao adicionar o cliente: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(atualizarCliente.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            const indice = state.clientes.findIndex(cliente => cliente.id === action.payload.cliente.id);
            state.clientes[indice] = action.payload.cliente;
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(atualizarCliente.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Atualizando cliente...";
        })
        .addCase(atualizarCliente.rejected, (state, action) => {
            state.mensagem = "Erro ao atualizar o cliente: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(removerCliente.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.mensagem = action.payload.mensagem;
            state.clientes = state.clientes.filter(cliente => cliente.id !== action.payload.cliente.id);
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(removerCliente.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Removendo cliente...";
        })
        .addCase(removerCliente.rejected, (state, action) => {
            state.mensagem = "Erro ao remover o cliente: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
    }
});

export default clienteSlice.reducer;
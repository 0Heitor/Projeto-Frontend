import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
const API_URL = import.meta.env.VITE_API_URL;
let urlBaseConsulta = API_URL+'/api/produtos/consulta';
let urlBase = API_URL+'/api/produtos';

export const buscarProdutos = createAsyncThunk('produtos/buscarProdutos', async (produto) => {
    try{
        const resposta = await fetch(urlBaseConsulta, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(produto)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o produto:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaProdutos: dados.listaProdutos,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o produto.',
                listaProdutos: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar os produtos da base de dados:' + erro.message,
            listaProdutos: [],
            totalRegistros: 0
        }
    }
});

export const adicionarProduto = createAsyncThunk('produtos/adicionar', async (produto) => {
    const resposta = await fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar o produto:' + erro.message
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            produto
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar o produto.',
            produto
        }
    }
});

export const atualizarProduto = createAsyncThunk('produtos/atualizar', async (produto) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
    }).catch(erro => {
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o produto:' + erro.message
        }
    });
    if (resposta.ok) {
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            produto
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o produto.',
            produto
        }
    }
});

export const removerProduto = createAsyncThunk('produtos/remover', async (produto) => {
    const resposta = await fetch(urlBase, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(produto)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover o produto:' + erro.message,
            produto
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return{
            status: dados.status,
            mensagem: dados.mensagem,
            produto
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover o produto.',
            produto
        }
    }
});

const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    produtos: [],
    totalRegistros: 0,
};

const produtoSlice = createSlice({
    name: 'produto',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(buscarProdutos.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Buscando produtos...";
        })
        .addCase(buscarProdutos.fulfilled, (state, action) => {
            if (action.payload.status) {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.produtos = action.payload.listaProdutos;
                state.totalRegistros = action.payload.totalRegistros;
            } else {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.payload.mensagem;
            }
        })
        .addCase(buscarProdutos.rejected, (state, action) => {
            state.estado = ESTADO.ERRO;
            state.mensagem = action.error.message;
        })
        .addCase(adicionarProduto.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.produtos.push(action.payload.produto);
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(adicionarProduto.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Adicionando produto...";
        })
        .addCase(adicionarProduto.rejected, (state, action) => {
            state.mensagem = "Erro ao adicionar o produto: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(atualizarProduto.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            const indice = state.produtos.findIndex(produto => produto.id === action.payload.produto.id);
            state.produtos[indice] = action.payload.produto;
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(atualizarProduto.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Atualizando produto...";
        })
        .addCase(atualizarProduto.rejected, (state, action) => {
            state.mensagem = "Erro ao atualizar o produto: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(removerProduto.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.mensagem = action.payload.mensagem;
            state.produtos = state.produtos.filter(produto => produto.id !== action.payload.produto.id);
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(removerProduto.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Removendo produto...";
        })
        .addCase(removerProduto.rejected, (state, action) => {
            state.mensagem = "Erro ao remover o produto: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
    }
});

export default produtoSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
const API_URL = import.meta.env.VITE_API_URL;
let urlBaseConsulta = API_URL+'/api/categorias/subgrupo/consulta';
let urlBase = API_URL+'/api/categorias/subgrupo';

export const buscarCategoriasSubGrupo = createAsyncThunk('categorias/subgrupo/buscar', async (categoria) => {
    try{
        const resposta = await fetch(urlBaseConsulta, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoria)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a categoria do subgrupo:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaCategoriasSubGrupo: dados.listaCategoriasSubGrupo,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a categoria do subgrupo.',
                listaCategoriasSubGrupo: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar as categorias do subgrupo da base de dados:' + erro.message,
            listaCategoriasSubGrupo: [],
            totalRegistros: 0
        }
    }
});

export const adicionarCategoriasSubGrupo = createAsyncThunk('categorias/subgrupo/adicionar', async (categoria) => {
    const resposta = await fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoria)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar a categoria do subgrupo:' + erro.message
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            categoria
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar a categoria do subgrupo.',
            categoria
        }
    }
});

export const atualizarCategoriasSubGrupo = createAsyncThunk('categorias/subgrupo/atualizar', async (categoria) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoria)
    }).catch(erro => {
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar a categoria do subgrupo:' + erro.message
        }
    });
    if (resposta.ok) {
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            categoria
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar a categoria do subgrupo.',
            categoria
        }
    }
});

export const removerCategoriasSubGrupo = createAsyncThunk('categorias/subgrupo/remover', async (categoria) => {
    const resposta = await fetch(urlBase, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoria)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover a categoria do subgrupo:' + erro.message,
            categoria
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return{
            status: dados.status,
            mensagem: dados.mensagem,
            categoria
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover a categoria do subgrupo.',
            categoria
        }
    }
});


const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    categoriasubgrupo: [],
    totalRegistros: 0,
};

const categoriaSubGrupoSlice = createSlice({
    name: 'categoriaSubGrupo',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(buscarCategoriasSubGrupo.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Buscando categorias de subgrupo...";
        })
        .addCase(buscarCategoriasSubGrupo.fulfilled, (state, action) => {
            if (action.payload.status) {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.categoriasubgrupo = action.payload.listaCategoriasSubGrupo;
                state.totalRegistros = action.payload.totalRegistros;
            } else {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.payload.mensagem;
            }
        })
        .addCase(buscarCategoriasSubGrupo.rejected, (state, action) => {
            state.estado = ESTADO.ERRO;
            state.mensagem = action.error.message;
        })
        .addCase(adicionarCategoriasSubGrupo.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.categoriasubgrupo.push(action.payload.categoria);
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(adicionarCategoriasSubGrupo.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Adicionando categoria do subgrupo...";
        })
        .addCase(adicionarCategoriasSubGrupo.rejected, (state, action) => {
            state.mensagem = "Erro ao adicionar a categoria do subgrupo: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(atualizarCategoriasSubGrupo.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            const indice = state.categoriasubgrupo.findIndex(categoria => categoria.id === action.payload.categoria.id);
            state.categoriasubgrupo[indice] = action.payload.categoria;
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(atualizarCategoriasSubGrupo.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Atualizando categoria do subgrupo...";
        })
        .addCase(atualizarCategoriasSubGrupo.rejected, (state, action) => {
            state.mensagem = "Erro ao atualizar a categoria do subgrupo: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(removerCategoriasSubGrupo.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.mensagem = action.payload.mensagem;
            state.categoriasubgrupo = state.categoriasubgrupo.filter(categoria => categoria.id !== action.payload.categoria.id);
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(removerCategoriasSubGrupo.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Removendo categoria do subgrupo...";
        })
        .addCase(removerCategoriasSubGrupo.rejected, (state, action) => {
            state.mensagem = "Erro ao remover a categoria do subgrupo: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
    }
});

export default categoriaSubGrupoSlice.reducer;
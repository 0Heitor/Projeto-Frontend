import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
const API_URL = import.meta.env.VITE_API_URL;
let urlBaseConsulta = API_URL+'/api/categorias/grupo/consulta';
let urlBase = API_URL+'/api/categorias/grupo';

export const buscarCategoriasGrupo = createAsyncThunk('categorias/grupo/buscar', async (categoria) => {
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
                mensagem: 'Ocorreu um erro ao buscar a categoria do grupo:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaCategoriasGrupo: dados.listaCategoriasGrupo,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a categoria do grupo.',
                listaCategoriasGrupo: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar as categorias do grupo da base de dados:' + erro.message,
            listaCategoriasGrupo: [],
            totalRegistros: 0
        }
    }
});

export const adicionarCategoriasGrupo = createAsyncThunk('categorias/grupo/adicionar', async (categoria) => {
    const resposta = await fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoria)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar a categoria do grupo:' + erro.message
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
            mensagem: 'Ocorreu um erro ao adicionar a categoria do grupo.',
            categoria
        }
    }
});

export const atualizarCategoriasGrupo = createAsyncThunk('categorias/grupo/atualizar', async (categoria) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoria)
    }).catch(erro => {
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar a categoria do grupo:' + erro.message
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
            mensagem: 'Ocorreu um erro ao atualizar a categoria do grupo.',
            categoria
        }
    }
});

export const removerCategoriasGrupo = createAsyncThunk('categorias/grupo/remover', async (categoria) => {
    const resposta = await fetch(urlBase, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoria)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover a categoria do grupo:' + erro.message,
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
            mensagem: 'Ocorreu um erro ao remover a categoria do grupo.',
            categoria
        }
    }
});


const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    categoriasgrupo: [],
    totalRegistros: 0,
};

const categoriaGrupoSlice = createSlice({
    name: 'categoriaGrupo',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(buscarCategoriasGrupo.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Buscando categorias de grupo...";
        })
        .addCase(buscarCategoriasGrupo.fulfilled, (state, action) => {
            if (action.payload.status) {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.categoriasgrupo = action.payload.listaCategoriasGrupo;
                state.totalRegistros = action.payload.totalRegistros;
            } else {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.payload.mensagem;
            }
        })
        .addCase(buscarCategoriasGrupo.rejected, (state, action) => {
            state.estado = ESTADO.ERRO;
            state.mensagem = action.error.message;
        })
        .addCase(adicionarCategoriasGrupo.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.categoriasgrupo.push(action.payload.categoria);
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(adicionarCategoriasGrupo.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Adicionando categoria do grupo...";
        })
        .addCase(adicionarCategoriasGrupo.rejected, (state, action) => {
            state.mensagem = "Erro ao adicionar a categoria do grupo: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(atualizarCategoriasGrupo.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            const indice = state.categoriasgrupo.findIndex(categoria => categoria.id === action.payload.categoria.id);
            state.categoriasgrupo[indice] = action.payload.categoria;
            state.mensagem = action.payload.mensagem;
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(atualizarCategoriasGrupo.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Atualizando categoria do grupo...";
        })
        .addCase(atualizarCategoriasGrupo.rejected, (state, action) => {
            state.mensagem = "Erro ao atualizar a categoria do grupo: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
        .addCase(removerCategoriasGrupo.fulfilled, (state, action) => {
            state.estado = ESTADO.OCIOSO;
            state.mensagem = action.payload.mensagem;
            state.categoriasgrupo = state.categoriasgrupo.filter(categoria => categoria.id !== action.payload.categoria.id);
            state.totalRegistros = action.payload.totalRegistros;
        })
        .addCase(removerCategoriasGrupo.pending, (state, action) => {
            state.estado = ESTADO.PENDENTE;
            state.mensagem = "Removendo categoria do grupo...";
        })
        .addCase(removerCategoriasGrupo.rejected, (state, action) => {
            state.mensagem = "Erro ao remover a categoria do grupo: " + action.error.message;
            state.estado = ESTADO.ERRO;
        })
    }
});

export default categoriaGrupoSlice.reducer;
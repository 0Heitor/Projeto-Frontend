import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
const API_URL = import.meta.env.VITE_API_URL;
let urlBaseConsulta = API_URL+'/api/cacambas/tipos/consulta';
let urlBase = API_URL+'/api/cacambas/tipos';

export const buscarTiposCacambas = createAsyncThunk('cacambas/tipos/buscarTiposCacambas', async (tipocacamba) => {
    try{
        const resposta = await fetch(urlBaseConsulta, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tipocacamba)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o tipo de caçamba:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaTiposCacambas: dados.listaTiposCacambas,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o tipo de caçamba.',
                listaTiposCacambas: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar os tipos de caçambas da base de dados:' + erro.message,
            listaTiposCacambas: [],
            totalRegistros: 0
        }
    }
});

export const adicionarTipoCacamba = createAsyncThunk('cacambas/tipos/adicionar', async (tipocacamba) => {
    const resposta = await fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tipocacamba)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar o tipo de caçamba:' + erro.message
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            tipocacamba
        };
    }
    else{
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar o tipo de caçamba.',
            tipocacamba
        };
    }
});

export const atualizarTipoCacamba = createAsyncThunk('cacambas/tipos/atualizar', async (tipocacamba) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tipocacamba)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o tipo de caçamba:' + erro.message
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            tipocacamba
        };
    }
    else{
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o tipo de caçamba.',
            tipocacamba
        };
    }
});

export const removerTipoCacamba = createAsyncThunk('cacambas/tipos/remover', async (tipocacamba) => {
    const resposta = await fetch(urlBase, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tipocacamba)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover o tipo de caçamba:' + erro.message,
            tipocacamba
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return{
            status: dados.status,
            mensagem: dados.mensagem,
            tipocacamba
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover o tipo de caçamba.',
            tipocacamba
        }
    }
});

const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    tipocacambas: [],
    totalRegistros: 0,
};

const tipocacambaSlice = createSlice({
    name: 'tipocacamba',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(buscarTiposCacambas.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Buscando tipos de caçambas...";
            })
            .addCase(buscarTiposCacambas.fulfilled, (state, action) => {
                if (action.payload.status) {
                    state.estado = ESTADO.OCIOSO;
                    state.mensagem = action.payload.mensagem;
                    state.tipocacambas = action.payload.listaTiposCacambas;
                    state.totalRegistros = action.payload.totalRegistros;
                } else {
                    state.estado = ESTADO.ERRO;
                    state.mensagem = action.payload.mensagem;
                }
            })
            .addCase(buscarTiposCacambas.rejected, (state, action) => {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.error.message;
            })
            .addCase(adicionarTipoCacamba.fulfilled, (state, action) => {
                state.estado = ESTADO.OCIOSO;
                state.tipocacambas.push(action.payload.tipocacamba);
                state.mensagem = action.payload.mensagem;
                state.totalRegistros = action.payload.totalRegistros;
            })
            .addCase(adicionarTipoCacamba.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Adicionando tipo de caçamba...";
            })
            .addCase(adicionarTipoCacamba.rejected, (state, action) => {
                state.mensagem = "Erro ao adicionar o tipo de caçamba: " + action.error.message;
                state.estado = ESTADO.ERRO;
            })
            .addCase(atualizarTipoCacamba.fulfilled, (state, action) => {
                state.estado = ESTADO.OCIOSO;
                const indice = state.tipocacambas.findIndex(tipocacamba => tipocacamba.id === action.payload.tipocacamba.id);
                state.tipocacambas[indice] = action.payload.tipocacamba;
                state.mensagem = action.payload.mensagem;
                state.totalRegistros = action.payload.totalRegistros;
            })
            .addCase(atualizarTipoCacamba.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Atualizando tipo de caçamba...";
            })
            .addCase(atualizarTipoCacamba.rejected, (state, action) => {
                state.mensagem = "Erro ao atualizar o tipo de caçamba: " + action.error.message;
                state.estado = ESTADO.ERRO;
            })
            .addCase(removerTipoCacamba.fulfilled, (state, action) => {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.tipocacambas = state.tipocacambas.filter(tipocacamba => tipocacamba.id !== action.payload.tipocacamba.id);
                state.totalRegistros = action.payload.totalRegistros;
            })
            .addCase(removerTipoCacamba.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Removendo tipo de caçamba...";
            })
            .addCase(removerTipoCacamba.rejected, (state, action) => {
                state.mensagem = "Erro ao remover o tipo de caçamba: " + action.error.message;
                state.estado = ESTADO.ERRO;
            })
    }
});

export default tipocacambaSlice.reducer;
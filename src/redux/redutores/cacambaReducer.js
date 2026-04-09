import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
import.meta.env.VITE_API_URL;
let urlBaseConsulta = VITE_API_URL+'/api/cacambas/consulta';
let urlBase = VITE_API_URL+'/api/cacambas';

export const buscarCacambas = createAsyncThunk('cacambas/buscarCacambas', async (cacamba) => {
    try{
        const resposta = await fetch(urlBaseConsulta, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cacamba)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a caçamba:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaCacambas: dados.listaCacambas,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar a caçamba.',
                listaCacambas: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar as caçambas da base de dados:' + erro.message,
            listaCacambas: [],
            totalRegistros: 0
        }
    }
});

export const adicionarCacamba = createAsyncThunk('cacambas/adicionar', async (cacamba) => {
    const resposta = await fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cacamba)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar a caçamba:' + erro.message
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            cacamba
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar a caçamba.',
            usuario
        }
    }
});

export const atualizarCacamba = createAsyncThunk('cacamba/atualizar', async (cacamba) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cacamba)
    }).catch(erro => {
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar a caçamba:' + erro.message
        }
    });
    if (resposta.ok) {
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            cacamba
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o caçamba.',
            cacamba
        }
    }
});

export const removerCacamba = createAsyncThunk('cacambas/remover', async (cacamba) => {
    const resposta = await fetch(urlBase, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cacamba)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover a caçamba:' + erro.message,
            cacamba
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return{
            status: dados.status,
            mensagem: dados.mensagem,
            cacamba
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover a caçamba.',
            cacamba
        }
    }
});

const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    cacambas: [],
    totalRegistros: 0,
};

const cacambaSlice = createSlice({
    name: 'cacamba',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(buscarCacambas.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Buscando caçambas...";
            })
            .addCase(buscarCacambas.fulfilled, (state, action) => {
                if (action.payload.status) {
                    state.estado = ESTADO.OCIOSO;
                    state.mensagem = action.payload.mensagem;
                    state.cacambas = action.payload.listaCacambas;
                    state.totalRegistros = action.payload.totalRegistros;
                } else {
                    state.estado = ESTADO.ERRO;
                    state.mensagem = action.payload.mensagem;
                }
            })
            .addCase(buscarCacambas.rejected, (state, action) => {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.error.message;
            })
            .addCase(adicionarCacamba.fulfilled, (state, action) => {
                state.estado = ESTADO.OCIOSO;
                state.cacambas.push(action.payload.cacamba);
                state.mensagem = action.payload.mensagem;
                state.totalRegistros = action.payload.totalRegistros;
            })
            .addCase(adicionarCacamba.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Adicionando caçamba...";
            })
            .addCase(adicionarCacamba.rejected, (state, action) => {
                state.mensagem = "Erro ao adicionar a caçamba: " + action.error.message;
                state.estado = ESTADO.ERRO;
            })
            .addCase(atualizarCacamba.fulfilled, (state, action) => {
                state.estado = ESTADO.OCIOSO;
                const indice = state.cacambas.findIndex(cacamba => cacamba.id === action.payload.cacamba.id);
                state.cacambas[indice] = action.payload.cacamba;
                state.mensagem = action.payload.mensagem;
                state.totalRegistros = action.payload.totalRegistros;
            })
            .addCase(atualizarCacamba.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Atualizando caçamba...";
            })
            .addCase(atualizarCacamba.rejected, (state, action) => {
                state.mensagem = "Erro ao atualizar a caçamba: " + action.error.message;
                state.estado = ESTADO.ERRO;
            })
            .addCase(removerCacamba.fulfilled, (state, action) => {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.cacambas = state.cacambas.filter(cacamba => cacamba.id !== action.payload.cacamba.id);
                state.totalRegistros = action.payload.totalRegistros;
            })
            .addCase(removerCacamba.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Removendo caçamba...";
            })
            .addCase(removerCacamba.rejected, (state, action) => {
                state.mensagem = "Erro ao remover a caçamba: " + action.error.message;
                state.estado = ESTADO.ERRO;
            })
    }
});

export default cacambaSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import ESTADO from '../../recursos/estado';
const API_URL = import.meta.env.VITE_API_URL;
let urlBaseConsulta = API_URL+'/api/usuarios/consulta';
let urlBase = API_URL+'/api/usuarios';

export const buscarUsuarios = createAsyncThunk('usuarios/buscarUsuarios', async (usuario) => {
    try{
        const resposta = await fetch(urlBaseConsulta, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o usuario:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaUsuarios: dados.listaUsuarios,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o usuario.',
                listaUsuarios: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar os usuarios da base de dados:' + erro.message,
            listaUsuarios: [],
            totalRegistros: 0
        }
    }
});

export const buscarUsuariosEmail = createAsyncThunk('usuarios/buscarUsuariosEmail', async (usuario) => {
    try{
        // urlBaseConsulta += "?email="+usuario.email+"&senha="+usuario.senha+"&consulta="+usuario.consulta
        const resposta = await fetch(urlBaseConsulta+"Email", { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o email do usuario:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                listaUsuarios: dados.listaUsuarios,
                totalRegistros: dados.totalRegistros
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao buscar o email do usuario.',
                listaUsuarios: [],
                totalRegistros: 0
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao recuperar emails dos usuarios da base de dados:' + erro.message,
            listaUsuarios: [],
            totalRegistros: 0
        }
    }
});


export const enviarCodigoRecuperacao = createAsyncThunk('usuarios/enviarCodigoRecuperacao', async (usuario) => {
    try{
        const resposta = await fetch(urlBase + '/recuperar-senha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao enviar o código de recuperação:' + erro.message
            }
        });
        if(resposta.ok){
            const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem
            }
        }
        else{
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao enviar o código de recuperação.'
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao enviar o código de recuperação:' + erro.message
        }
    }
});

export const validarCodigoRecuperacao = createAsyncThunk('usuarios/validarCodigoRecuperacao', async (usuario) => {
    try{
        const resposta = await fetch(urlBase + '/validar-codigo-recuperacao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        }).catch(erro => {
            return{
                status: false,
                mensagem: 'Ocorreu um erro ao validar o código de recuperação:' + erro.message
            }
        });
        const dados = await resposta.json();
        if(resposta.ok){
            //const dados = await resposta.json();
            return{
                status: dados.status,
                mensagem: dados.mensagem,
                tentativas_restantes: dados.tentativas_restantes
            }
        }
        else{
            return{
                status: false,
                mensagem: dados.mensagem,
                tentativas_restantes: dados.tentativas_restantes
            }
        }
    } 
    catch(erro){
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao validar o código de recuperação:' + erro.message
        }
    }
});

export const adicionarUsuario = createAsyncThunk('usuarios/adicionar', async (usuario) => {
    const resposta = await fetch(urlBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar o usuario:' + erro.message
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            usuario
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao adicionar o usuario.',
            usuario
        }
    }
});

export const atualizarUsuario = createAsyncThunk('usuario/atualizar', async (usuario) => {
    const resposta = await fetch(urlBase, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
    }).catch(erro => {
        return {
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o usuario:' + erro.message
        }
    });
    if (resposta.ok) {
        const dados = await resposta.json();
        return {
            status: dados.status,
            mensagem: dados.mensagem,
            usuario
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao atualizar o usuario.',
            usuario
        }
    }
});

export const removerUsuario = createAsyncThunk('usuarios/remover', async (usuario) => {
    const resposta = await fetch(urlBase, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
    }).catch(erro => {
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover o usuario:' + erro.message,
            usuario
        }
    });
    if(resposta.ok){
        const dados = await resposta.json();
        return{
            status: dados.status,
            mensagem: dados.mensagem,
            usuario
        }
    }
    else{
        return{
            status: false,
            mensagem: 'Ocorreu um erro ao remover o usuario.',
            usuario
        }
    }
});

const initialState = {
    estado: ESTADO.OCIOSO,
    mensagem: "",
    usuarios: [],
    totalRegistros: 0,
    tentativas_restantes: 5,
};

const usuarioSlice = createSlice({
    name: 'usuario',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(buscarUsuarios.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Buscando usuarios...";
            })
            .addCase(buscarUsuarios.fulfilled, (state, action) => {
                if (action.payload.status) {
                    state.estado = ESTADO.OCIOSO;
                    state.mensagem = action.payload.mensagem;
                    state.usuarios = action.payload.listaUsuarios;
                    state.totalRegistros = action.payload.totalRegistros;
                } else {
                    state.estado = ESTADO.ERRO;
                    state.mensagem = action.payload.mensagem;
                }
            })
            .addCase(buscarUsuarios.rejected, (state, action) => {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.error.message;
            })
            .addCase(buscarUsuariosEmail.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Buscando usuarios...";
            })
            .addCase(buscarUsuariosEmail.fulfilled, (state, action) => {
                if (action.payload.status) {
                    state.estado = ESTADO.OCIOSO;
                    state.mensagem = action.payload.mensagem;
                    state.usuarios = action.payload.listaUsuarios;
                    state.totalRegistros = action.payload.totalRegistros;
                } else {
                    state.estado = ESTADO.ERRO;
                    state.mensagem = action.payload.mensagem;
                }
            })
            .addCase(buscarUsuariosEmail.rejected, (state, action) => {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.error.message;
            })
            .addCase(enviarCodigoRecuperacao.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Enviando código de recuperação...";
            })
            .addCase(enviarCodigoRecuperacao.fulfilled, (state, action) => {
                if (action.payload.status) {
                    state.estado = ESTADO.OCIOSO;
                    state.mensagem = action.payload.mensagem;
                } else {
                    state.estado = ESTADO.ERRO;
                    state.mensagem = action.payload.mensagem;
                }
            })
            .addCase(enviarCodigoRecuperacao.rejected, (state, action) => {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.error.message;
            })
            .addCase(validarCodigoRecuperacao.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Validando código de recuperação...";
            })
            .addCase(validarCodigoRecuperacao.fulfilled, (state, action) => {
                if (action.payload.status) {
                    state.estado = ESTADO.OCIOSO;
                    state.mensagem = action.payload.mensagem;
                    state.tentativas_restantes = action.payload.tentativas_restantes;
                } else {
                    state.estado = ESTADO.ERRO;
                    state.mensagem = action.payload.mensagem;
                    state.tentativas_restantes = action.payload.tentativas_restantes;
                }
            })
            .addCase(validarCodigoRecuperacao.rejected, (state, action) => {
                state.estado = ESTADO.ERRO;
                state.mensagem = action.error.message;
            })
            .addCase(adicionarUsuario.fulfilled, (state, action) => {
                state.estado = ESTADO.OCIOSO;
                state.usuarios.push(action.payload.usuario);
                state.mensagem = action.payload.mensagem;
                state.totalRegistros = action.payload.totalRegistros;
            })
            .addCase(adicionarUsuario.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Adicionando usuario...";
            })
            .addCase(adicionarUsuario.rejected, (state, action) => {
                state.mensagem = "Erro ao adicionar o usuario: " + action.error.message;
                state.estado = ESTADO.ERRO;
            })
            .addCase(atualizarUsuario.fulfilled, (state, action) => {
                state.estado = ESTADO.OCIOSO;
                const indice = state.usuarios.findIndex(usuario => usuario.id === action.payload.usuario.id);
                state.usuarios[indice] = action.payload.usuario;
                state.mensagem = action.payload.mensagem;
                state.totalRegistros = action.payload.totalRegistros;
            })
            .addCase(atualizarUsuario.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Atualizando usuario...";
            })
            .addCase(atualizarUsuario.rejected, (state, action) => {
                state.mensagem = "Erro ao atualizar o usuario: " + action.error.message;
                state.estado = ESTADO.ERRO;
            })
            .addCase(removerUsuario.fulfilled, (state, action) => {
                state.estado = ESTADO.OCIOSO;
                state.mensagem = action.payload.mensagem;
                state.usuarios = state.usuarios.filter(usuario => usuario.id !== action.payload.usuario.id);
                state.totalRegistros = action.payload.totalRegistros;
            })
            .addCase(removerUsuario.pending, (state, action) => {
                state.estado = ESTADO.PENDENTE;
                state.mensagem = "Removendo usuario...";
            })
            .addCase(removerUsuario.rejected, (state, action) => {
                state.mensagem = "Erro ao remover o usuario: " + action.error.message;
                state.estado = ESTADO.ERRO;
            })
    }
});

export default usuarioSlice.reducer;
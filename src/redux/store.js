import {configureStore} from '@reduxjs/toolkit';
//import clienteSlice from './clienteReducer.js';
//import produtoSlice from './produtoReducer.js';
//import fornecedorSlice from './fornecedorReducer.js';
import usuarioSlice from './redutores/usuarioReducer.js';
import cacambaSlice from './redutores/cacambaReducer.js';

const store = configureStore({
    reducer:{
        usuario: usuarioSlice,
        cacamba: cacambaSlice/*,
        cliente: clienteSlice,
        produto: produtoSlice,
        fornecedor: fornecedorSlice,*/
    }
});

export default store;
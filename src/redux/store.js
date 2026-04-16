import {configureStore} from '@reduxjs/toolkit';
//import clienteSlice from './clienteReducer.js';
//import produtoSlice from './produtoReducer.js';
//import fornecedorSlice from './fornecedorReducer.js';
import usuarioSlice from './redutores/usuarioReducer.js';
import cacambaSlice from './redutores/cacambaReducer.js';
import tipocacambaSlice from './redutores/tipocacambaReducer.js';

const store = configureStore({
    reducer:{
        usuario: usuarioSlice,
        cacamba: cacambaSlice,
        tipocacamba: tipocacambaSlice/*,
        cliente: clienteSlice,
        produto: produtoSlice,
        fornecedor: fornecedorSlice,*/
    }
});

export default store;
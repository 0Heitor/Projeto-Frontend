import {configureStore} from '@reduxjs/toolkit';
import clienteSlice from './redutores/clienteReducer.js';
import produtoSlice from './redutores/produtoReducer.js';
import fornecedorSlice from './redutores/fornecedorReducer.js';
import categoriaGrupoSlice from './redutores/categoriagrupoReducer.js';
import categoriaSubGrupoSlice from './redutores/categoriasubgrupoReducer.js';
import compraSlice from './redutores/compraReducer.js';
import vendaSlice from './redutores/vendaReducer.js';
import locacaoSlice from './redutores/locacaoReducer.js';
import usuarioSlice from './redutores/usuarioReducer.js';
import cacambaSlice from './redutores/cacambaReducer.js';
import tipocacambaSlice from './redutores/tipocacambaReducer.js';
import financeiroSlice from './redutores/financeiroReducer.js';

const store = configureStore({
    reducer:{
        usuario: usuarioSlice,
        cacamba: cacambaSlice,
        tipocacamba: tipocacambaSlice,
        cliente: clienteSlice,
        produto: produtoSlice,
        fornecedor: fornecedorSlice,
        categoriagrupo: categoriaGrupoSlice,
        categoriasubgrupo: categoriaSubGrupoSlice,
        compra: compraSlice,
        venda: vendaSlice,
        locacao: locacaoSlice,
        financeiro: financeiroSlice,
    }
});

export default store;
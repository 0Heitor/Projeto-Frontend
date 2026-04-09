//import TelaCadastroCliente from "./telasCadastro/TelaCadastroCliente";
//import TelaCadastroProduto from "./telasCadastro/TelaCadastroProduto";
//import TelaCadastroFornecedor from "./telasCadastro/TelaCadastroFornecedor";
//import TelaCadastroCategoria from "./telasCadastro/TelaCadastroCategoria";
//import TelaCadastroCategoriaGrupo from "./telasCadastro/TelaCadastroCategoriaGrupo";
//import TelaCadastroCategoriaSubGrupo from "./telasCadastro/TelaCadastroCategoriaSubGrupo";
import TelaCadastroCacamba from "./telasCadastro/TelaCadastroCacamba";
import TelaCadastroUsuario from './telasCadastro/TelaCadastroUsuario.jsx';
import TelaMenu from './telasCadastro/TelaMenu.jsx';
import Tela404 from './telasCadastro/Tela404.jsx';
import store from "./redux/store";
import { Provider } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {BrowserRouter, Routes, Route} from 'react-router-dom';

import 'react-toastify/dist/ReactToastify.css';
//import { Button } from 'react-bootstrap';

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            {
            /*
            <Route path="/Sistema/produtos" element={<TelaCadastroProduto/>} /> 
            <Route path="/Sistema/clientes" element={<TelaCadastroCliente/>} />
            <Route path="/Sistema/fornecedores" element={<TelaCadastroFornecedor/>} />
            <Route path="/Sistema/categorias/grupo" element={<TelaCadastroFornecedor/>}
            <Route path="/Sistema/categorias/sub/grupo" element={<TelaCadastroFornecedor/>}
            */}
            <Route path="/Sistema/usuarios" element={<TelaCadastroUsuario/>} />
            <Route path="/Sistema/cacambas" element={<TelaCadastroCacamba/>} />
            <Route path="/Sistema" element={<TelaMenu/>} />
            <Route path="*" element={<Tela404/>} />
          </Routes>
        </BrowserRouter>
      </Provider>
      <ToastContainer/>
    </div>
  );
}

export default App;
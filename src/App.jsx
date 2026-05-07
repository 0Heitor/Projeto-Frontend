//import TelaCadastroProduto from "./telasCadastro/TelaCadastroProduto";
import TelaCadastroCliente from "./telasCadastro/TelaCadastroCliente";
import TelaCadastroFornecedor from "./telasCadastro/TelaCadastroFornecedor";
import TelaCadastroCategoriaGrupo from "./telasCadastro/TelaCadastroCategoriaGrupo";
import TelaCadastroCategoriaSubGrupo from "./telasCadastro/TelaCadastroCategoriaSubGrupo";
import TelaCadastroCacamba from "./telasCadastro/TelaCadastroCacamba";
import TelaCadastroTipoCacamba from "./telasCadastro/TelaCadastroTipoCacamba";
import TelaCadastroUsuario from './telasCadastro/TelaCadastroUsuario.jsx';
import TelaMenu from './telasCadastro/TelaMenu.jsx';
import TelaLogin from './telasCadastro/TelaLogin.jsx';
import Tela404 from './telasCadastro/Tela404.jsx';
import store from "./redux/store";
import { Provider } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexto/AuthContext';

import 'react-toastify/dist/ReactToastify.css';
//import { Button } from 'react-bootstrap';

function PrivateRoute({ children }) {
    const { isLogged } = useAuth();
    return isLogged ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <div className="App">
      <AuthProvider></AuthProvider>
        <Provider store={store}>
          <BrowserRouter>
            <Routes>
              {
              /*

              <Route path="/Sistema/produtos" element={<TelaCadastroProduto/>} />
              */}
              
              <Route path="/login" element={<TelaLogin />} />
              <Route path="*" element={<Navigate to="/login" />} />

              <Route path="/Sistema/usuarios" element={<PrivateRoute> <TelaCadastroUsuario/> </PrivateRoute> } />
              <Route path="/Sistema/fornecedores" element={<PrivateRoute> <TelaCadastroFornecedor/> </PrivateRoute> } />
              <Route path="/Sistema/clientes" element={<PrivateRoute> <TelaCadastroCliente/> </PrivateRoute> } />
              <Route path="/Sistema/cacambas" element={<PrivateRoute> <TelaCadastroCacamba/> </PrivateRoute>} />
              <Route path="/Sistema/tipos/cacambas" element={<PrivateRoute> <TelaCadastroTipoCacamba/> </PrivateRoute>} />
              <Route path="/Sistema/categorias/grupo" element={<PrivateRoute> <TelaCadastroCategoriaGrupo/> </PrivateRoute>} />
              <Route path="/Sistema/categorias/sub-grupo" element={<PrivateRoute> <TelaCadastroCategoriaSubGrupo/> </PrivateRoute>} />
              <Route path="/Sistema" element={<PrivateRoute> <TelaMenu/> </PrivateRoute>} />
              <Route path="/Sistema/*" element={<PrivateRoute> <Tela404/> </PrivateRoute>} />
            </Routes>
          </BrowserRouter>
        </Provider>
      
      <ToastContainer/>
    </div>
  );
}

export default App;
import Cabecalho from "./Cabecalho.jsx";
import Rodape from "./Rodape.jsx";
import Menu from "./Menu.jsx";

export default function Pagina(props) {
    return (
        <>
            <Cabecalho conteudo='Sistema de Gestão Comercial' />
            <Menu />
            <div>
                {
                    // filhos da página
                }
                {props.children} 
            </div>
            {/* <Rodape conteudo="Rua X, ? - Vila ? - Dracena/SP - CNPJ 00.000.000/0000-00"/> */}
        </>
    )
}
import { Container } from "react-bootstrap";
import Pagina from '../templates/Pagina.jsx';

export default function TelaMenu(props){
    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina/>
            </Container>
        </div>
    );
}
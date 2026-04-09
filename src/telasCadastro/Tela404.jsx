import { Container, Row, Col, Alert } from "react-bootstrap";
import Pagina from "../templates/Pagina";

export default function Tela404(props){
    return(
        <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' }}>
            <Container>
                <Pagina>
                    {/* <Alert variant="danger">
                        O sistema não oferece acesso a essa página.
                        Utilize o Menu para acessar as opções válidas. 
                    </Alert>  */}
                    <Row>
                        <Col>
                            <Alert variant="danger" className="text-center shadow-sm rounded-2">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                            O sistema não oferece acesso a essa página. Utilize as opções dos Módulos acima.
                            </Alert>
                        </Col>
                    </Row>
                </Pagina>
            </Container>
        </div>
    );
}
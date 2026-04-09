//Componente que deve receber uma propriedade conteúdo
import { Card, Alert } from "react-bootstrap";
export default function Cabecalho(props) {
    return (
        <Card className="shadow-sm border-0 mb-4 py-3 text-center">
          <Card.Body>
            <h2 className="text-primary mb-0"/*style={{ color: '#5e35b1', fontWeight: 'bold', margin: 0 }}*/>
              Sistema de Gestão Comercial
            </h2>
          </Card.Body>
        </Card>
    )
}
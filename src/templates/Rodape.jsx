import { Alert } from "react-bootstrap";

export default function Rodape(props){
    return (
        <footer>
            <div style={{
                            position:'absolute',
                            border:'1px solid black',
                            borderRadius:'5px',
                            padding:'5px',
                            margin:'3px',
                            width:'99%',
                            left:0,
                            bottom:0,
                        }}>
                <p>{props.conteudo||"Rodapé do sistema."}</p>
            </div>
        </footer>
    )
}
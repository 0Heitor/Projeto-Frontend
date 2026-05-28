import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner, Table, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { adicionarLocacao, atualizarLocacao } from '../../redux/redutores/locacaoReducer'; // Ajuste conforme seu reducer
import ModalSelecaoCliente from "../modais/ModalSelecaoCliente"; // Novo modal de Clientes
import ModalSelecaoCacamba from "../modais/ModalSelecaoCacamba"; // Novo modal de Caçambas
import ESTADO from '../../recursos/estado';

export default function FormCadLocacao(props) {
    const locacaoVazia = {
        id: '0',
        data_entrega: new Date().toISOString().split('T')[0],
        data_retirada_prevista: '',
        endereco_entrega: '',
        cliente: { id: '0', nome: '', cpf_cnpj: '' },
        itens: [], // Lista de caçambas alocadas nesta locação
        valor_total: 0,
        status: 'AGENDADA', // Status global da locação
        ativo: true,
    };

    const [locacao, setLocacao] = useState(props.locacaoParaEdicao || locacaoVazia);
    const [showModalCliente, setShowModalCliente] = useState(false);
    const [showModalCacamba, setShowModalCacamba] = useState(false);
    const [formValidado, setFormValidado] = useState(false);

    // Ajuste o seletor conforme o nome do seu slice no Redux store
    const { estado, mensagem } = useSelector((state) => state.locacao);
    const dispatch = useDispatch();

    function manipularMudancas(e) {
        const { name, value } = e.currentTarget;
        setLocacao({ ...locacao, [name]: value });
    }

    function adicionarItem(cacamba) {
        // Verifica se a caçamba já foi inserida na tabela atual
        if (locacao.itens.find(item => item.cacamba.id === cacamba.id)) {
            toast.warn("Esta caçamba já foi adicionada à lista!");
            return;
        }

        const novoItem = {
            cacamba: cacamba,
            quantidade: 1, 
            valor_unitario: 1, // Definido como 1 por padrão para servir como multiplicador, ou mude conforme sua regra
            status: 'AGENDADA', 
            ativo: true
        };

        setLocacao({ ...locacao, itens: [...locacao.itens, novoItem] });
        setShowModalCacamba(false);
    }

    function removerItem(index) {
        const novaLista = locacao.itens.filter((_, i) => i !== index);
        setLocacao({ ...locacao, itens: novaLista });
    }

    function atualizarDadosItem(index, campo, valor) {
        const novaLista = [...locacao.itens];
        novaLista[index] = { 
            ...novaLista[index], 
            [campo]: valor 
        };
        setLocacao({ ...locacao, itens: novaLista });
    }

    async function manipularSubmissao(e) {
        e.preventDefault();
        const form = e.currentTarget;

        if (locacao.cliente.id === '0' || locacao.itens.length === 0) {
            toast.error("Selecione um cliente e pelo menos uma caçamba!");
            setFormValidado(true);
            return;
        }

        if (form.checkValidity()) {
            if (!props.modoEdicao) {
                dispatch(adicionarLocacao(locacao));
            } else {
                dispatch(atualizarLocacao(locacao));
            }
            props.exibirFormulario(false);
        }
        setFormValidado(true);
    }

    // =========================================================================
    // ALTERAÇÃO AQUI: Calcula dinamicamente o valor total seguindo a nova regra
    // =========================================================================
    useEffect(() => {
        const total = locacao.itens.reduce((acc, item) => {
            const vlrUnitario = parseFloat(item.valor_unitario || 0);
            const precoTipo = parseFloat(item.cacamba?.tipoCacamba?.preco || 0);
            
            // Faz a mesma multiplicação da tabela para somar ao valor_total do estado
            return acc + (vlrUnitario * precoTipo);
        }, 0);
        
        setLocacao(prev => ({ ...prev, valor_total: total }));
    }, [locacao.itens]);

    useEffect(() => {
        if (estado === ESTADO.ERRO) {
            toast.error(mensagem, { toastId: "erro-cad-loc" });
        }
        else if (estado === ESTADO.PENDENTE) {
            toast.info("Processando...", { toastId: "pend-cad-loc", autoClose: false });
        }
        else {
            toast.dismiss("pend-cad-loc");
        }
    }, [estado, message => mensagem]);

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border">
            <h2 className="mb-4 text-primary border-bottom pb-2">
                {props.modoEdicao ? "Alterar Locação de Caçamba" : "Registrar Nova Locação"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                
                {/* SEÇÃO PRINCIPAL - FORA DA TABELA */}
                <Row className="mb-3 g-3">
                    <Col md={6}>
                        <FloatingLabel label="Cliente (Clique para Selecionar):">
                            <Form.Control
                                readOnly
                                placeholder="Selecione..."
                                value={locacao.cliente.nome ? `${locacao.cliente.nome} - ${locacao.cliente.cpf_cnpj}` : ""}
                                onClick={() => setShowModalCliente(true)}
                                style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                                required
                            />
                        </FloatingLabel>
                    </Col>

                    <Col md={3}>
                        <FloatingLabel label="Data de Entrega:">
                            <Form.Control
                                type="date"
                                name="data_entrega"
                                value={locacao.data_entrega}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col>

                    <Col md={3}>
                        <FloatingLabel label="Previsão de Retirada:">
                            <Form.Control
                                type="date"
                                name="data_retirada_prevista"
                                value={locacao.data_retirada_prevista}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col>
                </Row>

                <Row className="mb-4 g-3">
                    <Col md={8}>
                        <FloatingLabel label="Endereço Completo de Entrega:">
                            <Form.Control
                                type="text"
                                name="endereco_entrega"
                                placeholder="Rua, Número, Bairro..."
                                value={locacao.endereco_entrega}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col>

                    <Col md={4}>
                        <FloatingLabel label="Status da Locação:">
                            <Form.Select
                                name="status"
                                value={locacao.status}
                                onChange={manipularMudancas}
                                required
                            >
                                <option value="AGENDADA">Agendada</option>
                                <option value="CONCLUIDA">Concluída</option>
                                <option value="ENTREGUE">Entregue</option>
                                <option value="CANCELADA">Cancelada</option>
                            </Form.Select>
                        </FloatingLabel>
                    </Col>
                </Row>

                {/* SEÇÃO DE CAÇAMBAS (SÓ É EXIBIDA SE HOUVER CLIENTE SELECIONADO) */}
                {locacao.cliente.id !== '0' && (
                    <Card className="mb-4 border-primary">
                        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Caçambas Alocadas</h5>
                            <Button variant="light" size="sm" onClick={() => setShowModalCacamba(true)}>
                                <i className="bi bi-plus-circle me-1"></i> Vincular Caçamba
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive hover>
                                <thead>
                                    <tr>
                                        <th>Código/Identificação</th>
                                        <th>Volume/Tipo</th>
                                        <th style={{ width: '180px' }}>Multiplicador / Qtd</th>
                                        <th style={{ width: '220px' }}>Status do Item</th>
                                        <th>Subtotal</th>
                                        <th style={{ width: '80px' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locacao.itens.length > 0 ? (
                                        locacao.itens.map((item, index) => (
                                            <tr key={index}>
                                                <td className="align-middle">Caçamba nº {item.cacamba?.numero || item.cacamba?.id}</td>
                                                <td className="align-middle">{item.cacamba?.tipoCacamba?.volume +" / "+ item.cacamba?.tipoCacamba?.nome || "Padrão"}</td>
                                                <td>
                                                    <Form.Control 
                                                        type="number" 
                                                        step="0.01"
                                                        value={item.valor_unitario}
                                                        onChange={(e) => atualizarDadosItem(index, 'valor_unitario', e.target.value)}
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Select
                                                        value={item.status}
                                                        onChange={(e) => atualizarDadosItem(index, 'status', e.target.value)}
                                                        required
                                                    >
                                                        <option value="AGENDADA">Agendada</option>
                                                        <option value="ENTREGUE">Entregue no Local</option>
                                                        <option value="RECOLHIDA">Recolhida / Concluída</option>
                                                        <option value="MANUTENCAO">Enviada para Manutenção</option>
                                                    </Form.Select>
                                                </td>
                                                {/* CÉLULA SOLICITADA ATUALIZADA */}
                                                <td className="align-middle">
                                                    R$ {(item.valor_unitario * (item.cacamba?.tipoCacamba?.preco || 0)).toFixed(2)}
                                                </td>
                                                <td className="align-middle">
                                                    <Button variant="outline-danger" size="sm" onClick={() => removerItem(index)}>
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-3">
                                                Nenhuma caçamba vinculada. Clique em "Vincular Caçamba" para listar as disponíveis.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                            <div className="text-end mt-3">
                                <h4>Total da Locação: <span className="text-success">R$ {Number(locacao.valor_total || 0).toFixed(2)}</span></h4>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* BOTÕES DE AÇÃO DO FORMULÁRIO */}
                <Row className="mt-4">
                    <Col md={12} className="d-flex justify-content-end gap-2">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => {
                                props.setLocacaoParaEdicao(locacaoVazia);
                                props.exibirFormulario(false);
                            }}
                        >
                            <i className="bi bi-x-circle me-1"></i> Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="warning"
                            onClick={() => {
                                setLocacao(locacaoVazia);
                                setFormValidado(false);
                            }}
                        >
                            <i className="bi bi-arrow-counterclockwise me-1"></i> Resetar
                        </Button>
                        <Button
                            type="submit"
                            variant="success"
                            className="px-4 shadow-sm"
                            disabled={estado === ESTADO.PENDENTE}
                        >
                            {estado === ESTADO.PENDENTE ? (
                                <Spinner size="sm" />
                            ) : (
                                <>
                                    <i className={props.modoEdicao ? "bi bi-pencil-square me-1" : "bi bi-check-lg me-1"}></i>
                                    {props.modoEdicao ? "Alterar Locação" : "Gravar Locação"}
                                </>
                            )}
                        </Button>
                    </Col>
                </Row>
            </Form>

            {/* MODAIS DE SELEÇÃO */}
            <ModalSelecaoCliente
                show={showModalCliente}
                onHide={() => setShowModalCliente(false)}
                onSelecionar={(cli) => setLocacao({ ...locacao, cliente: cli, itens: [] })}
            />

            <ModalSelecaoCacamba
                filtros={{
                    status: "DISPONIVEL"
                }}
                show={showModalCacamba}
                onHide={() => setShowModalCacamba(false)}
                onSelecionar={adicionarItem}
            />
        </Container>
    );
}
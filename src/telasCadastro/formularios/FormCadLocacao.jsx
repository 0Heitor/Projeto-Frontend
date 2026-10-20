import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { Container, Form, Row, Col, Button, FloatingLabel, Spinner, Table, Card, Badge, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { adicionarLocacao, atualizarLocacao } from '../../redux/redutores/locacaoReducer';
import ModalSelecaoCliente from "../modais/ModalSelecaoCliente";
import ModalSelecaoCacamba from "../modais/ModalSelecaoCacamba";
import ESTADO from '../../recursos/estado';

export default function FormCadLocacao(props) {
    const locacaoVazia = {
        id: '0',
        data_entrega: new Date().toISOString().split('T')[0],
        data_retirada_prevista: '',
        endereco_entrega: '',
        cliente: { id: '0', nome: '', cpf_cnpj: '' },
        itens: [],
        valor_total: 0,
        status: 'AGENDADA',
        ativo: true,
    };

    // Funções utilitárias de formatação
    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
    };

    const formatarData = (dataString) => {
        if (!dataString) return "-";
        const data = new Date(dataString);
        return isNaN(data.getTime()) ? "-" : data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    };

    const formatarDataParaInput = (dataInput) => {
        if (!dataInput) return '';
        if (typeof dataInput === 'string' && dataInput.includes('T')) {
            return dataInput.split('T')[0];
        }
        if (typeof dataInput === 'string' && dataInput.includes('/')) {
            const partes = dataInput.split('/');
            if (partes.length === 3) {
                return `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
            }
        }
        const data = new Date(dataInput);
        if (!isNaN(data.getTime())) {
            return data.toISOString().split('T')[0];
        }
        return dataInput;
    };

    const prepararObjetoEdicao = (dados) => {
        if (!dados) return locacaoVazia;
        return {
            ...dados,
            data_entrega: formatarDataParaInput(dados.data_entrega) || locacaoVazia.data_entrega,
            data_retirada_prevista: formatarDataParaInput(dados.data_retirada_prevista),
            cliente: dados.cliente || locacaoVazia.cliente,
            itens: dados.itens || []
        };
    };

    const [locacao, setLocacao] = useState(() => prepararObjetoEdicao(props.locacaoParaEdicao));
    const [showModalCliente, setShowModalCliente] = useState(false);
    const [showModalCacamba, setShowModalCacamba] = useState(false);
    const [formValidado, setFormValidado] = useState(false);

    // ESTADOS PARA O MODAL DE CONFIRMAÇÃO/EDIÇÃO FINANCEIRA
    const [exibirModalEdicao, setExibirModalEdicao] = useState(false);
    const [itemEditando, setItemEditando] = useState(null);

    const { estado, mensagem } = useSelector((state) => state.locacao);
    const dispatch = useDispatch();

    useEffect(() => {
        if (props.locacaoParaEdicao) {
            setLocacao(prepararObjetoEdicao(props.locacaoParaEdicao));
        } else {
            setLocacao(locacaoVazia);
        }
    }, [props.locacaoParaEdicao]);

    function manipularMudancas(e) {
        const { name, value } = e.currentTarget;
        setLocacao({ ...locacao, [name]: value });
    }

    function adicionarItem(cacamba) {
        if (locacao.itens.find(item => item.cacamba.id === cacamba.id)) {
            toast.warn("Esta caçamba já foi adicionada à lista!");
            return;
        }

        const novoItem = {
            cacamba: cacamba,
            quantidade: 1, 
            valor_unitario: 1,
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

    // ABRIR E GERENCIAR O MODAL DE EDIÇÃO FINANCEIRA
    const abrirModalEdicao = () => {
        if (locacao.cliente.id === '0' || locacao.itens.length === 0) {
            toast.error("Selecione um cliente e pelo menos uma caçamba!");
            setFormValidado(true);
            return;
        }

        setItemEditando({
            id: locacao.id || 'NOVA',
            cliente: locacao.cliente,
            valor_total: locacao.valor_total,
            data_vencimento: locacao.data_retirada_prevista || locacao.data_entrega,
            descricao: locacao.observacao || `Locação de ${locacao.itens.length} caçamba(s)`,
            valor_recebido: locacao.valor_recebido || locacao.valor_total || '',
            forma_pagamento: locacao.forma_pagamento || 'PIX',
            status_conta: locacao.status_conta || 'PENDENTE',
            ativo_conta: locacao.ativo_conta !== undefined ? String(locacao.ativo_conta) : 'true'
        });
        setExibirModalEdicao(true);
    };

    const fecharModalEdicao = () => {
        setExibirModalEdicao(false);
        setItemEditando(null);
    };

    const manipulaMudancaEdicao = (evento) => {
        const { name, value } = evento.target;
        setItemEditando(prev => ({ ...prev, [name]: value }));
    };

    const salvarEdicao = () => {
        if (!itemEditando) return;

        // Mescla as informações ajustadas na modal com o objeto da locação
        const locacaoAtualizada = {
            ...locacao,
            descricao: itemEditando.descricao,
            valor_recebido: Number(itemEditando.valor_recebido || 0),
            data_vencimento: itemEditando.data_vencimento,
            forma_pagamento: itemEditando.forma_pagamento,
            status_conta: itemEditando.status_conta,
            ativo_conta: itemEditando.ativo_conta === 'true' || itemEditando.ativo_conta === true
        };

        if (!props.modoEdicao) {
            dispatch(adicionarLocacao(locacaoAtualizada));
        } else {
            dispatch(atualizarLocacao(locacaoAtualizada));
        }

        fecharModalEdicao();
        props.exibirFormulario(false);
    };

    async function manipularSubmissao(e) {
        e.preventDefault();
        abrirModalEdicao();
    }

    // CÁLCULO DE SEMANAS E VALOR TOTAL
    const calcularSemanas = () => {
        if (!locacao.data_entrega || !locacao.data_retirada_prevista) return 1;

        const dInicio = new Date(`${locacao.data_entrega}T00:00:00`);
        const dFim = new Date(`${locacao.data_retirada_prevista}T00:00:00`);

        const diffTime = dFim.getTime() - dInicio.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 1;
        return Math.ceil(diffDays / 7);
    };

    const qtdSemanas = calcularSemanas();

    useEffect(() => {
        const total = locacao.itens.reduce((acc, item) => {
            const vlrUnitario = parseFloat(item.valor_unitario || 1);
            const precoTipo = parseFloat(item.cacamba?.tipoCacamba?.preco || 0);

            return acc + (vlrUnitario * precoTipo * qtdSemanas);
        }, 0);

        setLocacao(prev => ({ ...prev, valor_total: total }));
    }, [locacao.itens, locacao.data_entrega, locacao.data_retirada_prevista, qtdSemanas]);

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
    }, [estado, mensagem]);

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border">
            <h2 className="mb-4 text-primary border-bottom pb-2">
                {props.modoEdicao ? "Alterar Locação de Caçamba" : "Registrar Nova Locação"}
            </h2>

            <Form noValidate validated={formValidado} onSubmit={manipularSubmissao}>
                
                {/* SEÇÃO PRINCIPAL */}
                <Row className="mb-3 g-3">
                    <Col md={6}>
                        <FloatingLabel label="Cliente (Clique para Selecionar):">
                            <Form.Control
                                readOnly
                                placeholder="Selecione..."
                                value={locacao.cliente?.nome ? `${locacao.cliente.nome} - ${locacao.cliente.cpf_cnpj || ''}` : ""}
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
                                value={locacao.data_entrega || ''}
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
                                value={locacao.data_retirada_prevista || ''}
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
                                value={locacao.endereco_entrega || ''}
                                onChange={manipularMudancas}
                                required
                            />
                        </FloatingLabel>
                    </Col>

                    <Col md={4}>
                        <FloatingLabel label="Status da Locação:">
                            <Form.Select
                                name="status"
                                value={locacao.status || 'AGENDADA'}
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

                {/* SEÇÃO DE CAÇAMBAS */}
                {locacao.cliente?.id !== '0' && (
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
                                        <th style={{ width: '150px' }}>Preço/Semana</th>
                                        <th style={{ width: '150px' }}>Multiplicador</th>
                                        <th style={{ width: '200px' }}>Status do Item</th>
                                        <th>Subtotal ({qtdSemanas} {qtdSemanas === 1 ? 'semana' : 'semanas'})</th>
                                        <th style={{ width: '80px' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locacao.itens && locacao.itens.length > 0 ? (
                                        locacao.itens.map((item, index) => {
                                            const vlrUnit = parseFloat(item.valor_unitario || 1);
                                            const precoTipo = parseFloat(item.cacamba?.tipoCacamba?.preco || 0);
                                            const subtotal = vlrUnit * precoTipo * qtdSemanas;

                                            return (
                                                <tr key={index}>
                                                    <td className="align-middle">Caçamba nº {item.cacamba?.numero || item.cacamba?.id}</td>
                                                    <td className="align-middle">{`${item.cacamba?.tipoCacamba?.volume || '-'} / ${item.cacamba?.tipoCacamba?.nome || "Padrão"}`}</td>
                                                    <td className="align-middle fw-semibold text-secondary">
                                                        R$ {precoTipo.toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <Form.Control 
                                                            type="number" 
                                                            step="0.01"
                                                            value={item.valor_unitario || ''}
                                                            onChange={(e) => atualizarDadosItem(index, 'valor_unitario', e.target.value)}
                                                            required
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Select
                                                            value={item.status || 'AGENDADA'}
                                                            onChange={(e) => atualizarDadosItem(index, 'status', e.target.value)}
                                                            required
                                                        >
                                                            <option value="AGENDADA">Agendada</option>
                                                            <option value="ENTREGUE">Entregue no Local</option>
                                                            <option value="DISPONIVEL">Recolhida / Concluída</option>
                                                            <option value="MANUTENCAO">Enviada para Manutenção</option>
                                                        </Form.Select>
                                                    </td>
                                                    <td className="align-middle fw-semibold text-success">
                                                        R$ {subtotal.toFixed(2)}
                                                    </td>
                                                    <td className="align-middle">
                                                        <Button variant="outline-danger" size="sm" onClick={() => removerItem(index)}>
                                                            <i className="bi bi-trash"></i>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center text-muted py-3">
                                                Nenhuma caçamba vinculada. Clique em "Vincular Caçamba" para listar as disponíveis.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>

                            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                <div>
                                    <Badge bg="info" className="p-2 fs-6 text-dark">
                                        <i className="bi bi-calendar-event me-1"></i>
                                        Período Estimado: <strong>{qtdSemanas} {qtdSemanas === 1 ? 'Semana (até 7 dias)' : `Semanas (${qtdSemanas * 7} dias de ciclo)`}</strong>
                                    </Badge>
                                </div>
                                <div className="text-end">
                                    <h4>Total da Locação: <span className="text-success">R$ {Number(locacao.valor_total || 0).toFixed(2)}</span></h4>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* BOTÕES DE AÇÃO */}
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
                            type="button"
                            variant="primary"
                            className="px-4 shadow-sm"
                            disabled={estado === ESTADO.PENDENTE}
                            onClick={abrirModalEdicao}
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

            {/* MODAL DE CONFIRMAÇÃO / EDIÇÃO FINANCEIRA */}
            <Modal show={exibirModalEdicao} onHide={fecharModalEdicao} centered backdrop="static" size="lg">
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>
                        <i className="bi bi-pencil-square me-2"></i>
                        Adicionar Financeiro #{itemEditando?.id}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {itemEditando && (() => {
                        const valorTotal = Number(itemEditando.valor_total || 0);
                        const valorRecebido = Number(itemEditando.valor_recebido || 0);
                        const diferenca = valorRecebido - valorTotal;

                        let badgeBg = "secondary";
                        let mensagemTroco = "Informe o valor recebido";
                        let iconeTroco = "bi-cash-stack";

                        if (itemEditando.valor_recebido !== undefined && itemEditando.valor_recebido !== "") {
                            if (Math.abs(diferenca) < 0.01) {
                                badgeBg = "success";
                                mensagemTroco = "Valor exato! Sem troco.";
                                iconeTroco = "bi-check-circle-fill";
                            } else if (diferenca > 0) {
                                badgeBg = "info";
                                mensagemTroco = `Troco a devolver: ${formatarMoeda(diferenca)}`;
                                iconeTroco = "bi-arrow-left-right";
                            } else {
                                badgeBg = "danger";
                                mensagemTroco = `Valor insuficiente! Faltando: ${formatarMoeda(Math.abs(diferenca))}`;
                                iconeTroco = "bi-exclamation-triangle-fill";
                            }
                        }

                        return (
                            <Form>
                                <div className="mb-3 p-3 bg-light rounded border">
                                    <Row>
                                        <Col md={6}>
                                            <div><strong>Cliente:</strong> {itemEditando.cliente?.nome || `Cliente #${itemEditando.cliente?.id}`}</div>
                                            <div><strong>Vencimento:</strong> {formatarData(itemEditando.data_vencimento)}</div>
                                        </Col>
                                        <Col md={6} className="text-md-end">
                                            <div><strong>Valor Total da Conta:</strong></div>
                                            <div className="fs-4 fw-bold text-primary">{formatarMoeda(valorTotal)}</div>
                                        </Col>
                                    </Row>
                                </div>

                                <Row className="g-3">
                                    <Col md={12}>
                                        <FloatingLabel label="Descrição / Observações">
                                            <Form.Control 
                                                as="textarea"
                                                rows={2}
                                                style={{ height: '80px' }}
                                                name="rec_descricao" 
                                                placeholder="Descrição"
                                                value={itemEditando.descricao || ''} 
                                                onChange={manipulaMudancaEdicao}
                                            />
                                        </FloatingLabel>
                                    </Col>

                                    <Col md={6}>
                                        <FloatingLabel label="Valor Recebido (R$)">
                                            <Form.Control 
                                                type="number"
                                                step="0.01"
                                                name="valor_recebido" 
                                                placeholder="0,00"
                                                value={itemEditando.valor_recebido ?? ''} 
                                                onChange={manipulaMudancaEdicao}
                                            />
                                        </FloatingLabel>
                                    </Col>

                                    <Col md={6} className="d-flex align-items-center">
                                        <Card className={`w-100 border-0 bg-${badgeBg} bg-opacity-10 border-start border-4 border-${badgeBg}`}>
                                            <Card.Body className="py-2 px-3">
                                                <small className={`text-${badgeBg === 'info' ? 'dark' : badgeBg} fw-bold d-block`}>
                                                    <i className={`bi ${iconeTroco} me-1`}></i> Situação do Pagamento:
                                                </small>
                                                <div className={`fs-6 fw-bold text-${badgeBg === 'info' ? 'dark' : badgeBg}`}>
                                                    {mensagemTroco}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    <Col md={4}>
                                        <FloatingLabel label="Forma de Pagamento">
                                            <Form.Select 
                                                name="forma_pagamento" 
                                                value={itemEditando.forma_pagamento || ''} 
                                                onChange={manipulaMudancaEdicao}
                                            >
                                                <option value="PIX">PIX</option>
                                                <option value="BOLETO">Boleto</option>
                                                <option value="DINHEIRO">Dinheiro</option>
                                                <option value="CARTAO">Cartão</option>
                                            </Form.Select>
                                        </FloatingLabel>
                                    </Col>

                                    <Col md={4}>
                                        <FloatingLabel label="Status Financeiro">
                                            <Form.Select 
                                                name="status" 
                                                value={itemEditando.status_conta || 'PENDENTE'} 
                                                onChange={manipulaMudancaEdicao}
                                            >
                                                <option value="PENDENTE">PENDENTE</option>
                                                <option value="PAGO">PAGO</option>
                                                <option value="ATRASADO">ATRASADO</option>
                                            </Form.Select>
                                        </FloatingLabel>
                                    </Col>

                                    <Col md={4}>
                                        <FloatingLabel label="Registro Ativo">
                                            <Form.Select 
                                                name="ativo" 
                                                value={String(itemEditando.ativo_conta)} 
                                                onChange={manipulaMudancaEdicao}
                                            >
                                                <option value="true">Sim (Ativo)</option>
                                                <option value="false">Não (Inativo)</option>
                                            </Form.Select>
                                        </FloatingLabel>
                                    </Col>
                                </Row>
                            </Form>
                        );
                    })()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={fecharModalEdicao}>
                        <i className="bi bi-x-circle me-1"></i> Cancelar
                    </Button>
                    <Button variant="success" onClick={salvarEdicao}>
                        <i className="bi bi-check-circle me-1"></i> Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* MODAIS DE SELEÇÃO DE CLIENTE E CAÇAMBA */}
            <ModalSelecaoCliente
                show={showModalCliente}
                onHide={() => setShowModalCliente(false)}
                onSelecionar={(cli) => setLocacao({ ...locacao, cliente: cli, itens: [] })}
            />

            <ModalSelecaoCacamba
                filtros={{ status: "DISPONIVEL" }}
                show={showModalCacamba}
                onHide={() => setShowModalCacamba(false)}
                onSelecionar={adicionarItem}
            />
        </Container>
    );
}
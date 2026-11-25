import { useEffect, useRef, useState } from "react";
import { Container, Card, Badge, Spinner, Alert, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { buscarLocacoes, atualizarLocacao } from "../../redux/redutores/locacaoReducer.js";
import ESTADO from "../../recursos/estado";
import { toast } from "react-toastify";

const CENTRO_PADRAO = [-21.482, -51.532];

export default function TabelaVizualizacaoAgendamento() {
    const dispatch = useDispatch();
    const { estado, mensagem, locacoes } = useSelector(state => state.locacao || {});
    const sucessoExibido = useRef(false);

    const [posicoesAjustadas, setPosicoesAjustadas] = useState({});
    const [ultimoMovimento, setUltimoMovimento] = useState(null);
    const [marcadorArrastavelId, setMarcadorArrastavelId] = useState(null);
    const [salvandoPosicao, setSalvandoPosicao] = useState(false);

    useEffect(() => {
        sucessoExibido.current = false;
        dispatch(buscarLocacoes({
            cliente: {
                nome: "",
                ativo: true
            },
            status_cacamba: "ALUGADA",
            ativo: true,
            semPaginacao: true
        }));
    }, [dispatch]);

    useEffect(() => {
        if (estado === ESTADO.PENDENTE) {
            sucessoExibido.current = false;
            toast.info(
                <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    <span>Carregando caçambas alugadas no mapa...</span>
                </div>,
                { toastId: "processando-mapa", autoClose: false, theme: "colored" }
            );
        } else if (estado === ESTADO.ERRO) {
            toast.dismiss("processando-mapa");
            toast.error(`Ops! ${mensagem}`, { toastId: "erro-mapa", theme: "dark" });
        } else if (estado === ESTADO.OCIOSO) {
            toast.dismiss("processando-mapa");
            if (!sucessoExibido.current) {
                toast.success("Locações em andamento carregadas!", { toastId: "sucesso-mapa", autoClose: 2000 });
                sucessoExibido.current = true;
            }
        }
    }, [estado, mensagem]);

    const formatarData = (dataString) => {
        if (!dataString) return "-";
        const data = new Date(dataString);
        return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    };

    const habilitarArrasteBotaoDireito = (event, chave) => {
        const botao = event?.originalEvent?.button;
        if (botao === 2 || botao === undefined) {
            if (event?.originalEvent?.preventDefault) {
                event.originalEvent.preventDefault();
            }
            setMarcadorArrastavelId(chave);
            setTimeout(() => {
                if (event.target?.dragging) {
                    event.target.dragging.enable();
                }
            }, 0);
        }
    };

    // Apenas registra a nova posição local; não atualiza no backend antes de clicar em "Prosseguir"
    const aoTerminarArraste = (event, marcadorInfo) => {
        const marker = event.target;
        const { lat, lng } = marker.getLatLng();

        if (marker.dragging) {
            marker.dragging.disable();
        }

        const latFormatada = Number(lat.toFixed(6));
        const lngFormatada = Number(lng.toFixed(6));

        const dadosAtualizados = {
            chave: marcadorInfo.chave,
            locacaoId: marcadorInfo.locacaoId,
            itemId: marcadorInfo.itemId,
            cacambaNumero: marcadorInfo.cacambaNumero,
            clienteNome: marcadorInfo.clienteNome,
            locacao: marcadorInfo.locacao,
            lat: latFormatada,
            lng: lngFormatada
        };

        setPosicoesAjustadas((prev) => ({
            ...prev,
            [marcadorInfo.chave]: { lat: latFormatada, lng: lngFormatada }
        }));

        setUltimoMovimento(dadosAtualizados);
        setMarcadorArrastavelId(null);

        console.log("Posição pendente para prosseguir:", dadosAtualizados);
        toast.info(
            `Caçamba ${marcadorInfo.cacambaNumero} movida → Clique em "Prosseguir" para salvar.`,
            { autoClose: 3500 }
        );
    };

    // Só envia para o Redux/backend ao clicar no botão "Prosseguir"
    const prosseguirAtualizacao = () => {
        if (!ultimoMovimento || salvandoPosicao) return;

        setSalvandoPosicao(true);

        const locacaoAtualizada = {
            ...ultimoMovimento.locacao,
            latitude: ultimoMovimento.lat,
            longitude: ultimoMovimento.lng,
            mapa: true
        };

        dispatch(atualizarLocacao(locacaoAtualizada))
            .then(() => {
                return dispatch(buscarLocacoes({
                    cliente: {
                        nome: "",
                        ativo: true
                    },
                    status_cacamba: "ALUGADA",
                    ativo: true,
                    semPaginacao: true
                }));
            })
            .then(() => {
                const chaveSalva = ultimoMovimento.chave;
                setPosicoesAjustadas((prev) => {
                    const copia = { ...prev };
                    delete copia[chaveSalva];
                    return copia;
                });
                setUltimoMovimento(null);
                toast.success(
                    `Coordenadas da caçamba ${ultimoMovimento.cacambaNumero} atualizadas com sucesso!`,
                    { autoClose: 2500 }
                );
            })
            .finally(() => {
                setSalvandoPosicao(false);
            });
    };

    const restaurarPosicaoOriginal = (chave) => {
        setPosicoesAjustadas((prev) => {
            const copia = { ...prev };
            delete copia[chave];
            return copia;
        });

        setUltimoMovimento((prev) => (prev?.chave === chave ? null : prev));
    };

    const marcadoresAlugados = (locacoes || []).flatMap((loc) => {
        const latOriginal = Number(loc.latitude);
        const lngOriginal = Number(loc.longitude);
        if (Number.isNaN(latOriginal) || Number.isNaN(lngOriginal)) return [];

        const itensAlugados = (loc.itens || []).filter(
            (item) => String(item.status_item).toUpperCase() === "ALUGADA"
        );

        return itensAlugados.map((item) => {
            const chave = `${loc.id}-${item.id}`;
            const ajuste = posicoesAjustadas[chave];
            return {
                chave,
                locacao: loc,
                item,
                lat: ajuste ? ajuste.lat : latOriginal,
                lng: ajuste ? ajuste.lng : lngOriginal,
                foiMovido: Boolean(ajuste)
            };
        });
    });

    const centroMapa = marcadoresAlugados.length > 0
        ? [marcadoresAlugados[0].lat, marcadoresAlugados[0].lng]
        : CENTRO_PADRAO;

    return (
        <Container className="mt-4 p-4 shadow-sm bg-white rounded border" style={{ opacity: estado === ESTADO.PENDENTE ? 0.75 : 1 }}>
            {/* CABEÇALHO */}
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3 flex-wrap gap-2">
                <div>
                    <h2 className="text-primary mb-0">
                        <i className="bi bi-geo-alt-fill me-2"></i>
                        Mapa de Caçambas Alugadas
                    </h2>
                    <small className="text-muted">
                        Clique/segure com o botão direito no marcador para arrastar, solte e clique em Prosseguir para salvar
                    </small>
                </div>
                <Badge bg="warning" text="dark" className="fs-6 px-3 py-2">
                    <i className="bi bi-truck me-1"></i>
                    {marcadoresAlugados.length} caçamba(s) no mapa
                </Badge>
            </div>

            {/* COORDENADAS PENDENTES DE CONFIRMAÇÃO */}
            {ultimoMovimento && (
                <Alert variant="info" className="d-flex justify-content-between align-items-center flex-wrap gap-2 py-2">
                    <div>
                        <strong>Posição pendente — Caçamba {ultimoMovimento.cacambaNumero}</strong>{" "}
                        (Locação #{ultimoMovimento.locacaoId} • {ultimoMovimento.clienteNome}):{" "}
                        <span className="fw-semibold">
                            Latitude: {ultimoMovimento.lat} | Longitude: {ultimoMovimento.lng}
                        </span>
                    </div>
                    <div className="d-flex gap-2">
                        <Button
                            size="sm"
                            variant="outline-secondary"
                            disabled={salvandoPosicao}
                            onClick={() => restaurarPosicaoOriginal(ultimoMovimento.chave)}
                        >
                            Restaurar posição original
                        </Button>
                        <Button
                            size="sm"
                            variant="success"
                            disabled={salvandoPosicao}
                            onClick={prosseguirAtualizacao}
                        >
                            {salvandoPosicao ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-1" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg me-1"></i>
                                    Prosseguir
                                </>
                            )}
                        </Button>
                    </div>
                </Alert>
            )}

            {/* MAPA */}
            <Card
                className="border-0 shadow-sm overflow-hidden"
                onContextMenu={(e) => e.preventDefault()}
            >
                <Card.Body className="p-0">
                    <MapContainer center={centroMapa} zoom={13} style={{ height: "650px", width: "100%" }}>
                        <TileLayer
                            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {marcadoresAlugados.map(({ chave, locacao: loc, item, lat, lng, foiMovido }) => {
                            const cacamba = item.cacamba || {};
                            const cacambaNumero = cacamba.numero || `#${cacamba.id || item.id}`;
                            const clienteNome = loc.cliente?.nome || `Cliente #${loc.cliente?.id || "-"}`;
                            const clienteCpfCnpj = loc.cliente?.cpf_cnpj || "";
                            const enderecoTexto = loc.endereco_entrega || "-";
                            const podeArrastar = marcadorArrastavelId === chave;

                            return (
                                <Marker
                                    key={chave}
                                    position={[lat, lng]}
                                    draggable={podeArrastar}
                                    eventHandlers={{
                                        contextmenu: (event) => habilitarArrasteBotaoDireito(event, chave),
                                        dragend: (event) => aoTerminarArraste(event, {
                                            chave,
                                            locacaoId: loc.id,
                                            itemId: item.id,
                                            cacambaNumero,
                                            clienteNome,
                                            locacao: loc
                                        })
                                    }}
                                >
                                    <Popup maxWidth={350} minWidth={270}>
                                        <div className="p-1">
                                            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                                                <span className="fw-bold text-primary fs-6">
                                                    <i className="bi bi-box-seam me-1"></i>
                                                    Caçamba {cacambaNumero}
                                                </span>
                                                <Badge bg={foiMovido ? "info" : "success"} text={foiMovido ? "dark" : undefined}>
                                                    {foiMovido ? "PENDENTE" : item.status_item}
                                                </Badge>
                                            </div>

                                            <div className="mb-2">
                                                <div className="small text-muted fw-semibold">CAÇAMBA</div>
                                                <div className="fw-bold text-dark">
                                                    Número: {cacambaNumero}
                                                </div>
                                                <div className="small text-secondary">
                                                    Locação #{loc.id} • Status locação: {loc.status || "-"}
                                                </div>
                                                <div className="small text-secondary">
                                                    Entrega: {formatarData(loc.data_entrega)}
                                                </div>
                                                <div className="small text-secondary">
                                                    Previsão retirada: {formatarData(loc.data_retirada_prevista)}
                                                </div>
                                            </div>

                                            <div className="pt-2 border-top mb-2">
                                                <div className="small text-muted fw-semibold">CLIENTE</div>
                                                <div className="fw-bold text-dark">{clienteNome}</div>
                                                {clienteCpfCnpj && (
                                                    <div className="small text-secondary">
                                                        <i className="bi bi-person-vcard me-1"></i>
                                                        {clienteCpfCnpj}
                                                    </div>
                                                )}
                                                <div className="small text-secondary mt-1">
                                                    <i className="bi bi-pin-map me-1"></i>
                                                    {enderecoTexto}
                                                </div>
                                            </div>

                                            <div className="pt-2 border-top small">
                                                <div className="text-muted fw-semibold">COORDENADAS ATUAIS</div>
                                                <div className="text-dark">
                                                    Lat: <strong>{lat}</strong> | Lng: <strong>{lng}</strong>
                                                </div>
                                                <div className="text-muted fst-italic mt-1">
                                                    Use o botão direito no pino para arrastar e soltar.
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </Card.Body>
            </Card>
        </Container>
    );
}
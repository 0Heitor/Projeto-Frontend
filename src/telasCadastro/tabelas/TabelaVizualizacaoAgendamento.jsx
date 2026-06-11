import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function TabelaVizualizacaoAgendamento(props){
    const position = [-21.482, -51.532]; // Coordenadas de Dracena - SP

    return (
        // É obrigatório definir uma altura e largura para o MapContainer
        <MapContainer center={position} zoom={13} style={{ height: "700px", width: "100%" }}>
        <TileLayer
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* <Marker position={position}>
            <Popup>
            Estamos aqui em Dracena!
            </Popup>
        </Marker> */}
        </MapContainer>
    );
}
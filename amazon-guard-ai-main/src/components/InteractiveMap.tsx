import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

const MADRE_DE_DIOS_CENTER: LatLngExpression = [-12.5933, -70.1234];

// Polígono representativo de Suelo Minero / Deforestación (Sector rojo)
const MINING_AREA_COORDS: LatLngExpression[] = [
  [-12.585, -70.135],
  [-12.575, -70.110],
  [-12.605, -70.100],
  [-12.620, -70.125],
  [-12.600, -70.145],
];

// Delimitación de concesión / amortiguamiento (Línea perimetral)
const BUFFER_ZONE_COORDS: LatLngExpression[] = [
  [-12.550, -70.170],
  [-12.550, -70.080],
  [-12.640, -70.080],
  [-12.640, -70.170],
];

interface InteractiveMapProps {
  opacity?: number;
  visibleClasses?: {
    forest: boolean;
    mining: boolean;
    water: boolean;
    infra: boolean;
  };
}

export function InteractiveMap({ 
  opacity = 0.75, 
  visibleClasses = { forest: true, mining: true, water: true, infra: true } 
}: InteractiveMapProps) {
  return (
    <div className="absolute inset-0 z-0 h-full w-full">
      <MapContainer
        center={MADRE_DE_DIOS_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
        zoomControl={false}
      >
        {/* Capa Satelital Global de Esri */}
        <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={18}
        />

        {/* Polígono de concesión / infraestructura (si está visible) */}
        {visibleClasses.infra && (
          <Polygon
            positions={BUFFER_ZONE_COORDS}
            pathOptions={{
              color: "#a855f7",
              weight: 2,
              fillOpacity: 0.05,
              dashArray: "6, 6",
            }}
          />
        )}

        {/* Polígono de detección SVM de Suelo Minero (vinculado a checkbox de minería) */}
        {visibleClasses.mining && (
          <Polygon
            positions={MINING_AREA_COORDS}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: opacity,
              weight: 1.5,
            }}
          >
            <Tooltip direction="top" sticky>
              <div className="font-sans text-xs">
                <p className="font-bold text-red-600">Suelo Minero / Deforestación</p>
                <p className="text-[11px] text-gray-600">ee.Classifier.libsvm (Sentinel-2)</p>
              </div>
            </Tooltip>
          </Polygon>
        )}
      </MapContainer>
    </div>
  );
}
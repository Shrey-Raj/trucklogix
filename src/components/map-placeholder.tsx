import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map as MapIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl:    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//   iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//   shadowUrl:  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
// });

interface Location {
  lat: number;
  lng: number;
  name: string;
}

type RouteMapProps = {
  locations?: Location[];
};

export default function RouteMap({ locations = [] }: RouteMapProps) {

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  const bounds = locations.length
    ? L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]))
    : undefined;

    console.log("RouteMap locations:", locations);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="w-5 h-5" />
          Route Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted">
          <MapContainer
            key={locations.length ? JSON.stringify(locations) : "defaultKey"}
            bounds={bounds}
            style={{ width: "100%", height: "100%" }}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc, idx) => (
              <Marker key={idx} position={[loc.lat, loc.lng]}>
                <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                  <div>
                    <strong>{loc.name}</strong><br />
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

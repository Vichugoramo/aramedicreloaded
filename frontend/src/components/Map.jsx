import styles from './Map.module.css';
import { MapContainer, TileLayer, Circle } from "react-leaflet";
import { useLocation } from '../contexts/LocationContext';
import { useAssistanceService } from '../contexts/AssistanceServiceContext';
import placeholderImg from '../assets/placeholder-map.png';

export const Map = () => {
    const { latitude, longitude } = useLocation();
    const { counterpart } = useAssistanceService();

    if (!latitude) {
        return <div className={styles.map}>
            <img className={styles.placeholderImg} src={placeholderImg} />
        </div>
    }

    const selfPosition = [latitude, longitude];
    const counterpartPosition = [counterpart.latitude || 0, counterpart.longitude || 0];
    const radiusInMeters = 12;
    
    return (
        <div className={styles.map}>
            <MapContainer center={selfPosition} zoom={16} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Circle center={selfPosition} radius={radiusInMeters} pathOptions={{ color: "var(--primary)", fillOpacity: 0.8 }} />
                { counterpart.isOnline && <Circle center={counterpartPosition} radius={radiusInMeters} pathOptions={{ color: "var(--accent)", fillOpacity: 0.8 }} />}
            </MapContainer>
        </div>
    );
    
}
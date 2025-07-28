import openrouteservice
from typing import Dict, List
import logging

class RouteOptimizationService:
    """
    Route optimization using OpenRouteService for real-time directions, POI search, and geocoding.
    """

    def __init__(self, api_key: str):
        self.client = openrouteservice.Client(key=api_key)

    def optimize_route(self, route_data: Dict) -> Dict:
        # Extract route details
        current_location = route_data['current_location']
        pickup_location = route_data['pickup_location']
        dropoff_location = route_data['dropoff_location']
        cycle_hours_used = route_data.get('current_cycle_hours_used', 0)

        # Geocode locations to coordinates
        current_coords = self._geocode(current_location)
        pickup_coords = self._geocode(pickup_location)
        dropoff_coords = self._geocode(dropoff_location)
        coordinates = [current_coords, pickup_coords, dropoff_coords]
        
        print(f"Coordinates: {coordinates}") 

        # Request optimized route
        directions = self.client.directions(
            coordinates=coordinates,
            profile='driving-car',
            format='geojson'
        )
        
        summary = directions['features'][0]['properties']['summary']
        distance_km = round(summary['distance'] / 1000, 2)
        duration_min = round(summary['duration'] / 60, 2)
        
        print(f"Distance: {distance_km} km, Duration: {duration_min} min")

        # Generate fuel and rest stops
        fuel_stops = self._generate_fuel_stops(coordinates)
        rest_stops = self._generate_rest_stops(coordinates, cycle_hours_used)

        return {
            'optimized_route': f"{current_location} → {pickup_location} → {dropoff_location}",
            'distance_km': distance_km,
            'duration_min': duration_min,
            'fuel_stops': fuel_stops,
            'rest_break_stops': rest_stops,
            'coordinates': {'current': current_coords, 'pickup': pickup_coords, 'dropoff': dropoff_coords}
        }

    def _geocode(self, location_name: str) -> List[float]:
        result = self.client.pelias_search(text=location_name)
        return result['features'][0]['geometry']['coordinates']


    def _generate_fuel_stops(self, coordinates: List[List[float]]) -> List[dict]:
        logger = logging.getLogger(__name__)
        fuel_stops = []

        for coord in coordinates:
            try:
                pois = self.client.places(
                    request='pois',
                    geojson={'type': 'Point', 'coordinates': coord},
                    buffer=2000,  # max allowed radius in meters
                    filter_category_ids=[596],  # fuel stations category
                    limit=10,
                    sortby='distance'
                )
                features = pois.get('features', [])
                logger.info(f"Fuel POIs near {coord}: count={len(features)}")

                for poi in features:
                    props = poi.get('properties', {})
                    geom = poi.get('geometry', {})

                    name = (
                        props.get('osm_tags', {}).get('name')
                        or props.get('name')
                        or 'Fuel Station'
                    )
                    coords = geom.get('coordinates', [])
                    distance = props.get('distance')

                    fuel_stops.append({
                        "name": name,
                        "coordinates": coords,
                        "distance_meters": distance
                    })
            except Exception as e:
                logger.error(f"Error fetching fuel POIs at {coord}: {e}")
                continue

        return fuel_stops


    def _generate_rest_stops(self, coordinates: List[List[float]], cycle_hours: float) -> List[dict]:
        logger = logging.getLogger(__name__)
        rest_stops = []
        logger.info(f"Calculating rest stops for cycle hours: {cycle_hours}")
        
        if cycle_hours > 4:
            pickup = coordinates[1]
            try:
                pois = self.client.places(
                    request='pois',
                    geojson={'type': 'Point', 'coordinates': pickup},
                    buffer=2000,
                    filter_category_ids=[566],
                    limit=10,
                    sortby='distance'
                )
                features = pois.get('features', [])
                # logger.info(f"POIs near pickup: {features}")
                
                for poi in features:
                    props = poi.get("properties", {})
                    geom = poi.get("geometry", {})
                    
                    name = (
                        props.get("osm_tags", {}).get("name") or
                        props.get("name") or
                        "Rest Stop"
                    )
                    coords = geom.get("coordinates", [])
                    distance = props.get("distance")
                    
                    rest_stops.append({
                        "name": name,
                        "coordinates": coords,
                        "distance_meters": distance
                    })
            except Exception as e:
                logger.error(f"Error fetching POIs: {e}")
                rest_stops.append({
                    "name": "Standard Rest Zone near pickup",
                    "coordinates": None,
                    "distance_meters": None
                })

        rest_stops.append({
            "name": "Truck Rest Zone near dropoff",
            "coordinates": coordinates[2],
            "distance_meters": None
        })

        return rest_stops

    
    def _calculate_travel_time(self, duration_seconds: float) -> str:
        """
        Convert duration from seconds (from ORS) to readable format (e.g., '5h 20m').
        """
        hours = int(duration_seconds // 3600)
        minutes = int((duration_seconds % 3600) // 60)
        return f"{hours}h {minutes}m"
    
    def _calculate_fuel_consumption(self, distance_km: float, fuel_efficiency_kmpl: float = 3.5) -> str:
        """
        Estimate fuel consumption in liters based on route distance.
        Assumes an average truck fuel efficiency (e.g., 3.5 km/l).
        """
        if fuel_efficiency_kmpl <= 0:
            return "Unknown efficiency"

        liters = round(distance_km / fuel_efficiency_kmpl, 2)
        return f"{liters} liters"


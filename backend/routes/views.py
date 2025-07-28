from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import RouteOptimization, FuelStop, RestBreakStop
from .serializers import RouteOptimizationSerializer, RouteOptimizationInputSerializer
from .services import RouteOptimizationService
import os
from dotenv import load_dotenv

load_dotenv()  


@api_view(['POST'])
def optimize_route(request):
    """
    Optimize a route based on current location, pickup, dropoff, and cycle hours.
    """
    serializer = RouteOptimizationInputSerializer(data=request.data)
    print(f"Input data: {request.data}")
    if not serializer.is_valid():
        print(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Initialize the service with an API key
        api_key = os.getenv('OPENROUTESERVICE_API_KEY') 
        if not api_key:
            print("API key is not set.")
            return Response(
                {'error': 'OpenRouteService API key is not set.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        service = RouteOptimizationService(api_key=api_key)

        # Call the service to optimize the route
        optimization_result = service.optimize_route(serializer.validated_data)
        # print(f"Optimization result: {optimization_result}")

        # Compute readable travel time and fuel consumption
        estimated_travel_time = service._calculate_travel_time(
            optimization_result['duration_min'] * 60
        )
        # print(f"Estimated travel time: {estimated_travel_time}")
        estimated_fuel_consumption = service._calculate_fuel_consumption(
            optimization_result['distance_km']
        )
        # print(f"Estimated fuel consumption: {estimated_fuel_consumption}")

        # Create the route optimization record
        route_optimization = RouteOptimization.objects.create(
            current_location=serializer.validated_data['current_location'],
            pickup_location=serializer.validated_data['pickup_location'],
            dropoff_location=serializer.validated_data['dropoff_location'],
            current_cycle_hours_used=serializer.validated_data['current_cycle_hours_used'],
            optimized_route=optimization_result['optimized_route'],
            estimated_travel_time=estimated_travel_time,
            estimated_fuel_consumption=estimated_fuel_consumption
        )
        # print(f"Created RouteOptimization: {route_optimization.id}")

        # Create fuel stops
        for i, fuel_stop in enumerate(optimization_result['fuel_stops']):
            fs = FuelStop.objects.create(
                route_optimization=route_optimization,
                location=fuel_stop,
                order=i
            )
            # print(f"Created FuelStop {i}: {fs.id}")

        # Create rest break stops
        for i, rest_stop in enumerate(optimization_result['rest_break_stops']):
            rs = RestBreakStop.objects.create(
                route_optimization=route_optimization,
                location=rest_stop,
                order=i
            )
            # print(f"Created RestBreakStop {i}: {rs.id}")

        # Return the serialized result
        result_serializer = RouteOptimizationSerializer(route_optimization)
        result_data = result_serializer.data
        result_data['coordinates'] = optimization_result.get('coordinates', [])
        print(f"Serialized result with coordinates: {result_data}")
        return Response(result_data, status=status.HTTP_201_CREATED)
    

    except Exception as e:
        print(f"Exception occurred: {str(e)}")
        return Response(
            {'error': f'Failed to optimize route: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_route_history(request):
    """
    Get the history of route optimizations.
    """
    routes = RouteOptimization.objects.all()[:10]  # Get last 10 routes
    serializer = RouteOptimizationSerializer(routes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_route_detail(request, route_id):
    """
    Get details of a specific route optimization.
    """
    try:
        route = RouteOptimization.objects.get(id=route_id)
        serializer = RouteOptimizationSerializer(route)
        return Response(serializer.data)
    except RouteOptimization.DoesNotExist:
        return Response(
            {'error': 'Route not found'},
            status=status.HTTP_404_NOT_FOUND
        )
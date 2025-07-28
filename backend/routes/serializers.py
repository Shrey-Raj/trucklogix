from rest_framework import serializers
from .models import RouteOptimization, FuelStop, RestBreakStop


class FuelStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = FuelStop
        fields = ['location', 'order']


class RestBreakStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestBreakStop
        fields = ['location', 'order']


class RouteOptimizationSerializer(serializers.ModelSerializer):
    fuel_stops = FuelStopSerializer(many=True, read_only=True)
    rest_break_stops = RestBreakStopSerializer(many=True, read_only=True)
    
    class Meta:
        model = RouteOptimization
        fields = [
            'id', 'current_location', 'pickup_location', 'dropoff_location',
            'current_cycle_hours_used', 'optimized_route', 'estimated_travel_time',
            'estimated_fuel_consumption', 'fuel_stops', 'rest_break_stops',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RouteOptimizationInputSerializer(serializers.Serializer):
    current_location = serializers.CharField(max_length=255)
    pickup_location = serializers.CharField(max_length=255)
    dropoff_location = serializers.CharField(max_length=255)
    current_cycle_hours_used = serializers.FloatField(min_value=0)
from django.db import models
from django.contrib.auth.models import User


class RouteOptimization(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    current_cycle_hours_used = models.FloatField()
    
    # Results
    optimized_route = models.TextField()
    estimated_travel_time = models.CharField(max_length=100)
    estimated_fuel_consumption = models.CharField(max_length=100)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Route: {self.current_location} -> {self.pickup_location} -> {self.dropoff_location}"


class FuelStop(models.Model):
    route_optimization = models.ForeignKey(RouteOptimization, related_name='fuel_stops', on_delete=models.CASCADE)
    location = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Fuel Stop: {self.location}"


class RestBreakStop(models.Model):
    route_optimization = models.ForeignKey(RouteOptimization, related_name='rest_break_stops', on_delete=models.CASCADE)
    location = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Rest Stop: {self.location}"
from django.contrib import admin
from .models import RouteOptimization, FuelStop, RestBreakStop


class FuelStopInline(admin.TabularInline):
    model = FuelStop
    extra = 0


class RestBreakStopInline(admin.TabularInline):
    model = RestBreakStop
    extra = 0


@admin.register(RouteOptimization)
class RouteOptimizationAdmin(admin.ModelAdmin):
    list_display = ['current_location', 'pickup_location', 'dropoff_location', 'estimated_travel_time', 'created_at']
    list_filter = ['created_at']
    search_fields = ['current_location', 'pickup_location', 'dropoff_location']
    inlines = [FuelStopInline, RestBreakStopInline]
    readonly_fields = ['created_at', 'updated_at']
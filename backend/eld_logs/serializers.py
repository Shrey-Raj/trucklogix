from rest_framework import serializers
from .models import EldLog, DutyStatusChange


class DutyStatusChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DutyStatusChange
        fields = ['time', 'location', 'status', 'order']


class EldLogSerializer(serializers.ModelSerializer):
    duty_status_changes = DutyStatusChangeSerializer(many=True, read_only=True)
    remaining_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = EldLog
        fields = [
            'id', 'driver_name', 'date', 'truck_number', 'trailer_number',
            'carrier_name', 'home_terminal_timezone', 'shipping_document_numbers',
            'current_location', 'pickup_location', 'dropoff_location',
            'cycle_hours_used', 'log_sheet', 'remaining_hours',
            'duty_status_changes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'log_sheet', 'created_at', 'updated_at']
    
    def get_remaining_hours(self, obj):
        return {
            'driving_hours': obj.remaining_driving_hours,
            'on_duty_hours': obj.remaining_on_duty_hours
        }


class EldLogInputSerializer(serializers.Serializer):
    driver_name = serializers.CharField(max_length=255)
    date = serializers.DateField()
    truck_number = serializers.CharField(max_length=100)
    trailer_number = serializers.CharField(max_length=100)
    carrier_name = serializers.CharField(max_length=255)
    home_terminal_timezone = serializers.CharField(max_length=50)
    shipping_document_numbers = serializers.CharField()
    current_location = serializers.CharField(max_length=255)
    pickup_location = serializers.CharField(max_length=255)
    dropoff_location = serializers.CharField(max_length=255)
    cycle_hours_used = serializers.FloatField(min_value=0)
    duty_status_changes = DutyStatusChangeSerializer(many=True)
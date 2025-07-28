from django.db import models
from django.contrib.auth.models import User


class EldLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    driver_name = models.CharField(max_length=255)
    date = models.DateField()
    truck_number = models.CharField(max_length=100)
    trailer_number = models.CharField(max_length=100)
    carrier_name = models.CharField(max_length=255)
    home_terminal_timezone = models.CharField(max_length=50)
    shipping_document_numbers = models.TextField()
    current_location = models.CharField(max_length=255)
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    cycle_hours_used = models.FloatField()
    
    # Generated log data
    log_sheet = models.TextField()
    remaining_driving_hours = models.FloatField()
    remaining_on_duty_hours = models.FloatField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"ELD Log - {self.driver_name} - {self.date}"


class DutyStatusChange(models.Model):
    STATUS_CHOICES = [
        ('Off Duty', 'Off Duty'),
        ('Sleeper Berth', 'Sleeper Berth'),
        ('Driving', 'Driving'),
        ('On Duty (Not Driving)', 'On Duty (Not Driving)'),
    ]
    
    eld_log = models.ForeignKey(EldLog, related_name='duty_status_changes', on_delete=models.CASCADE)
    time = models.CharField(max_length=20)  # e.g., "7:30 a.m."
    location = models.CharField(max_length=255)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.time} - {self.status} at {self.location}"
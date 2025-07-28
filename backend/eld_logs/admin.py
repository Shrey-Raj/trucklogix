from django.contrib import admin
from .models import EldLog, DutyStatusChange


class DutyStatusChangeInline(admin.TabularInline):
    model = DutyStatusChange
    extra = 0
    ordering = ['order']


@admin.register(EldLog)
class EldLogAdmin(admin.ModelAdmin):
    list_display = ['driver_name', 'date', 'truck_number', 'carrier_name', 'created_at']
    list_filter = ['date', 'carrier_name', 'created_at']
    search_fields = ['driver_name', 'truck_number', 'carrier_name']
    inlines = [DutyStatusChangeInline]
    readonly_fields = ['created_at', 'updated_at', 'log_sheet']
    
    fieldsets = (
        ('Driver Information', {
            'fields': ('driver_name', 'date', 'truck_number', 'trailer_number', 'carrier_name')
        }),
        ('Trip Details', {
            'fields': ('current_location', 'pickup_location', 'dropoff_location', 'cycle_hours_used')
        }),
        ('Documentation', {
            'fields': ('home_terminal_timezone', 'shipping_document_numbers')
        }),
        ('Generated Log', {
            'fields': ('log_sheet', 'remaining_driving_hours', 'remaining_on_duty_hours'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
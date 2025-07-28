"""
URL configuration for trucklogix project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/routes/', include('routes.urls')),
    path('api/eld-logs/', include('eld_logs.urls')),
]
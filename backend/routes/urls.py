from django.urls import path
from . import views

urlpatterns = [
    path('optimize/', views.optimize_route, name='optimize_route'),
    path('history/', views.get_route_history, name='route_history'),
    path('<int:route_id>/', views.get_route_detail, name='route_detail'),
]
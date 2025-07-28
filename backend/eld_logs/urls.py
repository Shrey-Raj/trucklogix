from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.generate_eld_log, name='generate_eld_log'),
    path('history/', views.get_eld_log_history, name='eld_log_history'),
    path('<int:log_id>/', views.get_eld_log_detail, name='eld_log_detail'),
    path('<int:log_id>/delete/', views.delete_eld_log, name='delete_eld_log'),
]
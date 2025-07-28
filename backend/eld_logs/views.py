from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import EldLog, DutyStatusChange
from .serializers import EldLogSerializer, EldLogInputSerializer
from .services import EldLogService


@api_view(['POST'])
def generate_eld_log(request):
    """
    Generate an ELD log based on the provided data.
    """
    serializer = EldLogInputSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Use the service to generate the ELD log
        service = EldLogService()
        log_result = service.generate_log(serializer.validated_data)
        
        # Create the ELD log record
        eld_log = EldLog.objects.create(
            driver_name=serializer.validated_data['driver_name'],
            date=serializer.validated_data['date'],
            truck_number=serializer.validated_data['truck_number'],
            trailer_number=serializer.validated_data['trailer_number'],
            carrier_name=serializer.validated_data['carrier_name'],
            home_terminal_timezone=serializer.validated_data['home_terminal_timezone'],
            shipping_document_numbers=serializer.validated_data['shipping_document_numbers'],
            current_location=serializer.validated_data['current_location'],
            pickup_location=serializer.validated_data['pickup_location'],
            dropoff_location=serializer.validated_data['dropoff_location'],
            cycle_hours_used=serializer.validated_data['cycle_hours_used'],
            log_sheet=log_result['log_sheet'],
            remaining_driving_hours=log_result['remaining_hours']['driving_hours'],
            remaining_on_duty_hours=log_result['remaining_hours']['on_duty_hours']
        )
        
        # Create duty status changes
        for i, duty_change in enumerate(serializer.validated_data['duty_status_changes']):
            DutyStatusChange.objects.create(
                eld_log=eld_log,
                time=duty_change['time'],
                location=duty_change['location'],
                status=duty_change['status'],
                order=i
            )
        
        # Return the serialized result
        result_serializer = EldLogSerializer(eld_log)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Failed to generate ELD Logs: {str(e)} ")
        return Response(
            {'error': f'Failed to generate ELD log: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_eld_log_history(request):
    """
    Get the history of ELD logs.
    """
    logs = EldLog.objects.all()[:10]  # Get last 10 logs
    serializer = EldLogSerializer(logs, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_eld_log_detail(request, log_id):
    """
    Get details of a specific ELD log.
    """
    try:
        log = EldLog.objects.get(id=log_id)
        serializer = EldLogSerializer(log)
        return Response(serializer.data)
    except EldLog.DoesNotExist:
        return Response(
            {'error': 'ELD log not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
def delete_eld_log(request, log_id):
    """
    Delete a specific ELD log and return a JSON confirmation.
    """
    try:
        log = EldLog.objects.get(id=log_id)
        log.delete()
        return Response(
            {"detail": "ELD log deleted successfully", "id": log_id},
            status=status.HTTP_200_OK
        )
    except EldLog.DoesNotExist:
        return Response(
            {'error': 'ELD log not found'},
            status=status.HTTP_404_NOT_FOUND
        )

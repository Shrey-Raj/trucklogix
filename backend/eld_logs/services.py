from typing import Dict, List
from datetime import datetime, timedelta
import re


class EldLogService:
    """
    Service class for ELD log generation and HOS calculations.
    """
    
    # HOS limits (in hours)
    MAX_DRIVING_HOURS = 11
    MAX_ON_DUTY_HOURS = 14
    MAX_CYCLE_HOURS = 70  # 70 hours in 8 days
    
    def generate_log(self, log_data: Dict) -> Dict:
        """
        Generate an ELD log with visual timeline and remaining hours calculation.
        """
        log_sheet = self._generate_log_sheet(log_data)
        remaining_hours = self._calculate_remaining_hours(log_data)
        
        return {
            'log_sheet': log_sheet,
            'remaining_hours': remaining_hours
        }
    
    def _generate_log_sheet(self, log_data: Dict) -> str:
        """Generate a formatted ELD log sheet."""
        date_str = log_data['date'].strftime('%m/%d/%Y')
        
        log_sheet = f"""
ELECTRONIC LOGGING DEVICE (ELD) DAILY LOG

Driver: {log_data['driver_name']}
Date: {date_str}
Truck/Tractor Number: {log_data['truck_number']}
Trailer Number: {log_data['trailer_number']}
Carrier: {log_data['carrier_name']}
Home Terminal Timezone: {log_data['home_terminal_timezone']}
Shipping Documents: {log_data['shipping_document_numbers']}

TRIP INFORMATION:
Current Location: {log_data['current_location']}
Pickup Location: {log_data['pickup_location']}
Dropoff Location: {log_data['dropoff_location']}
Cycle Hours Used (Start of Day): {log_data['cycle_hours_used']}

DUTY STATUS CHANGES:
"""
        
        for change in log_data['duty_status_changes']:
            log_sheet += f"- Time: {change['time']}, Location: {change['location']}, Status: {change['status']}\n"
        
        # Add HOS summary
        driving_hours, on_duty_hours = self._calculate_daily_hours(log_data['duty_status_changes'])
        
        log_sheet += f"""
HOURS OF SERVICE SUMMARY:
Daily Driving Hours: {driving_hours:.1f}
Daily On-Duty Hours: {on_duty_hours:.1f}
Cycle Hours Used: {log_data['cycle_hours_used']:.1f}

COMPLIANCE STATUS: {"✓ COMPLIANT" if self._check_compliance(log_data) else "⚠ VIOLATION"}

This log was generated electronically and complies with FMCSA ELD regulations.
"""
        
        return log_sheet.strip()
    
    def _calculate_remaining_hours(self, log_data: Dict) -> Dict:
        """Calculate remaining driving and on-duty hours."""
        driving_hours, on_duty_hours = self._calculate_daily_hours(log_data['duty_status_changes'])
        
        remaining_driving = max(0, self.MAX_DRIVING_HOURS - driving_hours)
        remaining_on_duty = max(0, self.MAX_ON_DUTY_HOURS - on_duty_hours)
        
        # Also consider cycle hours
        cycle_remaining = max(0, self.MAX_CYCLE_HOURS - log_data['cycle_hours_used'] - on_duty_hours)
        
        # The actual remaining hours is the minimum of daily and cycle limits
        remaining_driving = min(remaining_driving, cycle_remaining)
        remaining_on_duty = min(remaining_on_duty, cycle_remaining)
        
        return {
            'driving_hours': round(remaining_driving, 1),
            'on_duty_hours': round(remaining_on_duty, 1)
        }
    
    def _calculate_daily_hours(self, duty_status_changes: List[Dict]) -> tuple:
        """Calculate total driving and on-duty hours for the day."""
        if not duty_status_changes:
            return 0.0, 0.0
        
        driving_hours = 0.0
        on_duty_hours = 0.0
        
        # Sort changes by time
        sorted_changes = sorted(duty_status_changes, key=lambda x: self._time_to_minutes(x['time']))
        
        for i in range(len(sorted_changes) - 1):
            current_change = sorted_changes[i]
            next_change = sorted_changes[i + 1]
            
            duration = self._calculate_duration(current_change['time'], next_change['time'])
            
            if current_change['status'] == 'Driving':
                driving_hours += duration
                on_duty_hours += duration
            elif current_change['status'] == 'On Duty (Not Driving)':
                on_duty_hours += duration
        
        return driving_hours, on_duty_hours
    
    def _time_to_minutes(self, time_str: str) -> int:
        """Convert time string like '7:30 a.m.' to minutes since midnight."""
        # Parse time string
        match = re.match(r'(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)', time_str.lower())
        if not match:
            return 0
        
        hours = int(match.group(1))
        minutes = int(match.group(2))
        period = match.group(3)
        
        # Convert to 24-hour format
        if period == 'p.m.' and hours != 12:
            hours += 12
        elif period == 'a.m.' and hours == 12:
            hours = 0
        
        return hours * 60 + minutes
    
    def _calculate_duration(self, start_time: str, end_time: str) -> float:
        """Calculate duration in hours between two time strings."""
        start_minutes = self._time_to_minutes(start_time)
        end_minutes = self._time_to_minutes(end_time)
        
        # Handle day rollover
        if end_minutes < start_minutes:
            end_minutes += 24 * 60
        
        duration_minutes = end_minutes - start_minutes
        return duration_minutes / 60.0
    
    def _check_compliance(self, log_data: Dict) -> bool:
        """Check if the log is compliant with HOS regulations."""
        driving_hours, on_duty_hours = self._calculate_daily_hours(log_data['duty_status_changes'])
        
        # Check daily limits
        if driving_hours > self.MAX_DRIVING_HOURS:
            return False
        if on_duty_hours > self.MAX_ON_DUTY_HOURS:
            return False
        
        # Check cycle limits
        total_cycle_hours = log_data['cycle_hours_used'] + on_duty_hours
        if total_cycle_hours > self.MAX_CYCLE_HOURS:
            return False
        
        return True
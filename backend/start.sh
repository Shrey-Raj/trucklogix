#!/usr/bin/env bash
set -o errexit

# Run database migrations
python manage.py migrate

# Start Gunicorn
gunicorn trucklogix.wsgi:application --bind 0.0.0.0:$PORT --timeout 180
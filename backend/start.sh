#!/usr/bin/env bash
set -o errexit

python manage.py migrate
gunicorn trucklogix.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 180
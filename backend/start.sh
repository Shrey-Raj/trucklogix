#!/usr/bin/env bash
set -o errexit

# Verify spaCy model
python -c "import spacy; spacy.load('en_core_web_sm')" || exit 1

python manage.py migrate
gunicorn brandmonitor.wsgi:application --bind 0.0.0.0:$PORT --timeout 180
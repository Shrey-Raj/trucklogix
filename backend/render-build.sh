#!/usr/bin/env bash
set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Uncomment if using static files
# python manage.py collectstatic --noinput
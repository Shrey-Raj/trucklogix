"""
WSGI config for trucklogix project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'trucklogix.settings')

application = get_wsgi_application()
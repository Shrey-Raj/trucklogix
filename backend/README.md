# TruckLogix Django Backend

This is the Django REST API backend for the TruckLogix trucking logistics application.

## Features

- Route optimization API with fuel and rest stop recommendations
- ELD (Electronic Logging Device) log generation with HOS compliance
- RESTful API endpoints for frontend integration
- Admin interface for data management

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

6. Run the development server:
```bash
python manage.py runserver 8000
```

## API Endpoints

### Route Optimization
- `POST /api/routes/optimize/` - Optimize a route
- `GET /api/routes/history/` - Get route history
- `GET /api/routes/{id}/` - Get specific route details

### ELD Logs
- `POST /api/eld-logs/generate/` - Generate an ELD log
- `GET /api/eld-logs/history/` - Get ELD log history
- `GET /api/eld-logs/{id}/` - Get specific ELD log details
- `DELETE /api/eld-logs/{id}/delete/` - Delete an ELD log

## Admin Interface

Access the admin interface at `http://localhost:8000/admin/` to manage data through a web interface.

## Development

The backend uses Django REST Framework for API development and includes:
- Model serializers for data validation
- Service classes for business logic
- Admin interface for data management
- CORS configuration for frontend integration
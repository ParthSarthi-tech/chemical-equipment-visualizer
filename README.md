# Chemical Equipment Parameter Visualizer

A hybrid web application for data visualization and analytics of chemical equipment. Built with Django REST Framework backend and React.js frontend.

## Project Structure

```
chemical-equipment-visualizer/
├── backend/                 # Django REST API
│   ├── config/             # Django project settings
│   ├── api/                # Main API app
│   └── manage.py
├── frontend/               # React.js Web Application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   └── lib/               # Utilities and state management
└── sample_equipment_data.csv  # Sample data for testing
```

## Features

- CSV file upload with validation
- Data summary and statistics (count, averages, min/max)
- Interactive charts (Bar, Pie, Line, Radar)
- Equipment type distribution analysis
- Upload history (last 5 datasets)
- PDF report generation
- Basic authentication
- Demo mode (works without backend)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload/` | POST | Upload CSV file |
| `/api/history/` | GET | Get last 5 uploads |
| `/api/report/<id>/` | GET | Download PDF report |

All endpoints require Basic Authentication.

## CSV Format

Required columns:
- Equipment Name
- Type
- Flowrate
- Pressure
- Temperature

## Tech Stack

- **Backend**: Django 5.x, Django REST Framework, Pandas
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Recharts, Zustand
- **Database**: SQLite
- **Auth**: Basic Authentication

## Demo Credentials

When backend is unavailable, use demo mode:
- Username: `admin`
- Password: `admin123`

## Author

Parth Sarthi - 2nd Year Full Stack Project

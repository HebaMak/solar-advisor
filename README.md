# Solar Advisor – Solar Sites Assessment

A full-stack web application for solar advisors to manage client sites, estimate solar energy production, and compare household self-consumption with and without a home battery.

## Features

- **User authentication:** Register, log in, and log out securely.
- **Site management:** Create, view, update, and delete client solar sites.
- **User-specific data:** Advisors can only access their own sites.
- **Solar production estimates:** Calculate estimated yearly and monthly production using the European Commission's PVGIS API.
- **Battery comparison:** Compare self-consumption and grid usage with and without a home battery.
- **Responsive dashboard:** View site information, production charts, and battery analysis.

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- HTTPX

### Authentication and Security
- Password hashing using `pwdlib`.
- Session-based authentication using signed HTTP-only cookies.
- CSRF protection using a session-specific token.
- Site ownership checks to prevent users from accessing other advisors' data.

### External Data Source
- European Commission **PVGIS API** (Photovoltaic Geographical Information System).
- No API key is required.
- All PVGIS requests are made through the Python backend.

## Project Structure

```text
Solar-assessment/
│
├── backend/
│   ├── auth.py
│   ├── battery.py
│   ├── config.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── pvgis.py
│   ├── requirements.txt
│   ├── schemas.py
│   ├── security.py
│   └── sites.py
│
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.ts
│
├── .dockerignore
├── Dockerfile
└── README.md
```

## Running the Application with Docker

Docker is used to build and run the complete application in a single container.

### Requirements

- Docker Desktop or Docker Engine.

### 1. Build the Docker image

Run this command from the root project directory:

```bash
docker build -t solar .
```

The Docker build:
- Installs frontend dependencies and builds the React application.
- Installs Python backend dependencies.
- Copies the frontend production build into the backend image.

### 2. Run the application

```bash
docker run -p 8000:8000 solar
```

### 3. Open the application

Visit:

http://localhost:8000

Register a new advisor account to start using the application.

The application uses SQLite. The default database is created inside the container. For persistent data between container replacements, mount a Docker volume and configure `DATABASE_URL`.

## Running the Application for Development

### Backend

From the project root:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs at:

http://localhost:8000

API documentation is available at:

http://localhost:8000/docs

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server runs at:

http://localhost:5173

## API Overview

All application API endpoints use the `/api` prefix.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register a new advisor |
| POST | `/api/login` | Log in |
| POST | `/api/logout` | Log out |
| GET | `/api/me` | Get the authenticated advisor |
| GET | `/api/sites` | List the advisor's sites |
| POST | `/api/sites` | Create a site |
| GET | `/api/sites/{id}` | Get a site |
| PUT | `/api/sites/{id}` | Update a site |
| DELETE | `/api/sites/{id}` | Delete a site |
| GET | `/api/sites/{id}/production` | Get solar production estimates |
| GET | `/api/sites/{id}/battery` | Calculate battery impact |

Protected endpoints require an authenticated session. State-changing requests also require the CSRF token in the `X-CSRF-Token` header.

## Solar Production Calculation

Solar production estimates are retrieved from the European Commission's PVGIS API.

The application uses the PVGIS `PVcalc` endpoint to retrieve:
- Estimated yearly energy production in kWh.
- Estimated monthly energy production in kWh.

The calculation uses the site's:
- Latitude and longitude.
- Installed peak power (kWp).
- A system loss assumption of 14%.

The monthly results are displayed in the dashboard.

The optional roof area is stored as site information but is not currently used directly in the PVGIS calculation.

## Battery Calculation

The battery analysis compares household energy consumption and solar production under two scenarios:

1. **Without a battery:** Solar energy is used directly when it is produced. Any surplus is exported to the grid, and additional demand is imported from the grid.
2. **With a battery:** Surplus solar energy can be stored and used later when solar production is insufficient.

The calculation uses hourly solar production data retrieved from the PVGIS `seriescalc` endpoint for 2023.

### Assumptions

- Annual household electricity consumption is provided by the user.
- Consumption is distributed evenly across the 8,760 hours of the simulation year.
- Battery charging efficiency: 95%.
- Battery discharging efficiency: 95%.
- Battery capacity is provided by the user in kWh.

The results include:
- Total solar production.
- Total household consumption.
- Self-consumed solar energy.
- Grid electricity imported.
- Solar energy exported.
- Self-consumption percentage.
- Self-sufficiency percentage.

**Note:** This is a simplified energy model. It assumes constant hourly household consumption and does not model seasonal changes in household demand, battery degradation, or battery power limits.

## Validation and Error Handling

- Required site fields are validated by the backend.
- Latitude and longitude are checked against valid geographic ranges.
- Peak power must be greater than zero.
- Optional roof area must be greater than zero when provided.
- Duplicate email addresses cannot be registered.
- Invalid login credentials are rejected.
- Users cannot access or modify sites belonging to other advisors.
- PVGIS connection errors and unavailable production data are handled by the backend.

## Future Improvements

- More realistic household consumption profiles.
- Configurable battery charging and discharging power limits.
- Support for additional solar system parameters.
- Automated backend and frontend tests.
- More detailed production and consumption reports.

## Author

Developed as part of the Praeter Full-Stack Developer Assessment.
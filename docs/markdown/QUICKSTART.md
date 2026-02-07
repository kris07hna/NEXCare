# NexCare-5G EdgeServer MVP - Quick Start Guide

## Overview
NexCare-5G is a complete 5G-powered edge healthcare monitoring system with AI-based patient monitoring for neonatal care (NeoCare) and geriatric fall detection (GeriCare).

## MVP Features
✅ Real-time patient monitoring dashboard
✅ NeoCare AI - Neonatal/infant monitoring
✅ GeriCare AI - Elderly fall detection
✅ Patient management (CRUD operations)
✅ WebRTC video consultations
✅ Role-based access control
✅ Hybrid database (SQLite + optional Supabase cloud sync)
✅ RESTful API with 10 endpoints
✅ Real-time room status tracking
✅ Alert system for critical events
✅ Analytics dashboard
✅ Staff scheduling
✅ System diagnostics

## Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# (Optional) Install Python dependencies for AI agents
cd ai_agents
pip install -r requirements.txt
cd ..
```

### 2. Initialize Database

```bash
# Seed database with sample data
npm run seed
```

### 3. Start the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at http://localhost:3000

### 4. Login

Use one of the demo accounts:

**Master Control (Full Access)**
- Email: admin@edgecare.local
- Password: admin123

**Doctor**
- Email: doctor@edgecare.local
- Password: doctor123

**NeoCare Specialist**
- Email: neocare@edgecare.local
- Password: neo123

**GeriCare Monitor**
- Email: gericare@edgecare.local
- Password: geri123

**Room Monitor**
- Email: monitor@edgecare.local
- Password: monitor123

## AI Agents (Optional)

The AI agents run independently and send data to the edge server via API.

### Start NeoCare Agent

```bash
cd ai_agents
python neocare_agent.py --room R2 --server http://localhost:3000 --mock
```

### Start GeriCare Agent

```bash
cd ai_agents
python gericare_agent.py --room R5 --server http://localhost:3000 --mock
```

The `--mock` flag enables mock detection mode (no camera required for testing).

## Available Pages

- `/` - Main dashboard with live room monitoring
- `/neocare` - NeoCare specialist dashboard
- `/gericare` - GeriCare specialist dashboard
- `/patients` - Patient management
- `/consultations` - Video consultation hub
- `/consultation/[id]` - Active video call interface
- `/analytics` - Analytics and reporting
- `/room-monitoring` - Live video feeds
- `/diagnostics` - System health monitoring
- `/schedule` - Staff scheduling
- `/login` - Authentication

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/rooms` - Get all room statuses
- `POST /api/reports` - Create AI detection report
- `GET /api/reports` - Get AI reports with filters
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient
- `POST /api/consultations` - Start consultation
- `GET /api/consultations` - Get consultations
- `PATCH /api/consultations/[id]/end` - End consultation
- `POST /api/webrtc/signal` - WebRTC signaling
- `GET /api/webrtc/signal/[peerId]` - Get pending signals

## Database

The application uses SQLite by default for offline-first operation. Database file is located at `./data/edgecare.db`.

### Database Scripts

```bash
# Seed database with sample data
npm run seed

# Push schema changes
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## Environment Variables

Configure in `.env.local`:

```
DATABASE_PATH=./data/edgecare.db
OFFLINE_MODE=true
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
WEBRTC_ICE_SERVERS=[]
```

## Features by Role

### Master Control
- Full access to all dashboards
- Patient management
- Consultations
- Analytics
- System diagnostics

### Doctor
- Video consultations
- Patient records
- Consultation history
- Schedule management

### NeoCare Specialist
- Neonatal monitoring dashboard
- Infant patient records
- Critical alerts for babies
- Sleep pattern tracking

### GeriCare Monitor
- Elderly patient monitoring
- Fall detection alerts
- Activity tracking
- Risk assessment

### Room Monitor
- Live room status
- Real-time vitals
- Camera feeds
- Alert notifications

## Architecture

### Frontend
- Next.js 16.1.6 with App Router
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- Framer Motion for animations
- Recharts for analytics

### Backend
- Next.js API Routes
- SQLite with Drizzle ORM
- WebRTC for peer-to-peer video
- Real-time updates via polling (2-second intervals)

### AI Agents (Python)
- YOLOv8 for object detection and pose estimation
- OpenCV for image processing
- DeepSORT for multi-object tracking (optional)
- Mock mode for testing without cameras

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Seed database
npm run seed

# Database management
npm run db:push
npm run db:studio
```

## Testing the MVP

### 1. Test Dashboard
1. Login as admin@edgecare.local
2. View main dashboard - should show room statuses
3. Check online/offline room indicators

### 2. Test Patient Management
1. Go to /patients
2. Create a new patient
3. Edit patient details
4. View patient profile

### 3. Test NeoCare
1. Login as neocare@edgecare.local
2. Go to /neocare
3. View infant monitoring cards
4. Check AI confidence levels
5. Monitor vitals (HR, SpO2)

### 4. Test GeriCare
1. Login as gericare@edgecare.local
2. Go to /gericare
3. View elderly patient tracking
4. Check fall detection status
5. Review activity logs

### 5. Test Video Consultations
1. Login as doctor@edgecare.local
2. Go to /consultations
3. Start a new consultation
4. Test audio/video controls
5. End consultation with notes

### 6. Test AI Agents
1. Start NeoCare agent in mock mode
2. Watch dashboard update with AI reports
3. Verify confidence percentages
4. Check alert levels

## Troubleshooting

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Database Issues
```bash
# Delete and reinitialize database
rm -rf data/edgecare.db
npm run seed
```

### Port Already in Use
```bash
# Change port in .env.local
PORT=3001
```

### AI Agent Connection Issues
- Verify server URL is correct
- Check firewall settings
- Ensure API endpoint /api/reports is accessible

## Production Deployment

### Build Production Version
```bash
npm run build
npm start
```

### Environment Setup
1. Set `NODE_ENV=production` in .env
2. Configure proper database path
3. Set up HTTPS/TLS if required
4. Configure WebRTC ICE servers for production
5. Enable cloud sync if using Supabase

## Next Steps

- Add real camera integration for AI agents
- Implement video recording for consultations
- Add automated tests
- Set up cloud sync with Supabase
- Implement proper authentication (JWT/OAuth)
- Add rate limiting and security hardening
- Configure HTTPS for production
- Add data export functionality
- Implement pagination for large datasets

## Support

For issues and questions, refer to the codebase documentation or create an issue in the repository.

## License

EdgeCare-5G MVP - Healthcare Monitoring System

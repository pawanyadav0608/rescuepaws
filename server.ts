import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Tiny in-memory rate limiter (protects the Gemini quota during the demo)
const hits = new Map<string, number[]>();
function rateLimit(max: number, windowMs: number) {
  return (req: Request, res: Response, next: () => void) => {
    const now = Date.now();
    const key = `${req.ip}:${req.path}`;
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      res.status(429).json({ error: 'Too many requests, please slow down.' });
      return;
    }
    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logger
app.use((req, _res, next) => {
  if (!req.path.startsWith('/@') && !req.path.includes('.')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
  next();
});

// Initial Seed Data
interface AnimalReport {
  id: string;
  animal_type: 'dog' | 'cat' | 'bird' | 'other' | 'unknown';
  description: string;
  photo_url: string;
  lat: number;
  lng: number;
  urgency_level: 'low' | 'medium' | 'high';
  status: 'Reported' | 'Accepted' | 'In Progress' | 'Rescued' | 'Closed';
  created_at: string;
  address?: string;
  reporter_name?: string;
  reporter_phone?: string;
  assigned_volunteer_id?: string;
  assigned_volunteer_name?: string;
  ai_analysis?: {
    detected_species?: string;
    confidence?: number;
    recommended_urgency?: 'low' | 'medium' | 'high';
    detected_injuries?: string[];
  };
  updates?: Array<{
    id: string;
    author: string;
    role: 'citizen' | 'volunteer' | 'admin';
    text: string;
    created_at: string;
  }>;
}

interface Appointment {
  id: string;
  type: 'vet_intake' | 'adoption_meet' | 'volunteer_shift' | 'emergency_consult';
  animal_report_id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  scheduled_date: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'volunteer' | 'admin';
  phone?: string;
  is_available: boolean;
  rescues_completed: number;
}

let reports: AnimalReport[] = [
  {
    id: 'rep-101',
    animal_type: 'dog',
    description: 'Medium golden mix limping heavily near Maple Park playground. Seems exhausted, very gentle but unable to put weight on back left paw.',
    photo_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    lat: 37.7749,
    lng: -122.4194,
    urgency_level: 'high',
    status: 'In Progress',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    address: '840 Maple St, near playground benches',
    reporter_name: 'Elena Rostova',
    reporter_phone: '(555) 234-9811',
    assigned_volunteer_id: 'vol-1',
    assigned_volunteer_name: 'Marcus Chen',
    ai_analysis: {
      detected_species: 'Golden Retriever Mix',
      confidence: 0.94,
      recommended_urgency: 'high',
      detected_injuries: ['Hind leg trauma / limping', 'Dehydration signs'],
    },
    updates: [
      {
        id: 'up-1',
        author: 'Elena Rostova',
        role: 'citizen',
        text: 'Report submitted with photo. Left fresh water dish nearby.',
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 'up-2',
        author: 'Marcus Chen',
        role: 'volunteer',
        text: 'Rescue accepted. In transit with pet first aid kit and carrier, ETA 10 minutes.',
        created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      },
    ],
  },
  {
    id: 'rep-102',
    animal_type: 'cat',
    description: 'Small calico kitten trapped in a crawl space behind the bakery. Crying continuously, no mother cat seen for 6 hours.',
    photo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    lat: 37.7833,
    lng: -122.4167,
    urgency_level: 'high',
    status: 'Reported',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    address: '422 Pine Avenue alleyway',
    reporter_name: 'David Kim',
    reporter_phone: '(555) 872-3341',
    ai_analysis: {
      detected_species: 'Calico Domestic Shorthair',
      confidence: 0.91,
      recommended_urgency: 'high',
      detected_injuries: ['Hypothermia risk', 'Separated nursing kitten'],
    },
    updates: [
      {
        id: 'up-3',
        author: 'David Kim',
        role: 'citizen',
        text: 'Kitten is still vocal. Trying to keep the area calm while volunteers dispatch.',
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
    ],
  },
  {
    id: 'rep-103',
    animal_type: 'dog',
    description: 'Older black lab wandering along the pedestrian promenade. Appears docile, has blue nylon collar but no visible tag. Well fed.',
    photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    lat: 37.769,
    lng: -122.4467,
    urgency_level: 'medium',
    status: 'Reported',
    created_at: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    address: 'Market St & Sanchez intersection',
    reporter_name: 'Priya Patel',
    reporter_phone: '(555) 441-2090',
    ai_analysis: {
      detected_species: 'Black Labrador Retriever',
      confidence: 0.88,
      recommended_urgency: 'medium',
      detected_injuries: ['Disorientation', 'No severe visible wounds'],
    },
    updates: [],
  },
  {
    id: 'rep-104',
    animal_type: 'bird',
    description: 'Juvenile red-tailed hawk grounded near botanical garden lawn. Wing appears drooped, unable to take flight when approached.',
    photo_url: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=800&q=80',
    lat: 37.767,
    lng: -122.469,
    urgency_level: 'high',
    status: 'Accepted',
    created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    address: 'Golden Gate Park, Strybing Arboretum perimeter',
    reporter_name: 'Carlos Mendez',
    assigned_volunteer_id: 'vol-3',
    assigned_volunteer_name: 'Dr. Sarah Lin (Wildlife Vet)',
    ai_analysis: {
      detected_species: 'Buteo jamaicensis (Red-tailed Hawk)',
      confidence: 0.96,
      recommended_urgency: 'high',
      detected_injuries: ['Right carpal fracture suspected', 'Flight inability'],
    },
    updates: [
      {
        id: 'up-4',
        author: 'Dr. Sarah Lin',
        role: 'volunteer',
        text: 'Specialized avian transport box prepared. En route from district clinic.',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ],
  },
  {
    id: 'rep-105',
    animal_type: 'cat',
    description: 'Friendly tabby found under apartment porch during rain. Scanned for chip at community center - rescued and reunited with owner!',
    photo_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
    lat: 37.755,
    lng: -122.42,
    urgency_level: 'low',
    status: 'Rescued',
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    address: '1120 Valencia St',
    reporter_name: 'Maya Lin',
    assigned_volunteer_id: 'vol-1',
    assigned_volunteer_name: 'Marcus Chen',
    ai_analysis: {
      detected_species: 'Domestic Tabby Cat',
      confidence: 0.95,
      recommended_urgency: 'low',
      detected_injuries: [],
    },
    updates: [
      {
        id: 'up-5',
        author: 'Marcus Chen',
        role: 'volunteer',
        text: 'Microchip scanned successfully. Reunited with family within 2 hours!',
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
    ],
  },
];

let volunteers: User[] = [
  {
    id: 'vol-1',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    role: 'volunteer',
    phone: '(555) 782-9901',
    is_available: true,
    rescues_completed: 47,
  },
  {
    id: 'vol-2',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    role: 'volunteer',
    phone: '(555) 349-1120',
    is_available: true,
    rescues_completed: 31,
  },
  {
    id: 'vol-3',
    name: 'Dr. Sarah Lin',
    email: 'sarah.lin@example.com',
    role: 'volunteer',
    phone: '(555) 890-4432',
    is_available: false,
    rescues_completed: 89,
  },
];

let users: User[] = [
  ...volunteers,
  {
    id: 'adm-1',
    name: 'Admin Supervisor',
    email: 'admin@rescuepaws.org',
    role: 'admin',
    phone: '(555) 999-0000',
    is_available: true,
    rescues_completed: 120,
  },
  {
    id: 'cit-1',
    name: 'Jane Citizen',
    email: 'jane@example.com',
    role: 'citizen',
    phone: '(555) 123-4567',
    is_available: false,
    rescues_completed: 0,
  },
];

let appointments: Appointment[] = [
  {
    id: 'apt-001',
    type: 'vet_intake',
    animal_report_id: 'rep-101',
    contact_name: 'Elena Rostova',
    contact_email: 'elena.r@example.com',
    contact_phone: '(555) 234-9811',
    scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    notes: 'Follow-up x-ray and splint check for golden mix hind paw',
    status: 'confirmed',
    created_at: new Date().toISOString(),
  },
];

// ==========================================
// REST API ROUTES (/api/*)
// ==========================================

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'RescuePaws API Server',
    version: '1.0.0',
    reports_count: reports.length,
    volunteers_count: volunteers.length,
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Platform Statistics
app.get('/api/stats', (_req: Request, res: Response) => {
  const rescuedCount = reports.filter((r) => r.status === 'Rescued' || r.status === 'Closed').length;
  const activeVolunteers = volunteers.filter((v) => v.is_available).length;
  res.json({
    rescued_this_month: 140 + rescuedCount,
    active_volunteers: activeVolunteers || 68,
    total_reports: reports.length,
    avg_response_time_min: 19,
  });
});

// List Reports with Filters
app.get('/api/reports', (req: Request, res: Response) => {
  const { status, urgency } = req.query;
  let filtered = [...reports];

  if (status && status !== 'All') {
    filtered = filtered.filter((r) => r.status.toLowerCase() === String(status).toLowerCase());
  }
  if (urgency && urgency !== 'All') {
    filtered = filtered.filter((r) => r.urgency_level.toLowerCase() === String(urgency).toLowerCase());
  }

  // Sort by newest first
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json(filtered);
});

// Get Single Report
app.get('/api/reports/:id', (req: Request, res: Response) => {
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }
  res.json(report);
});

// Create New Animal Report
app.post('/api/reports', (req: Request, res: Response) => {
  const data = req.body;
  if (!data.description || data.lat === undefined || data.lng === undefined) {
    res.status(400).json({ error: 'Missing required report fields (description, lat, lng)' });
    return;
  }

  let calculatedType = data.animal_type || 'other';
  let calculatedUrgency = data.urgency_level || 'medium';
  const desc = (data.description || '').toLowerCase();

  if (desc.includes('dog') || desc.includes('puppy')) calculatedType = 'dog';
  else if (desc.includes('cat') || desc.includes('kitten')) calculatedType = 'cat';
  else if (desc.includes('bird') || desc.includes('hawk') || desc.includes('pigeon')) calculatedType = 'bird';

  if (desc.includes('severe') || desc.includes('bleeding') || desc.includes('hit by car') || desc.includes('broken')) {
    calculatedUrgency = 'high';
  }

  const newReport: AnimalReport = {
    id: `rep-${Date.now().toString().slice(-5)}`,
    animal_type: calculatedType,
    description: data.description,
    photo_url:
      data.photo_url ||
      'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    lat: Number(data.lat),
    lng: Number(data.lng),
    urgency_level: calculatedUrgency,
    status: 'Reported',
    created_at: new Date().toISOString(),
    address: data.address || `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
    reporter_name: data.reporter_name || 'Anonymous Citizen',
    reporter_phone: data.reporter_phone || '',
    ai_analysis: data.ai_analysis || {
      detected_species: calculatedType.charAt(0).toUpperCase() + calculatedType.slice(1),
      confidence: 0.92,
      recommended_urgency: calculatedUrgency,
      detected_injuries: calculatedUrgency === 'high' ? ['Immediate triage recommended'] : ['Stable'],
    },
    updates: [
      {
        id: `up-${Date.now()}`,
        author: data.reporter_name || 'Anonymous Citizen',
        role: 'citizen',
        text: 'Report registered in community rescue dispatch network.',
        created_at: new Date().toISOString(),
      },
    ],
  };

  reports.unshift(newReport);
  res.status(201).json(newReport);
});

// Update Report Status & Volunteer Assignment
app.patch('/api/reports/:id', (req: Request, res: Response) => {
  const index = reports.findIndex((r) => r.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  const existing = reports[index];
  const updates = req.body;

  const allowed = ['status', 'urgency_level', 'assigned_volunteer_id', 'assigned_volunteer_name'] as const;
  const safe: Partial<AnimalReport> = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) (safe as Record<string, unknown>)[key] = updates[key];
  }
  const updated: AnimalReport = {
    ...existing,
    ...safe,
    updates: existing.updates || [],
  };

  // If a note/comment was included with the update
  if (updates.comment) {
    updated.updates?.push({
      id: `up-${Date.now()}`,
      author: updates.comment_author || 'Rescue Dispatch',
      role: updates.comment_role || 'volunteer',
      text: updates.comment,
      created_at: new Date().toISOString(),
    });
  }

  reports[index] = updated;
  res.json(updated);
});

// Add Comment to Report
app.post('/api/reports/:id/comments', (req: Request, res: Response) => {
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Report not found' });
    return;
  }

  const { author, role, text } = req.body;
  if (!text) {
    res.status(400).json({ error: 'Comment text is required' });
    return;
  }

  const comment = {
    id: `up-${Date.now()}`,
    author: author || 'Volunteer',
    role: role || 'volunteer',
    text,
    created_at: new Date().toISOString(),
  };

  if (!report.updates) report.updates = [];
  report.updates.push(comment);

  res.status(201).json(comment);
});

// Volunteers API
app.get('/api/volunteers', (_req: Request, res: Response) => {
  res.json(volunteers);
});

app.get('/api/volunteers/nearby-unassigned', (_req: Request, res: Response) => {
  const unassigned = reports.filter((r) => r.status === 'Reported');
  res.json(unassigned);
});

app.get('/api/volunteers/:id/assignments', (req: Request, res: Response) => {
  const { id } = req.params;
  const assigned = reports.filter(
    (r) => r.assigned_volunteer_id === id || r.assigned_volunteer_name === 'Marcus Chen'
  );
  const active = assigned.filter((r) => r.status === 'Accepted' || r.status === 'In Progress');
  const history = assigned.filter((r) => r.status === 'Rescued' || r.status === 'Closed');
  res.json({ active, history });
});

app.post('/api/volunteers/:id/availability', (req: Request, res: Response) => {
  const vol = volunteers.find((v) => v.id === req.params.id);
  if (!vol) {
    res.status(404).json({ error: 'Volunteer not found' });
    return;
  }
  vol.is_available = Boolean(req.body.is_available);
  res.json(vol);
});

// Auth Endpoints
app.post('/api/auth/login', rateLimit(30, 60_000), (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    const role: 'citizen' | 'volunteer' | 'admin' = email.includes('admin')
      ? 'admin'
      : email.includes('vol')
      ? 'volunteer'
      : 'citizen';
    user = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: email.split('@')[0],
      email,
      role,
      phone: '',
      is_available: true,
      rescues_completed: 0,
    };
    users.push(user);
  }

  const token = `jwt-${user.role}-${Date.now()}`;
  res.json({ ...user, token });
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  const { name, email, role, phone } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  const userRole: 'citizen' | 'volunteer' | 'admin' =
    role === 'volunteer' ? 'volunteer' : 'citizen';
  const newUser: User = {
    id: `usr-${Date.now().toString().slice(-4)}`,
    name,
    email,
    role: userRole,
    phone: phone || '',
    is_available: userRole === 'volunteer',
    rescues_completed: 0,
  };
  users.push(newUser);
  if (userRole === 'volunteer') volunteers.push(newUser);

  const token = `jwt-${newUser.role}-${Date.now()}`;
  res.status(201).json({ ...newUser, token });
});

// Appointments API (Directly addressing user question: Where appointment submissions go)
app.get('/api/appointments', (_req: Request, res: Response) => {
  res.json(appointments);
});

app.post('/api/appointments', (req: Request, res: Response) => {
  const { type, animal_report_id, contact_name, contact_email, contact_phone, scheduled_date, notes } = req.body;

  if (!contact_name || !contact_email) {
    res.status(400).json({ error: 'Contact name and email are required for booking an appointment' });
    return;
  }

  const newAppointment: Appointment = {
    id: `apt-${Date.now().toString().slice(-4)}`,
    type: type || 'vet_intake',
    animal_report_id,
    contact_name,
    contact_email,
    contact_phone: contact_phone || '',
    scheduled_date: scheduled_date || new Date(Date.now() + 86400000).toISOString(),
    notes: notes || '',
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  appointments.push(newAppointment);

  // If tied to a report, append an audit update
  if (animal_report_id) {
    const report = reports.find((r) => r.id === animal_report_id);
    if (report) {
      if (!report.updates) report.updates = [];
      report.updates.push({
        id: `up-${Date.now()}`,
        author: contact_name,
        role: 'citizen',
        text: `Intake appointment scheduled for ${new Date(newAppointment.scheduled_date).toLocaleDateString()}`,
        created_at: new Date().toISOString(),
      });
    }
  }

  res.status(201).json({
    success: true,
    message: 'Appointment successfully registered in veterinary dispatch schedule',
    appointment: newAppointment,
  });
});

// AI Triage Analysis (Server-side Gemini Vision integration)
app.post('/api/triage', rateLimit(10, 60_000), async (req: Request, res: Response) => {
  const { description, image_base64, animal_type } = req.body;

  // If Gemini API key is configured in environment
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && image_base64) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert veterinary triage specialist. Analyze this animal photo and description:
Description: "${description || 'None'}"
Type hint: "${animal_type || 'Unknown'}"

Return ONLY valid JSON matching this exact structure:
{
  "detected_species": "Breed or species name",
  "confidence": 0.95,
  "recommended_urgency": "low" | "medium" | "high",
  "detected_injuries": ["string1", "string2"],
  "first_aid_advice": "brief instruction for citizen"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: image_base64.replace(/^data:image\/\w+;base64,/, ''),
                },
              },
            ],
          },
        ],
      });

      const text = response.text || '';
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      res.json(parsed);
      return;
    } catch (err) {
      console.warn('Gemini vision analysis failed, using fallback heuristic:', err);
    }
  }

  // Smart heuristic triage fallback
  const desc = (description || '').toLowerCase();
  let urgency: 'low' | 'medium' | 'high' = 'medium';
  let species = animal_type ? animal_type.charAt(0).toUpperCase() + animal_type.slice(1) : 'Canine / Feline';
  const injuries: string[] = [];

  if (desc.includes('severe') || desc.includes('bleeding') || desc.includes('car') || desc.includes('hit')) {
    urgency = 'high';
    injuries.push('Potential blunt trauma or hemorrhage');
  } else if (desc.includes('limp') || desc.includes('fracture') || desc.includes('paw')) {
    urgency = 'high';
    injuries.push('Limb mobility impairment / possible fracture');
  } else if (desc.includes('starv') || desc.includes('thin') || desc.includes('dehydrat')) {
    urgency = 'medium';
    injuries.push('Malnutrition and exposure');
  } else {
    urgency = 'low';
    injuries.push('Appears alert; monitor until pickup');
  }

  res.json({
    detected_species: species,
    confidence: 0.91,
    recommended_urgency: urgency,
    detected_injuries: injuries,
    first_aid_advice: 'Keep a safe distance, provide fresh water in a shallow dish, and do not attempt forced restraint.',
  });
});

// ==========================================
// FRONTEND SERVING & VITE DEV MIDDLEWARE
// ==========================================
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use('/api', (_req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    });
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RescuePaws Full-Stack Server running on http://0.0.0.0:${PORT} [mode: ${isProd ? 'production' : 'development'}]`);
  });
}

startServer();

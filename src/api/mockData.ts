import { AnimalReport, StatsData, User } from '../types';

export const INITIAL_STATS: StatsData = {
  rescued_this_month: 142,
  active_volunteers: 68,
  total_reports: 389,
  avg_response_time_min: 19,
};

export const INITIAL_REPORTS: AnimalReport[] = [
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
      detected_injuries: ['Hind leg trauma / limping', 'Dehydration signs']
    },
    updates: [
      {
        id: 'up-1',
        author: 'Elena Rostova',
        role: 'citizen',
        text: 'Report submitted with photo. Left fresh water dish nearby.',
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 'up-2',
        author: 'Marcus Chen',
        role: 'volunteer',
        text: 'Rescue accepted. In transit with pet first aid kit and carrier, ETA 10 minutes.',
        created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
      }
    ]
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
    reporter_phone: '(555) 871-3320',
    ai_analysis: {
      detected_species: 'Domestic Shorthair (Calico)',
      confidence: 0.98,
      recommended_urgency: 'high',
      detected_injuries: ['Juvenile risk', 'Enclosure entrapment']
    },
    updates: [
      {
        id: 'up-3',
        author: 'David Kim',
        role: 'citizen',
        text: 'Report created. I am waiting outside the bakery until someone arrives.',
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      }
    ]
  },
  {
    id: 'rep-103',
    animal_type: 'bird',
    description: 'Red-tailed hawk grounded with drooping left wing on school field. Alert and defending itself, needs raptor handling equipment.',
    photo_url: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=800&q=80',
    lat: 37.7650,
    lng: -122.4320,
    urgency_level: 'medium',
    status: 'Accepted',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    address: 'Lincoln High Athletics Field, South Corner',
    reporter_name: 'Coach Martinez',
    reporter_phone: '(555) 349-1102',
    assigned_volunteer_id: 'vol-2',
    assigned_volunteer_name: 'Sarah Jenkins (Avian Specialist)',
    ai_analysis: {
      detected_species: 'Buteo jamaicensis (Red-tailed Hawk)',
      confidence: 0.91,
      recommended_urgency: 'medium',
      detected_injuries: ['Wing drop / suspected fracture']
    },
    updates: [
      {
        id: 'up-4',
        author: 'Coach Martinez',
        role: 'citizen',
        text: 'Secured area around the bird so students maintain safe distance.',
        created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString()
      },
      {
        id: 'up-5',
        author: 'Sarah Jenkins',
        role: 'volunteer',
        text: 'Accepted rescue. Bringing heavy leather gloves and raptor crate.',
        created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString()
      }
    ]
  },
  {
    id: 'rep-104',
    animal_type: 'dog',
    description: 'Friendly black lab stray found roaming around residential cul-de-sac. Has collar but tag is scraped unreadable.',
    photo_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    lat: 37.7550,
    lng: -122.4080,
    urgency_level: 'low',
    status: 'Rescued',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    address: '1504 Vermont Street',
    reporter_name: 'Amara Jackson',
    reporter_phone: '(555) 774-0019',
    assigned_volunteer_id: 'vol-1',
    assigned_volunteer_name: 'Marcus Chen',
    ai_analysis: {
      detected_species: 'Labrador Retriever',
      confidence: 0.96,
      recommended_urgency: 'low',
      detected_injuries: ['No acute injury observed']
    },
    updates: [
      {
        id: 'up-6',
        author: 'Marcus Chen',
        role: 'volunteer',
        text: 'Safely secured the lab. Scanned for microchip at clinic—reunited with owner!',
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      }
    ]
  },
  {
    id: 'rep-105',
    animal_type: 'other',
    description: 'Injured raccoon stuck on top of dumpster behind supermarket. Visible cut on snout, lethargic in sunlight.',
    photo_url: 'https://images.unsplash.com/photo-1590422749897-47620246a48d?auto=format&fit=crop&w=800&q=80',
    lat: 37.7900,
    lng: -122.4010,
    urgency_level: 'medium',
    status: 'Reported',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    address: 'Pacific Market Loading Dock',
    reporter_name: 'Rajiv Patel',
    reporter_phone: '(555) 602-4411',
    ai_analysis: {
      detected_species: 'Procyon lotor (Common Raccoon)',
      confidence: 0.89,
      recommended_urgency: 'medium',
      detected_injuries: ['Facial laceration', 'Lethargy in daylight']
    },
    updates: [
      {
        id: 'up-7',
        author: 'Rajiv Patel',
        role: 'citizen',
        text: 'Market staff is leaving it undisturbed until wildlife team arrives.',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    ]
  }
];

export const DEMO_USERS: User[] = [
  {
    id: 'vol-1',
    name: 'Marcus Chen',
    email: 'marcus.chen@rescue.org',
    role: 'volunteer',
    phone: '(555) 482-1920',
    is_available: true,
    rescues_completed: 28,
    token: 'jwt-volunteer-token-abc123'
  },
  {
    id: 'admin-1',
    name: 'Chief Coordinator Sarah',
    email: 'sarah.coordinator@rescue.org',
    role: 'admin',
    phone: '(555) 999-4400',
    is_available: true,
    rescues_completed: 105,
    token: 'jwt-admin-token-xyz789'
  },
  {
    id: 'cit-1',
    name: 'Elena Rostova',
    email: 'elena@gmail.com',
    role: 'citizen',
    phone: '(555) 234-9811',
    token: 'jwt-citizen-token-cit456'
  }
];

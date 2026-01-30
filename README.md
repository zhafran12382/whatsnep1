# WhatsNep 💬

Aplikasi chat private yang mengutamakan kemudahan, keamanan, dan keindahan UI/UX.

![WhatsNep Preview](https://via.placeholder.com/800x400?text=WhatsNep+Chat+App)

## ✨ Fitur

- 🔐 **Autentikasi Aman** - Sign up/login dengan validasi username real-time
- 💬 **Real-time Chat** - Pesan terkirim instan dengan WebSocket
- 🟢 **Status Online** - Lihat siapa yang sedang online
- ⌨️ **Typing Indicator** - Tahu kapan lawan chat sedang mengetik
- 🔔 **Notifikasi** - Pesan baru dengan badge count
- 📱 **Responsive** - Sempurna di desktop, tablet, dan mobile
- 🌙 **Dark Mode** - Desain modern dengan tema gelap
- ⚡ **Fast & Smooth** - Animasi halus dengan Framer Motion

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Backend**: Supabase (Auth + Realtime Database)
- **Icons**: Lucide React
- **Routing**: React Router v6

## 📦 Instalasi

### 1. Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/username/whatsnep.git
cd whatsnep

# Install dependencies
npm install
```

### 2. Setup Supabase

1. Buat project di [Supabase](https://supabase.com)
2. Buka **SQL Editor** dan jalankan isi file `supabase-schema.sql`
3. Copy URL dan anon key dari **Settings → API**

### 3. Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit file .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Buka http://localhost:5173

## 🌐 Deploy ke Netlify

### Option 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login & Deploy
netlify login
netlify deploy --prod
```

### Option 2: Git Integration

1. Push ke GitHub
2. Connect repository di Netlify
3. Set environment variables di Netlify dashboard
4. Deploy otomatis!

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`

## 📁 Struktur Folder

```
whatsnep/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── context/         # React Context (Auth)
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Supabase client
│   ├── pages/           # Page components
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── supabase-schema.sql  # Database schema
├── netlify.toml         # Netlify config
└── package.json
```

## 🔒 Keamanan

- ✅ Password di-hash oleh Supabase Auth (bcrypt)
- ✅ Row Level Security (RLS) melindungi data
- ✅ Session-based authentication
- ✅ Auto-logout saat tab ditutup
- ✅ Input validation dengan Zod

## 📝 License

MIT License - gunakan sesuka hati!

---

Made with 💜 by WhatsNep Team

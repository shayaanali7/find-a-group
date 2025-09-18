# Group Finder

A full-stack web application that enables university students to create and join groups for course projects. The app provides secure authentication, real-time collaboration, and intelligent search features to make it easier for students to connect with peers and work together effectively.  

## 🚀 Features
- 🔐 **Authentication** – Secure user sign-up/sign-in with Supabase.  
- 💬 **Real-time Collaboration** – Live group creation, membership updates, and instant messaging.  
- 📊 **Optimized Backend** – PostgreSQL with subscriptions and database indices for reduced query times.  
- 🎨 **Responsive UI** – Built with Tailwind CSS and modular React components for cross-platform usability.  
- ⚡ **Efficient Data Handling** – React Query for caching and background synchronization, reducing unnecessary API calls.  
- 🔎 **Search & Filtering** – Robust multi-criteria system to discover posts, courses, and peers.  

## 🌐 Live Demo
👉 [Try Group Finder here](https://groupfinder-co.vercel.app)  

## 🛠️ Tech Stack
- **Frontend:** Next.js, TypeScript, React, Tailwind CSS  
- **Backend/Database:** Supabase, PostgreSQL  
- **State/Data Management:** React Query  
- **Deployment:** Vercel  

## 📂 Getting Started

### Prerequisites
- Node.js (>= 18.x)  
- npm or yarn  
- Supabase account & project setup  

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/group-finder.git

# Navigate into the project folder
cd group-finder

# Install dependencies
npm install

# Create a .env.local file and add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Run the development server
npm run dev

# TaskFlow 📋
🌐 **Live demo:** https://task-manager-iota-seven-74.vercel.app
Webová aplikace pro správu úkolů vytvořená s Next.js a Supabase.

## 🚀 Technologie

- **Frontend:** Next.js 16 (App Router), Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **Formuláře:** React Hook Form + Zod

## ✨ Funkce

- 🔐 Registrace a přihlášení uživatelů
- ✅ Vytváření, úprava a mazání úkolů
- 📅 Datum splnění pro každý úkol
- 🔄 Označení úkolu jako splněného/nesplněného
- 👑 Admin panel pro správce
- 🔒 Ochrana stránek (pouze přihlášení uživatelé)

## 🛠️ Instalace

1. Klonování repozitáře
   git clone https://github.com/Volod1aPV/task-manager.git
   cd task-manager

2. Instalace závislostí
   npm install

3. Vytvořte soubor .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Spuštění vývojového serveru
   npm run dev

## 📁 Struktura projektu

app/
├── admin/          # Admin panel
├── lib/            # Supabase klient
├── login/          # Přihlašovací stránka
├── register/       # Registrační stránka
└── tasks/          # Správa úkolů
    ├── [id]/       # Detail úkolu
    │   └── edit/   # Úprava úkolu
    └── new/        # Nový úkol

## 👤 Autor

Volodymyr Panovyk — https://github.com/Volod1aPV
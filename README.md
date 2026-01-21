DayOne 🚀

AI-powered student productivity & guidance platform

DayOne is a full-stack web app built to help students plan, think, and execute better — powered by modern frontend tooling and AI APIs. It’s designed to be fast, minimal, and actually usable, not another bloated “productivity” clone.

This project works locally, on Google AI Studio, and is production-deployed on Vercel with a custom domain.

⸻

✨ Features
	•	⚡ Modern frontend (component-based, responsive)
	•	🎨 Tailwind CSS for clean, fast styling
	•	🤖 AI-powered responses using Google AI / Gemini
	•	🔐 Secure environment variable handling
	•	🌍 Production deployment on Vercel
	•	🔗 Custom domain support
	•	🧠 Built with scalability in mind (no hardcoded junk)

⸻

🛠 Tech Stack

Frontend
	•	HTML / CSS / JavaScript
	•	Tailwind CSS
	•	Component-based UI architecture

Backend / AI
	•	Google AI (Gemini)
	•	API-based prompt + response handling

Deployment
	•	Vercel (Git-based deployment)
	•	Custom domain with DNS configuration

⸻

📁 Project Structure

.
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components / routes
│   ├── styles/          # Tailwind & global styles
│   ├── utils/           # Helpers & API logic
│   └── main.js          # App entry point
│
├── public/              # Static assets
├── .env.example         # Environment variable template
├── package.json
├── tailwind.config.js
└── README.md


⸻

🔑 Environment Variables

This project will not work without required environment variables.

Create a .env file in the root:

GOOGLE_API_KEY=your_google_ai_api_key_here

⚠️ Never commit your real .env file.
Use .env.example for reference only.

On Vercel, add the same variables under:
Project Settings → Environment Variables

⸻

🚀 Running Locally

# Install dependencies
npm install

# Start dev server
npm run dev

App should now be running on:

http://localhost:3000


⸻

🌐 Deployment (Vercel)

This project is deployed using Git-based Vercel deployments.

Steps:
	1.	Push code to GitHub
	2.	Import repo into Vercel
	3.	Add environment variables
	4.	Deploy

For custom domains:
	•	Add domain in Vercel
	•	Point DNS:
	•	A @ → 216.198.79.1
	•	CNAME www → cname.vercel-dns.com

⸻

🧠 Common Issues & Fixes

Blank screen on deploy?
	•	Missing environment variables
	•	API key not set on Vercel
	•	Runtime error during initialization

Domain shows “Invalid Configuration”?
	•	DNS records don’t match Vercel
	•	Old A / CNAME records still exist
	•	DNS propagation not complete

⸻

📌 Design Philosophy
	•	No hardcoded data
	•	No fake props
	•	No unnecessary libraries
	•	If it doesn’t serve the user, it doesn’t exist

Built to be lean, fast, and extendable.

⸻

🧪 Status
	•	✅ Core functionality working
	•	✅ Production deployment live
	•	🚧 Actively improving UI & flows
	•	🚧 Feature expansion planned

⸻

🤝 Contributing

This is an active project. If you want to contribute:
	•	Keep code clean
	•	Avoid magic values
	•	Document anything non-obvious

⸻

📄 License

MIT License


Made By:
Yuvraj Mohana [Front End]
Syed Aman Zabi [Back-end]
Talha Riyan Pasha [Databases & Auth]



# LokSudhar (लोक सुधार) — Citizen Grievance Redressal Portal

Click here 
   👉   https://remix-loksudhar-citizen-grievance-redressal-porta-4241.ai.studio

**Tagline:** शिकायत आपकी, समाधान प्रशासन का।  
**Portal Identity:** Citizen Grievance Redressal Portal *(Independent Public-Service Prototype)*

> **Disclaimer:** LokSudhar (लोक सुधार) is an independent civic-technology prototype designed to demonstrate transparent public grievance filing, tracking, and departmental resolution workflows. It is not officially affiliated with any Government Ministry, State Authority, or Municipal Corporation.

## Core Modules
- **Citizen Portal**: Bilingual (English / हिन्दी) interface, accessibility controls (`A- / A / A+`, High Contrast), Google Sign-In via Firebase Authentication, geo-tagged complaint submission with Leaflet maps, photograph evidence upload, and unique Reference Number receipts (`LKS-2026-XXXXXX`).
- **Grievance Tracking**: Real-time complaint status lookup by Reference Number with departmental assignment, Leaflet location pin, resolution evidence photos, and live audit timeline via Socket.IO.
- **Admin Portal**: Secure administrator login, grievance register filtering, department & field officer assignment, status updates, evidence review, and printable/CSV reports.
- **Department & Field Officer Portal**: Assigned grievance queue, interactive site map, progress stage updates, and completion photograph uploads.

## Running Locally
1. Copy `.env.example` to `.env` and configure optional `MONGODB_URI`, `ADMIN_PASSCODE`, or `WORKER_PASSCODE` secrets (or use the inline first-run claim setup in the Admin/Department portals).
2. Install dependencies: `npm install`
3. Start development server on port 3000: `npm run dev`
4. Build production bundle: `npm run build`

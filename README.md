# Smart Campus Room Availability Checker

Software Engineering – Assignment #04

Student: Komekbay Symbat

## Project Overview
This project is a Smart Campus Room Availability Checker developed using React, TypeScript, and Vite.

The application allows users to find suitable rooms based on the number of attendees and required equipment, select a room, and check its availability.

## Features
- Five fictional campus rooms
- Room filtering by capacity
- Equipment-based filtering
- Room availability checking
- Booking conflict detection
- Input validation
- Responsive user interface

## Technologies
- React
- TypeScript
- Vite
- Vitest
- Tailwind CSS

## How to Run
1. Install dependencies: `npm ci`
2. Start the application: `npm run dev`

## Testing
The following commands are used to verify the project:

- `npm test`
- `npm run typecheck`
- `npm run build`

Final test results: 88 tests passed across 8 test files.

## Project Structure
- `src/App.tsx` – Main application
- `src/components/` – UI components
- `src/lib/booking.ts` – Booking validation
- `src/lib/rooms.ts` – Room filtering
- `src/lib/roomCatalog.ts` – Room information
- `AGENTS.md` – Project instructions

## Project Links
GitHub:
https://github.com/symbatkomekbay-lgtm/smart-campus-assignment04

Live Website:
https://smart-campus-room-av-6uwz.bolt.host/

## Limitations
The application uses fictional data and does not create real reservations. No backend or database is used.

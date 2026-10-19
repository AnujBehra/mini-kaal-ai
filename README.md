# Mini KAAL AI - Guidance Web Application

A lightweight, clean full-stack web application built for the **KAAL AI Full Stack Development Assignment**.

This application allows users to ask questions and receive thoughtful, calming guidance inspired by timeless wisdom. All questions and responses are stored in a PostgreSQL database with timestamps and displayed in reverse-chronological order.

Built with **pure HTML, CSS, Vanilla JavaScript, Node.js, Express, and PostgreSQL** — strictly without any frameworks, build tools, or complex abstractions.

---

##  Architecture & Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                        Frontend                        │
│                 HTML + CSS + JavaScript                │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                        REST API                        │
│               JavaScript fetch() requests              │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                        Backend                         │
│                   Node.js + Express.js                 │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                       PostgreSQL                       │
│              Questions, answers, timestamps            │
└────────────────────────────────────────────────────────┘
```

- **Frontend:** Pure HTML5, CSS3, and Vanilla JavaScript (No React, No Vite, No build step)
- **API Communication:** Browser-native `fetch()` requests
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL (`pg` connection pool)
- **Guidance System:** KAAL AI wisdom engine (Gemini API integration with contextual fallback)



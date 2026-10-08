# 📰 AI News Shorts

AI News Shorts is an AI-powered news platform that fetches the latest news and converts it into concise, engaging news shorts using Google Gemini.

## 🚀 Live Demo

https://ai-news-shorts-bokgnmdvk-megharaj1.vercel.app/

## 📌 About the Project

AI News Shorts helps users quickly understand the latest news without reading long articles.

The application fetches real-time news using NewsAPI and uses Google Gemini to transform article information into a short, easy-to-understand format.

Each AI news short contains:

- 🎯 Hook
- 📰 What Happened
- 💡 Why It Matters
- ✅ Key Takeaway

## ✨ Features

- 🔎 Search for the latest news
- 📰 Fetch real-time news articles
- 🔥 Trending news topics
- 🖼️ News article images
- 🤖 AI-powered news summarization
- 🎯 Automatically generated hooks
- 💡 Explanation of why the news matters
- 📱 Responsive user interface
- 🔗 Open the original news article
- 📤 Share AI-generated news shorts

## 🛠️ Tech Stack

### Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### Backend

- Node.js
- Express.js
- REST API
- CORS
- dotenv

### APIs & AI

- NewsAPI
- Google Gemini API

### Deployment

- Vercel — Frontend
- Render — Backend
- GitHub — Source Code

## 🏗️ Project Architecture

```text
                    ┌──────────────────┐
                    │      User        │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ React Frontend  │
                    │     Vercel       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Node.js/Express  │
                    │     Backend      │
                    │     Render       │
                    └───────┬───┬──────┘
                            │   │
                 ┌──────────┘   └──────────┐
                 ▼                         ▼
          ┌─────────────┐          ┌─────────────┐
          │  NewsAPI    │          │   Gemini    │
          │ Latest News │          │  AI Shorts  │
          └─────────────┘          └─────────────┘

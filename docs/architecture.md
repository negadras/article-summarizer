# Article Summarizer – High-Level Architecture

## System Overview

![Architecture Diagram](architecture-diagram.svg)

## Component Details

### Frontend Layer (React)

* **Technology:** React 18 with TypeScript
* **UI Framework:** Tailwind CSS + Shadcn/UI components
* **State Management:** React hooks (`useState`, `useEffect`)
* **Build Tool:** Vite
* **Key Features:**

    * Text input for direct article content
    * URL input for web scraping
    * Real-time summarization results
    * Export functionality (JSON download)
    * Responsive design

---

### Backend Layer (Spring Boot)

* **Technology:** Spring Boot 3.x with Java 17+
* **Architecture:** REST API
* **Documentation:** OpenAPI 3.0 specification
* **Key Services:**

    * Text Summarization Service
    * URL Content Extraction Service
    * OpenAI Integration Service
* **Endpoints:**

    * `POST /api/v1/summarize/text` – Direct text summarization
    * `POST /api/v1/summarize/url` – URL-based summarization

---

### Services

* **OpenAI GPT-4o:** AI model for content summarization and key points extraction
* **Web Scraping:** Content extraction from provided URLs

## ✨ Key Features

* **AI-Powered Summarization:** Leverages OpenAI GPT-4o for intelligent content analysis
* **Dual Input Methods:** Supports both direct text and URL-based content
* **Key Points Extraction:** Automatically identifies main takeaways
* **Compression Analytics:** Shows word count reduction statistics
* **Export Functionality:** JSON download of summaries
* **Responsive UI:** Mobile-friendly interface
---

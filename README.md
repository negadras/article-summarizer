# Article Summarizer

[![Java Version](https://img.shields.io/badge/Java-17+-blue)](https://openjdk.org/)
[![Node.js Version](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![Web CI](https://img.shields.io/github/actions/workflow/status/negadras/article-summarizer/web-ci.yml?branch=main&label=Web%20CI)](https://github.com/negadras/article-summarizer/actions/workflows/web-ci.yml)
[![Maven Build](https://img.shields.io/github/actions/workflow/status/negadras/article-summarizer/maven-build.yml?branch=main&label=Maven%20Build)](https://github.com/negadras/article-summarizer/actions/workflows/maven-build.yml)
[![Mega Linter](https://img.shields.io/github/actions/workflow/status/negadras/article-summarizer/mega-linter.yml?branch=main&label=Mega%20Linter)](https://github.com/negadras/article-summarizer/actions/workflows/mega-linter.yml)
[![License](https://img.shields.io/github/license/negadras/article-summarizer)](LICENSE)
[![Conventional Commit](https://img.shields.io/badge/Commit-Conventional-yellowgreen)](https://www.conventionalcommits.org/en/v1.0.0/)

## Overview

The Article Summarizer is a full-stack web application that leverages AI to intelligently summarize articles 
from text input or URLs. Built with React frontend and Spring Boot backend, it provides a seamless experience 
for content analysis and summarization.

## 🚀 Quick Start

### Prerequisites

- **Java 17+** - [Download OpenJDK](https://openjdk.org/)
- **Node.js 20+** - [Download Node.js](https://nodejs.org/)
- **OpenAI API Key** - [Get your API key](https://platform.openai.com/api-keys)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/negadras/article-summarizer.git
   cd article-summarizer
   ```

2. **Set up environment variables**
   ```bash
   # Create .env file in the root directory
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
   ```

3. **Build and run the application**
   ```bash
   # Build both frontend and backend
   make build
   
   # Start the application
   make dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - API Documentation: http://localhost:8080/swagger-ui.html


## 🏗️ Architecture

For detailed architecture documentation, see [docs/index.md](docs/architecture.md).

## 🔧 Development

### Running in Development Mode

```bash
# Start backend (Spring Boot)
./mvnw spring-boot:run

# Start frontend (React + Vite)
cd summarizer-web
npm run dev
```

### Running Tests

```bash
# Backend tests
cd summarizer-api
./mvnw test
# Frontend tests
cd summarizer-web
npm test
```



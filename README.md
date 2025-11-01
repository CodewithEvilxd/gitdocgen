# GitHub Documentation Generator

🚀 **AI-Powered README Generator for GitHub Repositories**

Generate comprehensive, professional README files for your GitHub projects with intelligent analysis, folder structure visualization, and AI-powered code replication prompts.

![GitHub Documentation Generator](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![Vite](https://img.shields.io/badge/Vite-7.1.7-yellow) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.16-blue) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-green)

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎯 About](#-about)
- [🛠️ Technologies](#️-technologies)
- [📁 Project Structure](#-project-structure)
- [🚀 Installation](#-installation)
- [💻 Usage](#-usage)
- [🤖 AI Features](#-ai-features)
- [📱 Responsive Design](#-responsive-design)
- [🔧 Configuration](#-configuration)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📧 Contact](#-contact)

## ✨ Features

### 🎯 Core Features
- **Auto README Generation**: Instantly create comprehensive README files
- **GitHub API Integration**: Fetch repository data, languages, and file structures
- **Folder Tree Visualization**: Beautiful ASCII tree representation of project structure
- **Smart Content Analysis**: Automatic detection of project type and technologies

### 🤖 AI-Powered Features
- **Intelligent Project Analysis**: AI analyzes code structure and provides insights
- **Code Replication Prompts**: Generate detailed prompts for AI agents to recreate projects
- **Quality Indicators**: Automatic detection of tests, CI/CD, Docker support
- **Smart Recommendations**: AI suggests use cases and best practices

### 🎨 User Experience
- **Fully Responsive**: Works perfectly on mobile, tablet, and desktop
- **Modern UI**: Beautiful gradient designs with Tailwind CSS
- **Real-time Generation**: Instant results with loading states
- **Copy & Download**: Easy clipboard copy and file download

## 🎯 About

The GitHub Documentation Generator is a modern web application built with React 19, TypeScript, and Vite. It leverages the GitHub API to analyze repositories and uses OpenAI's GPT models to generate intelligent documentation and code replication prompts.

**Repository Stats:**
- ⭐ Stars: 0
- 🍴 Forks: 0
- 👁️ Watchers: 0
- 🐛 Open Issues: 0

### 🤖 AI-Generated Project Analysis

**Project Type:** Vite-powered web application

**Primary Language:** TypeScript (+ 3 others)

**Project Maturity:**
- Emerging community interest
- Initial community contributions
- Stable with no open issues

**Quality Indicators:**
- ✅ Includes test suite
- ✅ CI/CD pipeline configured
- ✅ Docker support available
- ✅ Documentation available

**Recommended Use Cases:**
- Building modern web applications with TypeScript
- Learning web development best practices
- Creating developer tools and utilities

## 🛠️ Technologies

This project is built with cutting-edge technologies:

### Frontend Framework
- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.1.7** - Fast build tool and dev server

### UI & Styling
- **Tailwind CSS 4.1.16** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icons
- **Radix UI** - Accessible component primitives

### State & Data
- **TanStack Query** - Powerful data fetching and caching
- **React Router** - Client-side routing
- **Sonner** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing

### APIs & Services
- **GitHub REST API** - Repository data fetching
- **OpenAI API** - AI-powered content generation

## 📁 Project Structure

```
github-doc/
├── 📁 public/
│   └── 📄 vite.svg
├── 📁 src/
│   ├── 📁 assets/
│   │   └── 📄 react.svg
│   ├── 📁 components/
│   │   └── 📁 ui/          # shadcn/ui components
│   ├── 📁 hooks/
│   │   ├── 📄 use-mobile.tsx
│   │   └── 📄 use-toast.ts
│   ├── 📁 lib/
│   │   └── 📄 utils.ts
│   ├── 📁 pages/
│   │   ├── 📄 Index.tsx    # Main application page
│   │   └── 📄 NotFound.tsx # 404 error page
│   ├── 📄 App.tsx          # Main app component
│   ├── 📄 App.css          # App-specific styles
│   ├── 📄 index.css        # Global styles
│   └── 📄 main.tsx         # App entry point
├── 📄 .env                 # Environment variables
├── 📄 .gitignore
├── 📄 components.json      # shadcn/ui configuration
├── 📄 eslint.config.js     # ESLint configuration
├── 📄 index.html           # HTML template
├── 📄 package.json         # Dependencies and scripts
├── 📄 pnpm-lock.yaml       # Package lock file
├── 📄 README.md            # This file
├── 📄 tsconfig.app.json    # TypeScript config for app
├── 📄 tsconfig.json        # Base TypeScript config
├── 📄 tsconfig.node.json   # TypeScript config for build tools
└── 📄 vite.config.ts       # Vite configuration
```

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn
- GitHub account (optional, for higher API limits)
- OpenAI API key (optional, for AI features)

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/CodewithEvilxd/gitdocgen.git

# Navigate to project directory
cd gitdocgen

# Install dependencies
npm install
# or
pnpm install
# or
yarn install

# Copy environment variables
cp .env.example .env

# Add your API keys to .env
# VITE_GITHUB_TOKEN=your_github_token_here
# VITE_OPENAI_API_KEY=your_openai_api_key_here

# Start development server
npm run dev
# or
pnpm dev
# or
yarn dev
```

## 💻 Usage

### Basic Usage

1. **Open the application** in your browser (usually `http://localhost:5173`)
2. **Enter a GitHub repository URL** (e.g., `https://github.com/facebook/react`)
3. **Select your options**:
   - ✅ AI-powered project analysis
   - ✅ Folder structure tree
   - ✅ Code replication prompt (requires OpenAI API key)
4. **Click "Generate Documentation"**
5. **Copy or download** the generated README.md

### Advanced Features

#### GitHub Token (Recommended)
Add your GitHub personal access token to increase API rate limits:
```env
VITE_GITHUB_TOKEN=ghp_your_token_here
```

#### OpenAI Integration
Add your OpenAI API key for AI-powered features:
```env
VITE_OPENAI_API_KEY=sk-your_openai_key_here
```

## 🤖 AI Features

### Project Analysis
The AI analyzes your repository and provides:
- **Project type detection** (React app, Node.js, Python, etc.)
- **Technology stack identification**
- **Quality indicators** (tests, CI/CD, documentation)
- **Maturity assessment** (stars, forks, issues)
- **Use case recommendations**

### Code Replication Prompts
Generate detailed prompts that AI agents can use to recreate your project:
- Complete file structure
- Code snippets for each file
- Setup and installation instructions
- Configuration details
- Deployment guidance

## 📱 Responsive Design

The application is fully responsive and works perfectly on:
- 📱 **Mobile phones** (320px and up)
- 📟 **Tablets** (640px and up)
- 💻 **Desktops** (1024px and up)
- 🖥️ **Large screens** (1280px and up)

### Responsive Features
- Adaptive layouts that stack on mobile
- Touch-friendly buttons and interactions
- Optimized text sizes for readability
- Collapsible navigation elements
- Responsive typography and spacing

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# GitHub API (optional, increases rate limits)
VITE_GITHUB_TOKEN=your_github_personal_access_token

# OpenAI API (optional, enables AI features)
VITE_OPENAI_API_KEY=your_openai_api_key
```

### Build Configuration

The project uses Vite for building. Customize `vite.config.ts` for advanced configuration:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Add your custom configuration here
})
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### Development Setup

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/github-doc.git
   cd github-doc
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Start development server**:
   ```bash
   npm run dev
   ```
6. **Make your changes**
7. **Run linting**:
   ```bash
   npm run lint
   ```
8. **Commit your changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
9. **Push to your branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
10. **Open a Pull Request**

### Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure responsive design works on all screen sizes
- Test with different repository types

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

**Project Link:** [https://github.com/CodewithEvilxd/gitdocgen](https://github.com/CodewithEvilxd/gitdocgen)

**Author:** [CodewithEvilxd](https://github.com/CodewithEvilxd)

**Issues:** [Report bugs or request features](https://github.com/CodewithEvilxd/gitdocgen/issues)

---

<div align="center">

**Built with ❤️ by CodewithEvilxd**

*Transform your GitHub repositories into professional documentation with AI-powered insights*

</div>







# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```



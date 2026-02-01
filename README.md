# AdaptUI – AI-Powered Generative UI

AdaptUI demonstrates a generative UI using React and Tambo AI. A user types a prompt, and the AI selects the best component to render based on their intent.

# Learning Tambo React SDK

This project is a simple demonstration created to learn and explore the **Tambo React SDK**. It shows how to integrate generative UI components into a React application.

## Learning Objectives
- Understanding the `TamboProvider` and `TamboRegistryProvider`.
- Registering custom React components for AI-driven rendering.
- Handling message threads and generation states.
  
## Current Features
- **Dynamic UI Switching**: Real-time component selection based on user input.
- **Learning Mode**: Displays a curriculum syllabus and tracks mastery progress.
- **Interview Mode**: Provides strategic preparation tips and a checklist.
- **Project Ideas**: Suggests project blueprints with descriptions and tech stacks.

## 🛠️ Project Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up API Key**:
   Create a `.env` file and add your Tambo API key:
   ```env
   VITE_TAMBO_API_KEY=your_tambo_api_key_here
   ```

3. **Run the app**:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack
- React / Vite
- Tambo AI React SDK


##  Components Explored
- `LearningMode`: Progress tracking UI.
- `InterviewMode`: Checklist-based prep UI.
- `ProjectMode`: Card-based data display.


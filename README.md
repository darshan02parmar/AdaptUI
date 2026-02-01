# AdaptUI - Generative UI Framework

A premium, interactive chat interface powered by **Tambo AI**, built with React and Vite. This project demonstrates the power of Generative UI, where the interface adapts in real-time based on your natural language input.

## ✨ Features

- **Generative UI Engine**: Automatically renders specialized components (Learning, Interview, Project modes) based on intent.
- **Dynamic Adaptive Layout**: Switches between a focused chat view and a split-screen preview panel seamlessly.
- **Premium Design System**: Dark-themed, glassmorphic UI with smooth animations and mesh gradients.
- **Contextual Search**: The search bar follows the conversation flow for a natural interaction.
- **Interactive Actions**:
  - **Paired Deletion**: Removing a response also removes the triggering question.
  - **Copy to Clipboard**: Quick access to AI text responses.
  - **Message Reactions**: Like your favorite AI responses.

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd tambo-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory (use `.env.example` as a template):
   ```env
   VITE_TAMBO_API_KEY=your_actual_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **AI Library**: [@tambo-ai/react](https://tambo.ai)
- **Styling**: Vanilla CSS with modern Design Tokens

## 📄 License

MIT

import React, { useState } from 'react';
import { useTambo, TamboRegistryProvider } from '@tambo-ai/react';
import LearningMode from './components/LearningMode';
import InterviewMode from './components/InterviewMode';
import ProjectMode from './components/ProjectMode';
import Hero3 from './components/Hero3';

const components = [
  {
    name: 'LearningMode',
    component: LearningMode,
    description: 'Displays learning topics and progress when the user wants to learn something new or check their progress.',
    propsSchema: {
      type: 'object',
      properties: {
        topics: { type: 'array', items: { type: 'string' }, description: 'List of topics to learn' },
        progress: { type: 'number', description: 'Progress percentage (0-100)' }
      }
    }
  },
  {
    name: 'InterviewMode',
    component: InterviewMode,
    description: 'Displays interview preparation tips and a checklist when the user wants to prepare for an interview or needs career advice.',
    propsSchema: {
      type: 'object',
      properties: {
        tips: { type: 'array', items: { type: 'string' }, description: 'General interview tips' },
        checklist: {
          type: 'array', items: {
            type: 'object',
            properties: {
              task: { type: 'string' },
              completed: { type: 'boolean' }
            }
          }, description: 'Checklist of preparation tasks'
        }
      }
    }
  },
  {
    name: 'ProjectMode',
    component: ProjectMode,
    description: 'Displays project ideas and tech stacks when the user is looking for inspiration or wants to build something.',
    propsSchema: {
      type: 'object',
      properties: {
        ideas: {
          type: 'array', items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              techStack: { type: 'array', items: { type: 'string' } }
            }
          }, description: 'List of project ideas'
        }
      }
    }
  }
];

// `text` is expected to be a plain string from the model.
// We intentionally support only `**bold**` and do not interpret HTML.
const renderBoldText = (text, keyPrefix) => {
  const parts = [];
  const boldRegex = /\*\*(.*?)\*\*/g;

  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <strong key={`${keyPrefix}-b-${parts.length}`}>{match[1]}</strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

// Simple helper to format AI text with basic markdown-like syntax
const formatMessage = (text) => {
  if (typeof text !== 'string') return text;

  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <br key={i} />;
    }

    // Unordered List items: - or * or 1.
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
      const itemText = trimmed.replace(/^(-|\*|\d+\.)\s+/, '');

      return (
        <div key={i} className="list-item">
          <span>•</span>
          <span>{renderBoldText(itemText, `li-${i}`)}</span>
        </div>
      );
    }

    return <p key={i}>{renderBoldText(line, `p-${i}`)}</p>;
  });
};

function App() {
  const [showDemo, setShowDemo] = useState(false);
  const [input, setInput] = useState('');
  const [likedMessages, setLikedMessages] = useState(new Set());
  const { sendThreadMessage, currentThread, generationStage, startNewThread, setThreadMap } = useTambo();

  // Get all messages
  const messages = currentThread?.messages || [];
  const hasMessages = messages.length > 0;

  // Find the last message that has a rendered component
  const lastComponentMessage = [...messages]
    .reverse()
    .find(m => m.renderedComponent);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    sendThreadMessage(input);
    setInput('');
  };
  const toggleLike = (id) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const deleteMessage = (id) => {
    if (!currentThread) return;

    const threadId = currentThread.id;
    setThreadMap(prevMap => {
      const thread = prevMap[threadId];
      if (!thread) return prevMap;

      const messageIndex = thread.messages.findIndex(msg => msg.id === id);
      if (messageIndex === -1) return prevMap;

      // Identify IDs to remove: target message and preceding user message
      const idsToRemove = [id];
      if (messageIndex > 0 && thread.messages[messageIndex - 1].role === 'user') {
        idsToRemove.push(thread.messages[messageIndex - 1].id);
      }

      return {
        ...prevMap,
        [threadId]: {
          ...thread,
          messages: thread.messages.filter(msg => !idsToRemove.includes(msg.id))
        }
      };
    });
  };
  const copyToClipboard = (text) => {
    // Flatten array content if necessary
    const rawText = Array.isArray(text)
      ? text.map(part => part.text || '').join('')
      : text;

    navigator.clipboard.writeText(rawText).then(() => {
      // Could add a toast here, but simple for now
      alert('Copied to clipboard!');
    });
  };

  const isGenerating = generationStage !== 'IDLE' && generationStage !== 'COMPLETE';

  return (
    <TamboRegistryProvider components={components}>
      {!showDemo ? (
        <Hero3 onViewDemo={() => setShowDemo(true)} />
      ) : (
        <div className={`app-container ${hasMessages ? 'chat-active' : 'chat-idle'}`}>
          <header>
            <div className="header-content">
              <div className="logo">
                <h1>AdaptUI</h1>
                <p className="subtitle">Dynamic Generative UI • React</p>
              </div>
              {hasMessages && (
                <button className="clear-chat-btn" onClick={startNewThread}>
                  <span className="icon">🗑️</span>
                  Clear Chat
                </button>
              )}
            </div>
          </header>

          {!hasMessages && (
            <div className="hero-section">
              <form className="input-section central" onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Type what you want to do..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isGenerating}
                />
                <button type="submit" className="generate-btn" disabled={isGenerating}>
                  {isGenerating ? 'Thinking...' : 'Send'}
                </button>
              </form>
            </div>
          )}

          <div className={`content-layout ${lastComponentMessage ? 'split-view' : 'centered-view'}`}>
            <div className="conversation-history">
              {!hasMessages && !isGenerating && (
                <div className="landing-page">
                  <section className="hero-section-v2">
                    <div className="badge">Tambo AI v1.0</div>
                    <h2 className="hero-title">Interface at the speed of thought.</h2>
                    <p className="hero-subtitle">
                      Our generative engine transforms your natural language into dynamic,
                      interactive UI components in real-time.
                    </p>
                  </section>

                  <section className="features-grid">
                    <div className="feature-card">
                      <div className="icon">🧠</div>
                      <h3>Intent Recognition</h3>
                      <p>AI understands your goals and chooses the perfect UI to help you achieve them.</p>
                    </div>
                    <div className="feature-card">
                      <div className="icon">⚡</div>
                      <h3>Instant Feedback</h3>
                      <p>No more static forms. Get exactly what you need, when you need it.</p>
                    </div>
                    <div className="feature-card">
                      <div className="icon">🎨</div>
                      <h3>Dynamic Themes</h3>
                      <p>Beautiful, accessible components styled specifically for your data.</p>
                    </div>
                  </section>

                  <div className="suggestion-section">
                    <h3 className="section-label">Start with an example</h3>
                    <div className="suggestion-grid-v2">
                      <button className="suggestion-tile" onClick={() => sendThreadMessage("I'm starting to learn Go")}>
                        <div className="tile-icon">🎓</div>
                        <div className="tile-text">
                          <strong>Learn a language</strong>
                          <p>Generate a syllabus and track progress</p>
                        </div>
                      </button>
                      <button className="suggestion-tile" onClick={() => sendThreadMessage("Prepare me for a frontend interview")}>
                        <div className="tile-icon">🚀</div>
                        <div className="tile-text">
                          <strong>Interview Ready</strong>
                          <p>Tips, checklist, and career prep</p>
                        </div>
                      </button>
                      <button className="suggestion-tile" onClick={() => sendThreadMessage("Give me some React project ideas")}>
                        <div className="tile-icon">🛠️</div>
                        <div className="tile-text">
                          <strong>Project Blueprint</strong>
                          <p>Tech stacks and project inspiration</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <footer className="landing-footer">
                    <p>Built with Tambo AI React SDK • Generative UI Framework</p>
                  </footer>
                </div>
              )}

              <div className="messages-container">
                {messages.map((message, index) => (
                  <div key={message.id || index} className={`message-wrapper ${message.role}`}>
                    <div className="role-label">{message.role === 'user' ? 'You' : 'Tambo AI'}</div>
                    <div className="message-bubble">
                      <div className="message-content">
                        {Array.isArray(message.content)
                          ? message.content.map((part, pIndex) => part.type === 'text' ? (
                            <React.Fragment key={pIndex}>{formatMessage(part.text)}</React.Fragment>
                          ) : null)
                          : formatMessage(message.content)}
                      </div>
                      {message.role === 'assistant' && (
                        <div className="message-actions">
                          <button
                            className={`action-btn like-btn ${likedMessages.has(message.id) ? 'liked' : ''}`}
                            onClick={() => toggleLike(message.id)}
                            title="Like response"
                          >
                            {likedMessages.has(message.id) ? '❤️' : '🤍'}
                          </button>
                          <button
                            className="action-btn copy-btn"
                            onClick={() => copyToClipboard(message.content)}
                            title="Copy response"
                          >
                            📋
                          </button>
                          <button
                            className="action-btn delete-msg-btn"
                            onClick={() => deleteMessage(message.id)}
                            title="Delete response"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isGenerating && (
                  <div className="message-wrapper assistant">
                    <div className="role-label">Tambo AI</div>
                    <div className="message-bubble assistant">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}

                {hasMessages && (
                  <div className="inline-input-container">
                    <form className="input-section inline" onSubmit={handleSubmit}>
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Ask a follow-up..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isGenerating}
                      />
                      <button type="submit" className="generate-btn" disabled={isGenerating}>
                        {isGenerating ? '...' : 'Send'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            <div className="preview-panel">
              {lastComponentMessage && (
                <div className="sticky-component">
                  <div className="component-header">
                    <span className="status-dot"></span>
                    <span className="label">Live UI Result</span>
                  </div>
                  {lastComponentMessage.renderedComponent}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </TamboRegistryProvider>
  );
}

export default App;

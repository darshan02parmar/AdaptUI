import React, { useCallback, useEffect, useState } from 'react';
import { useTambo, TamboRegistryProvider } from '@tambo-ai/react';
import LearningMode from './components/LearningMode';
import InterviewMode from './components/InterviewMode';
import ProjectMode from './components/ProjectMode';

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

const EXAMPLE_PROMPTS = [
  'Help me prepare for interviews',
  'Suggest a project idea',
  'Create a learning plan'
];

// `text` is expected to be a plain string from the model.
// We intentionally support only `**bold**` and do not interpret HTML.
const renderBoldText = (text, keyPrefix) => {
  if (typeof text !== 'string') return text;

  const parts = [];
  let lastIndex = 0;

  for (const match of text.matchAll(/\*\*(.+?)\*\*/g)) {
    if (match.index == null) continue;

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

  return (
    <>
      {text.split('\n').map((line, i) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <br key={i} />;
        }

        const orderedMatch = trimmed.match(/^(\d+)\.\s+/);
        if (orderedMatch) {
          const itemText = trimmed.replace(/^\d+\.\s+/, '');

          return (
            <div key={i} className="list-item">
              <span>{orderedMatch[1]}.</span>
              <span>{renderBoldText(itemText, `oli-${i}`)}</span>
            </div>
          );
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^(-|\*)\s+/, '');

          return (
            <div key={i} className="list-item">
              <span>•</span>
              <span>{renderBoldText(itemText, `uli-${i}`)}</span>
            </div>
          );
        }

        return <p key={i}>{renderBoldText(line, `p-${i}`)}</p>;
      })}
    </>
  );
};

const API_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const GENERATING_STAGES = new Set([
  'CHOOSING_COMPONENT',
  'FETCHING_CONTEXT',
  'HYDRATING_COMPONENT',
  'STREAMING_RESPONSE'
]);

function GenerationStatus({ isActive }) {
  if (!isActive) return null;

  return (
    <div className="generation-status" role="status" aria-live="polite">
      Generating UI...
    </div>
  );
}

function App() {
  const [input, setInput] = useState('');
  const [likedMessages, setLikedMessages] = useState(new Set());
  const [isPendingGenerationStart, setIsPendingGenerationStart] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { sendThreadMessage, currentThread, generationStage, startNewThread, setThreadMap } = useTambo();

  const isGenerating = GENERATING_STAGES.has(generationStage);
  const showGeneratingStatus = isGenerating || isPendingGenerationStart;
  const isInputDisabled = showGeneratingStatus;

  // Get all messages
  const messages = currentThread?.messages || [];
  const hasMessages = messages.length > 0;

  // Find the last message that has a rendered component
  const lastComponentMessage = [...messages]
    .reverse()
    .find(m => m.renderedComponent);
  useEffect(() => {
    if (!isPendingGenerationStart) return;

    if (generationStage !== 'IDLE') {
      setIsPendingGenerationStart(false);
      return;
    }

    const timeoutId = setTimeout(() => setIsPendingGenerationStart(false), 15000);
    return () => clearTimeout(timeoutId);
  }, [generationStage, isPendingGenerationStart]);

  const safeSendThreadMessage = useCallback(async (message) => {
    if (isInputDisabled) return false;

    setApiError(null);
    setIsPendingGenerationStart(true);

    try {
      await sendThreadMessage(message);
      return true;
    } catch (error) {
      console.error('sendThreadMessage failed', error);
      setIsPendingGenerationStart(false);
      setApiError(API_ERROR_MESSAGE);
      return false;
    }
  }, [isInputDisabled, sendThreadMessage]);

  const submitPrompt = useCallback(async (rawPrompt) => {
    const prompt = rawPrompt.trim();
    if (!prompt) return false;

    return safeSendThreadMessage(prompt);
  }, [safeSendThreadMessage]);

  const handleInputChange = (e) => {
    if (apiError) setApiError(null);
    setInput(e.target.value);
  };

  const handleClearChat = useCallback(() => {
    setApiError(null);
    setIsPendingGenerationStart(false);
    startNewThread();
  }, [startNewThread]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await submitPrompt(input)) setInput('');
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

  return (
    <TamboRegistryProvider components={components}>
      <div className={`app-container ${hasMessages ? 'chat-active' : 'chat-idle'}`}>
        <header>
          <div className="header-content">
            <div className="logo">
              <h1>AdaptUI</h1>
              <p className="subtitle">Dynamic Generative UI • React</p>
            </div>
            {hasMessages && (
              <button className="clear-chat-btn" onClick={handleClearChat}>
                <span className="icon">🗑️</span>
                Clear Chat
              </button>
            )}
          </div>
        </header>

        {apiError && (
          <div className="api-error-toast" role="alert">
            {apiError}
          </div>
        )}

        <div className={`content-layout ${lastComponentMessage ? 'split-view' : 'centered-view'}`}>
          <div className="conversation-history">
            {!hasMessages && (
              <div className="landing-page">
                <section className="hero-section-v2">
                  <div className="badge">Tambo AI v1.0</div>
                  <h2 className="hero-title">AI-Powered Generative UI</h2>
                  <p className="hero-subtitle">Type a prompt and AI renders the right interface</p>

                  <form className="input-section central" onSubmit={handleSubmit}>
                    <input
                      type="text"
                      className="search-input"
                      placeholder={showGeneratingStatus
                        ? 'Generating UI...'
                        : 'Ask for a learning plan, interview prep, or a project idea...'}
                      value={input}
                      onChange={handleInputChange}
                      disabled={isInputDisabled}
                    />
                    <button type="submit" className="generate-btn" disabled={isInputDisabled}>
                      {showGeneratingStatus && <span className="btn-spinner" aria-hidden="true" />}
                      {showGeneratingStatus ? 'Generating' : 'Send'}
                    </button>
                  </form>
                  <GenerationStatus isActive={showGeneratingStatus} />

                  <div className="example-prompts" aria-label="Example prompts">
                    <div className="example-prompts-label">Example prompts</div>
                    {EXAMPLE_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        className="example-prompt-btn"
                        onClick={() => {
                          submitPrompt(prompt);
                        }}
                        disabled={isGenerating}
                        aria-label={`Send example prompt: ${prompt}`}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  <ul className="hero-checklist" aria-label="Key benefits">
                    <li className="hero-checklist-item">No credit card required</li>
                    <li className="hero-checklist-item">Free 14-day trial</li>
                    <li className="hero-checklist-item">Cancel anytime</li>
                  </ul>

                  <div className="hero-stats" aria-label="Social proof">
                    <div className="hero-stat">
                      <div className="hero-stat-value">10K+</div>
                      <div className="hero-stat-label">Active Users</div>
                    </div>
                    <div className="hero-stat">
                      <div className="hero-stat-value">99.9%</div>
                      <div className="hero-stat-label">Uptime</div>
                    </div>
                    <div className="hero-stat">
                      <div className="hero-stat-value">24/7</div>
                      <div className="hero-stat-label">Support</div>
                    </div>
                  </div>
                </section>

                <div className="suggestion-section">
                  <h3 className="section-label">Start with an example</h3>
                  <div className="suggestion-grid-v2">
                    <button
                      className="suggestion-tile"
                      onClick={() => submitPrompt("I'm starting to learn Go")}
                      disabled={isInputDisabled}
                    >
                      <div className="tile-icon">🎓</div>
                      <div className="tile-text">
                        <strong>Learn a language</strong>
                        <p>Generate a syllabus and track progress</p>
                      </div>
                    </button>
                    <button
                      className="suggestion-tile"
                      onClick={() => submitPrompt("Prepare me for a frontend interview")}
                      disabled={isInputDisabled}
                    >
                      <div className="tile-icon">🚀</div>
                      <div className="tile-text">
                        <strong>Interview Ready</strong>
                        <p>Tips, checklist, and career prep</p>
                      </div>
                    </button>
                    <button
                      className="suggestion-tile"
                      onClick={() => submitPrompt("Give me some React project ideas")}
                      disabled={isInputDisabled}
                    >
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
                        ? message.content.map((part, pIndex) => part.type === 'text'
                          ? <React.Fragment key={pIndex}>{formatMessage(part.text)}</React.Fragment>
                          : null)
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
                      placeholder={showGeneratingStatus ? 'Generating UI...' : 'Ask a follow-up...'}
                      value={input}
                      onChange={handleInputChange}
                      disabled={isInputDisabled}
                    />
                    <button type="submit" className="generate-btn" disabled={isInputDisabled}>
                      {showGeneratingStatus && <span className="btn-spinner" aria-hidden="true" />}
                      {showGeneratingStatus ? 'Generating' : 'Send'}
                    </button>
                  </form>
                  <GenerationStatus isActive={showGeneratingStatus} />
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
    </TamboRegistryProvider>
  );
}

export default App;

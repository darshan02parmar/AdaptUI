import React from 'react';

const LearningMode = ({ topics = [], progress = 0 }) => {
    return (
        <div className="card learning-card premium-module">
            <div className="module-header">
                <div className="module-badge">Active Learning</div>
                <h3>Course Syllabus</h3>
            </div>

            <div className="progress-section">
                <div className="progress-info">
                    <span>Overall Mastery</span>
                    <span className="percentage">{progress}%</span>
                </div>
                <div className="progress-bar-container">
                    <div
                        className="progress-bar-fill pulse"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="topics-section">
                <h4 className="section-title">Curriculum Modules</h4>
                <div className="topics-list">
                    {topics.map((topic, index) => (
                        <div key={index} className="topic-item">
                            <div className="topic-number">{(index + 1).toString().padStart(2, '0')}</div>
                            <div className="topic-content">
                                <strong>{topic}</strong>
                                <p>Master the core concepts and applications</p>
                            </div>
                            <div className="topic-status">
                                {progress > (index / topics.length) * 100 ? '✅' : '🔒'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {topics.length === 0 && (
                <div className="empty-state">
                    No topics suggested yet. Try "show me what to learn for React".
                </div>
            )}
        </div>
    );
};

export default LearningMode;

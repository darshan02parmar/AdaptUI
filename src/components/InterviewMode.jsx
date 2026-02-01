import React from 'react';

const InterviewMode = ({ tips = [], checklist = [] }) => {
    return (
        <div className="card interview-card premium-module">
            <div className="module-header">
                <div className="module-badge secondary">Career Prep</div>
                <h3>Interview Roadmap</h3>
            </div>

            <section className="guide-section">
                <h4 className="section-title">Strategic Tips</h4>
                <div className="tips-grid">
                    {tips.map((tip, index) => (
                        <div key={index} className="tip-pill">{tip}</div>
                    ))}
                </div>
            </section>

            <section className="checklist-section">
                <h4 className="section-title">Preparation Checklist</h4>
                <div className="roadmap-steps">
                    {checklist.map((item, index) => (
                        <div key={index} className={`roadmap-step ${item.completed ? 'completed' : ''}`}>
                            <div className="step-marker">{index + 1}</div>
                            <div className="step-info">
                                <strong>{item.task}</strong>
                                <p>{item.completed ? 'Task finalized and verified' : 'Action required'}</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={item.completed}
                                readOnly
                                className="step-check"
                            />
                        </div>
                    ))}
                </div>
            </section>
            {tips.length === 0 && checklist.length === 0 && (
                <div className="empty-state">
                    Need help with interviews? Try "prepare me for a frontend interview".
                </div>
            )}
        </div>
    );
};

export default InterviewMode;

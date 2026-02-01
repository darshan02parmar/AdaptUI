import React from 'react';

const ProjectMode = ({ ideas = [] }) => {
    return (
        <div className="card project-card premium-module">
            <div className="module-header">
                <div className="module-badge accent">Inspiration</div>
                <h3>Project Blueprints</h3>
            </div>

            <div className="projects-grid">
                {ideas.map((idea, index) => (
                    <div key={index} className="project-blueprint">
                        <div className="blueprint-header">
                            <h4>{idea.title}</h4>
                            <span className="difficulty-tag">Intelligent</span>
                        </div>
                        <p className="blueprint-desc">{idea.description}</p>
                        <div className="tech-stack">
                            {idea.techStack.map((tech, tIndex) => (
                                <span key={tIndex} className="tech-chip">{tech}</span>
                            ))}
                        </div>
                        <button className="blueprint-action">View Full Roadmap</button>
                    </div>
                ))}
            </div>
            {ideas.length === 0 && (
                <div className="empty-state">
                    Looking for inspiration? Try "give me some React project ideas".
                </div>
            )}
        </div>
    );
};

export default ProjectMode;

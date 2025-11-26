import React from 'react';
import ReusableQueryComponent from './ReusableQueryComponent';

const KnowledgeBot = () => {
    return (
        <ReusableQueryComponent
            title="Knowledge Bot"
            endpoint="/api/knowledge-bot"
            placeholder="Chat with the knowledge bot..."
        />
    );
};

export default KnowledgeBot;
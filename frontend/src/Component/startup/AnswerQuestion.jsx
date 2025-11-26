import React from 'react';
import ReusableQueryComponent from './ReusableQueryComponent';

const AnswerQuestion = () => {
    return (
        <ReusableQueryComponent
            title="Answer the Question"
            endpoint="/api/answer-question"
            placeholder="Ask any question..."
        />
    );
};

export default AnswerQuestion;
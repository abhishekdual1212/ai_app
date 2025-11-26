import React, { useState } from 'react';
import './ReusableQueryComponent.css';

const ReusableQueryComponent = ({ title, endpoint, placeholder }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResponse('');

        try {
            // In a real application, you would fetch from your API endpoint
            // const res = await fetch(endpoint, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ query }),
            // });
            // if (!res.ok) {
            //     throw new Error('Something went wrong!');
            // }
            // const data = await res.json();
            // setResponse(data.answer);

            // Mocking an API call for demonstration
            await new Promise(resolve => setTimeout(resolve, 1000));
            setResponse(`This is a mock response for your question: "${query}" from ${title}.`);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="query-component">
            <h2>{title}</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder || 'Type your question here...'}
                    rows="4"
                />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Submit'}
                </button>
            </form>
            {response && <div className="response-area">{response}</div>}
            {error && <div className="error-area">{error}</div>}
        </div>
    );
};

export default ReusableQueryComponent;
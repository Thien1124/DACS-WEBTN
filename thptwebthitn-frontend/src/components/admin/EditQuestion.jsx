import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditQuestion = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState({
        content: '',
        options: [
            { id: 1, content: '', isCorrect: false },
            { id: 2, content: '', isCorrect: false },
            { id: 3, content: '', isCorrect: false },
            { id: 4, content: '', isCorrect: false }
        ],
        explanation: ''
    });

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await axios.get(`/api/questions/${id}`);
                setQuestion(response.data);
                setLoading(false);
            } catch (error) {
                toast.error('Failed to fetch question');
                console.error('Error fetching question:', error);
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [id]);

    const handleQuestionChange = (e) => {
        setQuestion({ ...question, content: e.target.value });
    };

    const handleExplanationChange = (e) => {
        setQuestion({ ...question, explanation: e.target.value });
    };

    const handleOptionChange = (index, e) => {
        const newOptions = [...question.options];
        newOptions[index].content = e.target.value;
        setQuestion({ ...question, options: newOptions });
    };

    const handleCorrectOptionChange = (index) => {
        const newOptions = question.options.map((option, i) => ({
            ...option,
            isCorrect: i === index
        }));
        setQuestion({ ...question, options: newOptions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!question.content.trim()) {
            toast.error('Question content cannot be empty');
            return;
        }
        
        if (!question.options.some(option => option.content.trim() !== '')) {
            toast.error('At least one option must be provided');
            return;
        }
        
        if (!question.options.some(option => option.isCorrect)) {
            toast.error('Please select a correct answer');
            return;
        }

        try {
            setLoading(true);
            await axios.put(`/api/questions/${id}`, question);
            toast.success('Question updated successfully');
            navigate('/admin/questions');
        } catch (error) {
            toast.error('Failed to update question');
            console.error('Error updating question:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">Edit Question</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block mb-2 font-medium">Question:</label>
                    <textarea
                        value={question.content}
                        onChange={handleQuestionChange}
                        className="w-full p-2 border rounded-md"
                        rows="4"
                        required
                    ></textarea>
                </div>

                <div className="space-y-4">
                    <label className="block font-medium">Options:</label>
                    {question.options.map((option, index) => (
                        <div key={option.id} className="flex items-center space-x-3">
                            <input
                                type="radio"
                                name="correctOption"
                                checked={option.isCorrect}
                                onChange={() => handleCorrectOptionChange(index)}
                                className="h-5 w-5"
                            />
                            <input
                                type="text"
                                value={option.content}
                                onChange={(e) => handleOptionChange(index, e)}
                                className="flex-1 p-2 border rounded-md"
                                placeholder={`Option ${index + 1}`}
                                required
                            />
                        </div>
                    ))}
                </div>

                <div>
                    <label className="block mb-2 font-medium">Explanation (Optional):</label>
                    <textarea
                        value={question.explanation}
                        onChange={handleExplanationChange}
                        className="w-full p-2 border rounded-md"
                        rows="3"
                    ></textarea>
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/questions')}
                        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditQuestion;
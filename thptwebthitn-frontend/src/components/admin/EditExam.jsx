import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Container, Card, Form, Button, Spinner, Row, Col } from 'react-bootstrap';

const EditExam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [exam, setExam] = useState({
        title: '',
        description: '',
        duration: 0,
        totalMarks: 0,
        passingMarks: 0,
        startDate: '',
        endDate: '',
        isActive: false
    });

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const response = await axios.get(`/api/exams/${id}`);
                setExam(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching exam:', error);
                toast.error('Failed to load exam details');
                setLoading(false);
            }
        };

        fetchExam();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setExam({
            ...exam,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await axios.put(`/api/exams/${id}`, exam);
            toast.success('Exam updated successfully');
            navigate('/admin/exams');
        } catch (error) {
            console.error('Error updating exam:', error);
            toast.error('Failed to update exam');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header as="h4">Edit Exam</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Exam Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={exam.title}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={exam.description}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Duration (minutes)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="duration"
                                        value={exam.duration}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Total Marks</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="totalMarks"
                                        value={exam.totalMarks}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Passing Marks</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="passingMarks"
                                        value={exam.passingMarks}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="startDate"
                                        value={exam.startDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="endDate"
                                        value={exam.endDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Active"
                                name="isActive"
                                checked={exam.isActive}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-between">
                            <Button variant="primary" type="submit" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" /> Updating...
                                    </>
                                ) : (
                                    'Update Exam'
                                )}
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/admin/exams')}>
                                Cancel
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default EditExam;
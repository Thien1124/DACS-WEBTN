import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaPlus, FaClock, FaGraduationCap, FaBook } from "react-icons/fa";

const Container = styled.div`
  padding: 2rem;
  background: ${(props) => (props.theme === "dark" ? "#1a202c" : "#ffffff")};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: ${(props) => (props.theme === "dark" ? "#ffffff" : "#2d3748")};
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#4a5568")};
  font-weight: 500;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid
    ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
  border-radius: 4px;
  background: ${(props) => (props.theme === "dark" ? "#2d3748" : "#ffffff")};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid
    ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
  border-radius: 4px;
  background: ${(props) => (props.theme === "dark" ? "#2d3748" : "#ffffff")};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #3182ce;
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const OfficialExamCreate = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subjectId: "",
    examTypeId: 2, // Default to official exam type
    duration: 45,
    totalScore: 10,
    passScore: 5,
    maxAttempts: 1,
    startTime: "",
    endTime: "",
    isActive: true,
    showResult: true,
    showAnswers: false,
    shuffleQuestions: true,
    shuffleOptions: true,
  });

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/Subjects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        toast.error("Lỗi khi tải danh sách môn học");
      }
    };
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const startDateTime = new Date(formData.startTime);
      const endDateTime = new Date(formData.endTime);

      const examData = {
        ...formData,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };

      const response = await fetch("/api/Exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(examData),
      });

      if (response.ok) {
        toast.success("Tạo kỳ thi thành công");
        navigate("/admin/exams");
      } else {
        const error = await response.json();
        toast.error(error.message || "Lỗi khi tạo kỳ thi");
      }
    } catch (error) {
      toast.error("Lỗi khi tạo kỳ thi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Tạo Kỳ Thi Chính Thức</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Tên kỳ thi</Label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Mô tả</Label>
          <Input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Môn thi</Label>
          <Select
            name="subjectId"
            value={formData.subjectId}
            onChange={handleChange}
            required
          >
            <option value="">Chọn môn thi</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Thời gian làm bài (phút)</Label>
          <Input
            type="number"
            name="duration"
            min="15"
            max="180"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Điểm đạt tối thiểu</Label>
          <Input
            type="number"
            name="passScore"
            min="0"
            max="10"
            step="0.1"
            value={formData.passScore}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Thời gian bắt đầu</Label>
          <Input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Thời gian kết thúc</Label>
          <Input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <Button type="submit" disabled={loading}>
          <FaPlus />
          {loading ? "Đang tạo..." : "Tạo kỳ thi"}
        </Button>
      </Form>
    </Container>
  );
};

export default OfficialExamCreate;

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaFileExcel, FaDownload, FaUpload } from "react-icons/fa";

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

const ActionBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${(props) =>
    props.variant === "success" ? "#48bb78" : "#4299e1"};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: ${(props) =>
      props.variant === "success" ? "#38a169" : "#3182ce"};
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
  background: ${(props) => (props.theme === "dark" ? "#2d3748" : "#ffffff")};
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  padding: 1rem;
  background: ${(props) => (props.theme === "dark" ? "#4a5568" : "#edf2f7")};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
  text-align: left;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  border-top: 1px solid
    ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
`;

const FileInput = styled.input`
  display: none;
`;

const UploadLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #3182ce;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
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
  max-width: 300px;
`;

const ImportQuestionsFromExcel = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách môn học");
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = "/api/questions/excel-template";
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedSubject || !selectedGrade) {
      toast.error("Vui lòng chọn môn học và khối trước khi tải file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectId", selectedSubject);
    formData.append("grade", selectedGrade);

    try {
      setLoading(true);
      const response = await fetch("/api/questions/preview-excel", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast.error(error.message || "Lỗi khi đọc file Excel");
    } finally {
      setLoading(false);
      event.target.value = null;
    }
  };

  const handleImport = async () => {
    if (!previewData) return;

    try {
      setLoading(true);
      const response = await fetch("/api/questions/import-excel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questions: previewData,
          subjectId: selectedSubject,
          grade: selectedGrade,
        }),
      });

      if (response.ok) {
        toast.success("Import câu hỏi thành công");
        setPreviewData(null);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast.error(error.message || "Lỗi khi import câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Nhập Câu Hỏi Từ Excel</Title>

      <FormGroup>
        <Label>Chọn môn học</Label>
        <Select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          required
        >
          <option value="">Chọn môn học</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Chọn khối</Label>
        <Select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          required
        >
          <option value="">Chọn khối</option>
          <option value="10">Khối 10</option>
          <option value="11">Khối 11</option>
          <option value="12">Khối 12</option>
        </Select>
      </FormGroup>

      <ActionBar>
        <Button onClick={handleDownloadTemplate}>
          <FaDownload />
          Tải mẫu Excel
        </Button>

        <UploadLabel>
          <FaUpload />
          Tải lên file Excel
          <FileInput
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={loading || !selectedSubject || !selectedGrade}
          />
        </UploadLabel>

        {previewData && (
          <Button variant="success" onClick={handleImport} disabled={loading}>
            <FaFileExcel />
            {loading ? "Đang import..." : "Xác nhận import"}
          </Button>
        )}
      </ActionBar>

      {previewData && (
        <PreviewTable>
          <thead>
            <tr>
              <Th>STT</Th>
              <Th>Câu hỏi</Th>
              <Th>Đáp án A</Th>
              <Th>Đáp án B</Th>
              <Th>Đáp án C</Th>
              <Th>Đáp án D</Th>
              <Th>Đáp án đúng</Th>
            </tr>
          </thead>
          <tbody>
            {previewData.map((question, index) => (
              <tr key={index}>
                <Td>{index + 1}</Td>
                <Td>{question.content}</Td>
                <Td>{question.optionA}</Td>
                <Td>{question.optionB}</Td>
                <Td>{question.optionC}</Td>
                <Td>{question.optionD}</Td>
                <Td>{question.correctAnswer}</Td>
              </tr>
            ))}
          </tbody>
        </PreviewTable>
      )}
    </Container>
  );
};

export default ImportQuestionsFromExcel;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { toast } from "react-toastify";
import {
  FaUserPlus,
  FaUserMinus,
  FaSearch,
  FaFileImport,
} from "react-icons/fa";

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
`;

const Panel = styled.div`
  padding: 1rem;
  background: ${(props) => (props.theme === "dark" ? "#2d3748" : "#f7fafc")};
  border-radius: 8px;
`;

const PanelTitle = styled.h3`
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
  margin-bottom: 1rem;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid
    ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
  border-radius: 4px;
  background: ${(props) => (props.theme === "dark" ? "#1a202c" : "#ffffff")};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${(props) =>
    props.variant === "danger" ? "#e53e3e" : "#4299e1"};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${(props) =>
      props.variant === "danger" ? "#c53030" : "#3182ce"};
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
`;

const StudentList = styled.div`
  height: 400px;
  overflow-y: auto;
  border: 1px solid
    ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
  border-radius: 4px;
`;

const StudentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid
    ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${(props) => (props.theme === "dark" ? "#1a202c" : "#f7fafc")};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #48bb78;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #38a169;
  }
`;

const AssignStudentsToExam = () => {
  const { examId } = useParams();
  const [examInfo, setExamInfo] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchAssigned, setSearchAssigned] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExamInfo();
    fetchStudents();
  }, [examId]);

  const fetchExamInfo = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`);
      const data = await response.json();
      setExamInfo(data);
    } catch (error) {
      toast.error("Lỗi khi tải thông tin kỳ thi");
    }
  };

  const fetchStudents = async () => {
    try {
      const [availableRes, assignedRes] = await Promise.all([
        fetch(`/api/exams/${examId}/available-students`),
        fetch(`/api/exams/${examId}/assigned-students`),
      ]);

      const availableData = await availableRes.json();
      const assignedData = await assignedRes.json();

      setAvailableStudents(availableData);
      setAssignedStudents(assignedData);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách học sinh");
    }
  };

  const handleAssign = async (studentId) => {
    try {
      const response = await fetch(`/api/exams/${examId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId }),
      });

      if (response.ok) {
        toast.success("Phân công học sinh thành công");
        fetchStudents();
      } else {
        throw new Error("Lỗi khi phân công học sinh");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUnassign = async (studentId) => {
    try {
      const response = await fetch(`/api/exams/${examId}/unassign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId }),
      });

      if (response.ok) {
        toast.success("Hủy phân công học sinh thành công");
        fetchStudents();
      } else {
        throw new Error("Lỗi khi hủy phân công học sinh");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await fetch(`/api/exams/${examId}/assign-bulk`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Import danh sách học sinh thành công");
        fetchStudents();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      event.target.value = null;
    }
  };

  const filteredAvailable = availableStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchAvailable.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchAvailable.toLowerCase())
  );

  const filteredAssigned = assignedStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchAssigned.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchAssigned.toLowerCase())
  );

  return (
    <Container>
      <Title>Phân công học sinh - {examInfo?.title}</Title>

      <FileLabel>
        <FaFileImport />
        Import từ Excel
        <FileInput
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          disabled={loading}
        />
      </FileLabel>

      <Grid>
        <Panel>
          <PanelTitle>Học sinh chưa được phân công</PanelTitle>
          <SearchBar>
            <Input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              value={searchAvailable}
              onChange={(e) => setSearchAvailable(e.target.value)}
            />
          </SearchBar>
          <StudentList>
            {filteredAvailable.map((student) => (
              <StudentItem key={student.id}>
                <div>
                  {student.name} - {student.studentId}
                </div>
                <Button onClick={() => handleAssign(student.id)}>
                  <FaUserPlus />
                  Thêm
                </Button>
              </StudentItem>
            ))}
          </StudentList>
        </Panel>

        <Panel>
          <PanelTitle>Học sinh đã được phân công</PanelTitle>
          <SearchBar>
            <Input
              type="text"
              placeholder="Tìm kiếm học sinh..."
              value={searchAssigned}
              onChange={(e) => setSearchAssigned(e.target.value)}
            />
          </SearchBar>
          <StudentList>
            {filteredAssigned.map((student) => (
              <StudentItem key={student.id}>
                <div>
                  {student.name} - {student.studentId}
                </div>
                <Button
                  variant="danger"
                  onClick={() => handleUnassign(student.id)}
                >
                  <FaUserMinus />
                  Xóa
                </Button>
              </StudentItem>
            ))}
          </StudentList>
        </Panel>
      </Grid>
    </Container>
  );
};

export default AssignStudentsToExam;

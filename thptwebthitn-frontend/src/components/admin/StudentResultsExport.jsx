import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FaFileExport, FaSearch, FaCheck, FaTimes } from "react-icons/fa";
import { exportResults } from "../../services/resultsExportService";

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

const FilterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
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

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
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

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: white;
  background: ${(props) => (props.approved ? "#48bb78" : "#e53e3e")};
`;

const StudentResultsExport = () => {
  const [filters, setFilters] = useState({
    grade: "",
    class: "",
    subject: "",
    examType: "all",
    searchQuery: "",
  });
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (filters.grade) {
      fetchClassesByGrade(filters.grade);
    }
  }, [filters.grade]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách môn học");
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách lớp học");
    }
  };

  const fetchClassesByGrade = async (grade) => {
    try {
      const response = await fetch(`/api/classes/grade/${grade}`);
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách lớp học");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`/api/results?${queryParams}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      toast.error("Lỗi khi tải kết quả");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      const response = await exportResults({
        startDate: filters.startDate,
        endDate: filters.endDate,
        includeAnswers: true,
        completedOnly: true,
      });

      // Tạo URL cho blob và tải file
      const blob = new Blob([response], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `ket-qua-thi-${new Date().toISOString().slice(0, 10)}.csv`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Xuất kết quả thành công");
    } catch (error) {
      console.error("Error exporting results:", error);
      toast.error(
        "Lỗi khi xuất kết quả: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApproveResult = async (resultId) => {
    try {
      const response = await fetch(`/api/results/${resultId}/approve`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Duyệt kết quả thành công");
        handleSearch(); // Refresh data
      } else {
        throw new Error("Lỗi khi duyệt kết quả");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Container>
      <Title>Quản Lý Kết Quả Học Sinh</Title>

      <FilterSection>
        <FormGroup>
          <Label>Khối</Label>
          <Select
            name="grade"
            value={filters.grade}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả khối</option>
            <option value="10">Khối 10</option>
            <option value="11">Khối 11</option>
            <option value="12">Khối 12</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Lớp</Label>
          <Select
            name="class"
            value={filters.class}
            onChange={handleFilterChange}
            disabled={!filters.grade}
          >
            <option value="">Tất cả lớp</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Môn học</Label>
          <Select
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả môn</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Loại kỳ thi</Label>
          <Select
            name="examType"
            value={filters.examType}
            onChange={handleFilterChange}
          >
            <option value="all">Tất cả</option>
            <option value="official">Chính thức</option>
            <option value="practice">Luyện tập</option>
          </Select>
        </FormGroup>
      </FilterSection>

      <ActionBar>
        <SearchBar>
          <Input
            type="text"
            placeholder="Tìm kiếm học sinh..."
            name="searchQuery"
            value={filters.searchQuery}
            onChange={handleFilterChange}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <FaSearch />
            {loading ? "Đang tìm..." : "Tìm kiếm"}
          </Button>
        </SearchBar>

        <Button
          variant="success"
          onClick={handleExport}
          disabled={loading || results.length === 0}
        >
          <FaFileExport />
          Xuất Excel
        </Button>
      </ActionBar>

      <Table>
        <thead>
          <tr>
            <Th>Học sinh</Th>
            <Th>Lớp</Th>
            <Th>Môn học</Th>
            <Th>Kỳ thi</Th>
            <Th>Điểm số</Th>
            <Th>Thời gian nộp</Th>
            <Th>Trạng thái</Th>
            <Th>Thao tác</Th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id}>
              <Td>{result.studentName}</Td>
              <Td>{result.className}</Td>
              <Td>{result.subjectName}</Td>
              <Td>{result.examTitle}</Td>
              <Td>{result.score}</Td>
              <Td>{new Date(result.submittedAt).toLocaleString()}</Td>
              <Td>
                <StatusBadge approved={result.isApproved}>
                  {result.isApproved ? (
                    <>
                      <FaCheck />
                      Đã duyệt
                    </>
                  ) : (
                    <>
                      <FaTimes />
                      Chưa duyệt
                    </>
                  )}
                </StatusBadge>
              </Td>
              <Td>
                {!result.isApproved && (
                  <Button
                    variant="success"
                    onClick={() => handleApproveResult(result.id)}
                  >
                    <FaCheck />
                    Duyệt
                  </Button>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default StudentResultsExport;

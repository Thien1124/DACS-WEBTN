import React, { useState } from "react";

const ExamSelection = ({ exams }) => {
  const examsPerPage = 5; // Số lượng đề thi hiển thị trên mỗi trang
  const [currentPage, setCurrentPage] = useState(1);

  // Tính toán danh sách đề thi hiện tại dựa trên trang hiện tại
  const indexOfLastExam = currentPage * examsPerPage;
  const indexOfFirstExam = indexOfLastExam - examsPerPage;
  const currentExams = exams.slice(indexOfFirstExam, indexOfLastExam);

  // Tính tổng số trang
  const totalPages = Math.ceil(exams.length / examsPerPage);

  // Chuyển đến trang tiếp theo
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Quay lại trang trước
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Xử lý khi người dùng chọn một đề thi
  const handleExamSelect = (examId) => {
    alert(`Bạn đã chọn đề thi với ID: ${examId}`);
    // Thêm logic chuyển hướng hoặc xử lý khác tại đây
  };

  return (
    <div>
      <h2>Chọn Đề Thi Theo Môn</h2>
      {/* Danh sách đề thi */}
      <ul>
        {currentExams.map((exam) => (
          <li
            key={exam.id}
            style={{
              marginBottom: "10px",
              border: "1px solid #ddd",
              padding: "10px",
            }}
          >
            <span>{exam.title}</span>
            <button
              style={{ marginLeft: "20px" }}
              onClick={() => handleExamSelect(exam.id)}
            >
              Chọn
            </button>
          </li>
        ))}
      </ul>

      {/* Phân trang */}
      <div style={{ marginTop: "20px" }}>
        <button onClick={prevPage} disabled={currentPage === 1}>
          Trang Trước
        </button>
        <span style={{ margin: "0 10px" }}>
          Trang {currentPage} / {totalPages}
        </span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Trang Tiếp
        </button>
      </div>
    </div>
  );
};

export default ExamSelection;

import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Result } from "antd";

const SubmissionSuccess = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    navigate("/dashboard");
  };

  const handleViewResults = () => {
    navigate("/exam-results");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <Result
        icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
        status="success"
        title="Nộp bài thành công!"
        subTitle="Cảm ơn bạn đã hoàn thành bài thi. Kết quả của bạn đã được ghi nhận."
        extra={[
          <Button type="primary" key="results" onClick={handleViewResults}>
            Xem kết quả
          </Button>,
          <Button key="home" onClick={handleBackHome}>
            Về trang chủ
          </Button>,
        ]}
      />
    </div>
  );
};

export default SubmissionSuccess;

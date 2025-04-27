import React, { useState } from "react";
import styled from "styled-components";
import { FaBell, FaCheck, FaSave, FaTimesCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const Card = styled.div`
  background: ${(props) => (props.theme === "dark" ? "#2d3748" : "#ffffff")};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
  font-size: 1.8rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: ${(props) => (props.theme === "dark" ? "#90cdf4" : "#3182ce")};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#4a5568")};
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid
    ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
  border-radius: 6px;
  background: ${(props) => (props.theme === "dark" ? "#2d3748" : "#ffffff")};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid
    ${(props) => (props.theme === "dark" ? "#4a5568" : "#e2e8f0")};
  border-radius: 6px;
  background: ${(props) => (props.theme === "dark" ? "#2d3748" : "#ffffff")};
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#2d3748")};
  min-height: 150px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 0.5rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => (props.theme === "dark" ? "#e2e8f0" : "#4a5568")};
  cursor: pointer;

  input[type="radio"] {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.primary {
    background: linear-gradient(to right, #4285f4, #34a853);
    color: white;

    &:hover {
      background: linear-gradient(to right, #3367d6, #2a8a44);
    }
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const SystemNotifications = () => {
  const theme = useSelector((state) => state.ui.theme);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notificationType, setNotificationType] = useState("all");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung thông báo");
      return;
    }

    setSending(true);
    try {
      // Gọi API gửi thông báo
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          type: notificationType,
        }),
      });

      if (response.ok) {
        toast.success("Đã gửi thông báo thành công!");
        // Reset form
        setTitle("");
        setContent("");
        setNotificationType("all");
      } else {
        throw new Error("Lỗi khi gửi thông báo");
      }
    } catch (error) {
      toast.error("Không thể gửi thông báo: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Container>
      <Card theme={theme}>
        <Title theme={theme}>
          <FaBell />
          Gửi thông báo hệ thống
        </Title>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label theme={theme}>Tiêu đề thông báo</Label>
            <Input
              type="text"
              theme={theme}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề thông báo..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>Nội dung thông báo</Label>
            <Textarea
              theme={theme}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập nội dung thông báo chi tiết..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label theme={theme}>Đối tượng nhận thông báo</Label>
            <RadioGroup>
              <RadioLabel theme={theme}>
                <input
                  type="radio"
                  name="notificationType"
                  value="all"
                  checked={notificationType === "all"}
                  onChange={(e) => setNotificationType(e.target.value)}
                />
                Tất cả
              </RadioLabel>

              <RadioLabel theme={theme}>
                <input
                  type="radio"
                  name="notificationType"
                  value="teachers"
                  checked={notificationType === "teachers"}
                  onChange={(e) => setNotificationType(e.target.value)}
                />
                Giáo viên
              </RadioLabel>

              <RadioLabel theme={theme}>
                <input
                  type="radio"
                  name="notificationType"
                  value="students"
                  checked={notificationType === "students"}
                  onChange={(e) => setNotificationType(e.target.value)}
                />
                Học sinh
              </RadioLabel>
            </RadioGroup>
          </FormGroup>

          <Button type="submit" className="primary" disabled={sending}>
            {sending ? (
              <>
                <FaTimesCircle /> Đang gửi...
              </>
            ) : (
              <>
                <FaSave /> Gửi thông báo
              </>
            )}
          </Button>
        </form>
      </Card>
    </Container>
  );
};

export default SystemNotifications;

import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaBook, FaChartLine, FaLaptop, FaUsers } from 'react-icons/fa';

const FeaturesSection = () => {
  const features = [
    {
      icon: <FaBook size={50} className="mb-3 text-primary" />,
      title: 'Thư viện đề thi',
      description: 'Kho đề thi THPT Quốc gia đa dạng, cập nhật liên tục từ nhiều nguồn uy tín.'
    },
    {
      icon: <FaChartLine size={50} className="mb-3 text-primary" />,
      title: 'Phân tích kết quả',
      description: 'Thống kê chi tiết quá trình học tập và đề xuất phương pháp cải thiện hiệu quả.'
    },
    {
      icon: <FaLaptop size={50} className="mb-3 text-primary" />,
      title: 'Luyện thi trực tuyến',
      description: 'Môi trường thi thử giống thực tế, giúp học sinh làm quen với bài thi số hóa.'
    },
    {
      icon: <FaUsers size={50} className="mb-3 text-primary" />,
      title: 'Cộng đồng học tập',
      description: 'Tham gia cùng cộng đồng hàng nghìn học sinh đang luyện thi THPT Quốc gia.'
    }
  ];

  return (
    <section className="features-section py-5 bg-light">
      <Container>
        <h2 className="text-center mb-5">Tính năng nổi bật</h2>
        <Row>
          {features.map((feature, index) => (
            <Col md={3} sm={6} key={index} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center p-4">
                <Card.Body>
                  {feature.icon}
                  <Card.Title className="mb-3">{feature.title}</Card.Title>
                  <Card.Text>{feature.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default FeaturesSection;

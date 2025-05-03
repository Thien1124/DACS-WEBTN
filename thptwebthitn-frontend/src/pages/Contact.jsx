import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
`;

// Styled Components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  color: #333;
  overflow-x: hidden;
`;

const ContentContainer = styled.div`
  max-width: 1300px;
  width: 100%;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const HeroSection = styled.div`
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a, #1e293b);
`;

const HeroBg = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
`;

const HeroBgPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 900px;
  padding: 0 20px;
`;

const HeroTitle = styled.h1`
  font-size: 60px;
  margin-bottom: 20px;
  font-weight: 800;
  line-height: 1.2;
  color: white;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
`;

const GradientText = styled.span`
  background: linear-gradient(to right, #4f46e5, #06b6d4, #14b8a6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`;

const HeroDescription = styled.p`
  font-size: 22px;
  color: #e2e8f0;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const InfoSection = styled.div`
  padding: 80px 0;
  background-color: #f8fafc;
  position: relative;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const InfoIcon = styled.div`
  font-size: 36px;
  color: #4f46e5;
  margin-bottom: 20px;
  animation: ${pulse} 2s infinite;
`;

const InfoTitle = styled.h3`
  font-size: 22px;
  margin-bottom: 15px;
  color: #0f172a;
`;

const InfoText = styled.p`
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 5px;
`;

const FormSection = styled.div`
  padding: 100px 0;
  background-color: #ffffff;
`;

const FormLayout = styled.div`
  display: flex;
  gap: 50px;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const FormContent = styled.div`
  flex: 1;
  animation: ${fadeIn} 1s ease-out;
`;

const SectionTitle = styled.h2`
  font-size: 36px;
  margin-bottom: 20px;
  font-weight: 700;
  color: #0f172a;
`;

const SectionText = styled.p`
  font-size: 18px;
  margin-bottom: 40px;
  color: #64748b;
  line-height: 1.7;
`;

const ContactForm = styled.form`
  margin-top: 30px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #334155;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
    outline: none;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  min-height: 150px;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
    outline: none;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(to right, #4f46e5, #4338ca);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px rgba(79, 70, 229, 0.2);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 25px rgba(79, 70, 229, 0.3);
    background: linear-gradient(to right, #4338ca, #3730a3);
  }
`;

const MapContainer = styled.div`
  flex: 1;
  height: 550px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  position: relative;
  
  iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
  
  @media (max-width: 992px) {
    height: 400px;
  }
`;

const FAQSection = styled.div`
  padding: 100px 0;
  background-color: #f8fafc;
  text-align: center;
`;

const FAQTitle = styled.h2`
  font-size: 36px;
  margin-bottom: 50px;
  color: #0f172a;
  font-weight: 700;
`;

const FAQGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  text-align: left;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const FAQItem = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 5px solid #4f46e5;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }
`;

const FAQQuestion = styled.h3`
  font-size: 20px;
  margin-bottom: 15px;
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &::after {
    content: '+';
    font-size: 24px;
    color: #4f46e5;
  }
`;

const FAQAnswer = styled.p`
  color: #64748b;
  line-height: 1.6;
`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý gửi form ở đây
    console.log(formData);
    alert('Cảm ơn bạn đã liên hệ với chúng tôi!');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <PageContainer>
      <HeroSection>
        <HeroBg>
          <HeroBgPattern />
        </HeroBg>
        <HeroContent data-aos="fade-up">
          <HeroTitle>
            <GradientText>Liên hệ</GradientText> với chúng tôi
          </HeroTitle>
          <HeroDescription>
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </HeroDescription>
        </HeroContent>
      </HeroSection>

      <InfoSection>
        <ContentContainer>
          <InfoGrid>
            <InfoCard data-aos="fade-up" data-aos-delay="100">
              <InfoIcon>
                <i className="fas fa-map-marker-alt"></i>
              </InfoIcon>
              <InfoTitle>Địa chỉ</InfoTitle>
              <InfoText>123 Đường ABC, Quận XYZ</InfoText>
              <InfoText>TP. Hồ Chí Minh</InfoText>
            </InfoCard>
            <InfoCard data-aos="fade-up" data-aos-delay="200">
              <InfoIcon>
                <i className="fas fa-phone-alt"></i>
              </InfoIcon>
              <InfoTitle>Điện thoại</InfoTitle>
              <InfoText>+84 123 456 789</InfoText>
              <InfoText>+84 987 654 321</InfoText>
            </InfoCard>
            <InfoCard data-aos="fade-up" data-aos-delay="300">
              <InfoIcon>
                <i className="fas fa-envelope"></i>
              </InfoIcon>
              <InfoTitle>Email</InfoTitle>
              <InfoText>info@thptwebthitn.com</InfoText>
              <InfoText>support@thptwebthitn.com</InfoText>
            </InfoCard>
            <InfoCard data-aos="fade-up" data-aos-delay="400">
              <InfoIcon>
                <i className="fas fa-clock"></i>
              </InfoIcon>
              <InfoTitle>Giờ làm việc</InfoTitle>
              <InfoText>Thứ Hai - Thứ Sáu: 8:00 - 17:00</InfoText>
              <InfoText>Thứ Bảy: 8:00 - 12:00</InfoText>
            </InfoCard>
          </InfoGrid>
        </ContentContainer>
      </InfoSection>

      <FormSection>
        <ContentContainer>
          <FormLayout>
            <FormContent>
              <SectionTitle data-aos="fade-right">
                Gửi tin nhắn cho <GradientText>chúng tôi</GradientText>
              </SectionTitle>
              <SectionText data-aos="fade-right" data-aos-delay="100">
                Hãy điền thông tin của bạn dưới đây và chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.
              </SectionText>
              
              <ContactForm onSubmit={handleSubmit}>
                <FormRow>
                  <FormGroup data-aos="fade-up" data-aos-delay="100">
                    <FormLabel htmlFor="name">Họ và tên</FormLabel>
                    <FormInput
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup data-aos="fade-up" data-aos-delay="150">
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormInput
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup data-aos="fade-up" data-aos-delay="200">
                    <FormLabel htmlFor="phone">Số điện thoại</FormLabel>
                    <FormInput
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </FormGroup>
                  <FormGroup data-aos="fade-up" data-aos-delay="250">
                    <FormLabel htmlFor="subject">Chủ đề</FormLabel>
                    <FormInput
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                </FormRow>
                
                <FormGroup data-aos="fade-up" data-aos-delay="300">
                  <FormLabel htmlFor="message">Tin nhắn</FormLabel>
                  <FormTextarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></FormTextarea>
                </FormGroup>
                
                <SubmitButton type="submit" data-aos="fade-up" data-aos-delay="350">
                  Gửi tin nhắn
                </SubmitButton>
              </ContactForm>
            </FormContent>
            
            <MapContainer data-aos="fade-left">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4650797869284!2d106.78301837475936!3d10.855738189306786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175276e7ea103df%3A0xb6cf10bb7d719327!2sHUTECH%20-%20%C4%90%E1%BA%A1i%20h%E1%BB%8Dc%20C%C3%B4ng%20ngh%E1%BB%87%20TP.HCM%20(Thu%20Duc%20Campus)!5e0!3m2!1svi!2s!4v1714905000000!5m2!1svi!2s"
                allowFullScreen="" 
                loading="lazy"
                title="Google Maps"
              ></iframe>
            </MapContainer>
          </FormLayout>
        </ContentContainer>
      </FormSection>

      <FAQSection>
        <ContentContainer>
          <FAQTitle data-aos="fade-up">Câu hỏi thường gặp</FAQTitle>
          <FAQGrid>
            <FAQItem data-aos="fade-up" data-aos-delay="100">
              <FAQQuestion>Làm thế nào để đăng ký tài khoản?</FAQQuestion>
              <FAQAnswer>Bạn có thể dễ dàng đăng ký tài khoản bằng cách nhấp vào nút "Đăng ký" ở góc phải trên cùng của trang chủ và làm theo hướng dẫn.</FAQAnswer>
            </FAQItem>
            <FAQItem data-aos="fade-up" data-aos-delay="200">
              <FAQQuestion>Tôi quên mật khẩu thì phải làm sao?</FAQQuestion>
              <FAQAnswer>Bạn có thể khôi phục mật khẩu bằng cách nhấp vào liên kết "Quên mật khẩu" trên trang đăng nhập và làm theo hướng dẫn gửi đến email của bạn.</FAQAnswer>
            </FAQItem>
            <FAQItem data-aos="fade-up" data-aos-delay="300">
              <FAQQuestion>Làm thế nào để tham gia một bài thi?</FAQQuestion>
              <FAQAnswer>Sau khi đăng nhập, bạn có thể tìm kiếm bài thi trong danh mục "Bài thi" và nhấp vào "Tham gia" để bắt đầu.</FAQAnswer>
            </FAQItem>
            <FAQItem data-aos="fade-up" data-aos-delay="400">
              <FAQQuestion>Làm thế nào để xem kết quả bài thi?</FAQQuestion>
              <FAQAnswer>Sau khi hoàn thành bài thi, kết quả sẽ được hiển thị ngay lập tức. Bạn cũng có thể xem lại lịch sử bài thi trong phần "Hồ sơ" của mình.</FAQAnswer>
            </FAQItem>
          </FAQGrid>
        </ContentContainer>
      </FAQSection>
    </PageContainer>
  );
};

export default Contact;
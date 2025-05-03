import React, { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import AOS from 'aos';
import 'aos/dist/aos.css';
import missionImage from '../assets/images/mission.png'
//import member1 from '../assets/images/team/member1.jpg';
//import member2 from '../assets/images/team/member2.jpg';
import defaultMember from '../assets/images/team/default-member.jpg'; // Ảnh mặc định (tạo file này)

const memberImages = {
  1: defaultMember,
  2: defaultMember,
  3: defaultMember
};
const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);

  return (
    <PageContainer>
      <HeroSection>
        <AnimatedBackground />
        <HeroContent data-aos="fade-up">
          <GradientTitle>Về chúng tôi</GradientTitle>
          <HeroDescription>Nền tảng thi trực tuyến hàng đầu dành cho học sinh THPT</HeroDescription>
          <ShapesContainer>
            <Shape className="shape-1" />
            <Shape className="shape-2" />
            <Shape className="shape-3" />
            <Shape className="shape-4" />
          </ShapesContainer>
        </HeroContent>
      </HeroSection>

      <MissionSection>
        <ContentContainer>
          <MissionLayout>
            <MissionContent data-aos="fade-right">
              <SectionBadge>Sứ mệnh của chúng tôi</SectionBadge>
              <SectionTitle>Kiến tạo tương lai <GradientSpan>giáo dục số</GradientSpan></SectionTitle>
              <Description>
                Cung cấp nền tảng học tập và thi trực tuyến chất lượng cao, giúp học sinh THPT tiếp cận kiến thức một cách hiệu quả, chuẩn bị tốt nhất cho kỳ thi quan trọng của đời học sinh.
              </Description>
              <BadgeContainer>
                <Badge>Đổi mới</Badge>
                <Badge>Sáng tạo</Badge>
                <Badge>Hiệu quả</Badge>
              </BadgeContainer>
            </MissionContent>
            <MissionImageContainer data-aos="fade-left">
              <ImageCard>
                <CardImage src={missionImage} alt="Sứ mệnh" />
                <ImageOverlay>
                  <OverlayContent>
                    <h3>10+ năm</h3>
                    <p>Kinh nghiệm giáo dục</p>
                  </OverlayContent>
                </ImageOverlay>
              </ImageCard>
            </MissionImageContainer>
          </MissionLayout>
        </ContentContainer>
      </MissionSection>

      <StatsSection>
        <StatsBlob />
        <ContentContainer>
          <StatsGrid>
            <StatItem data-aos="zoom-in" data-aos-delay="100">
              <StatIcon><i className="fas fa-user-graduate"></i></StatIcon>
              <StatCounter>10,000+</StatCounter>
              <StatDescription>Học sinh</StatDescription>
            </StatItem>
            <StatItem data-aos="zoom-in" data-aos-delay="200">
              <StatIcon><i className="fas fa-file-alt"></i></StatIcon>
              <StatCounter>5,000+</StatCounter>
              <StatDescription>Bài thi</StatDescription>
            </StatItem>
            <StatItem data-aos="zoom-in" data-aos-delay="300">
              <StatIcon><i className="fas fa-thumbs-up"></i></StatIcon>
              <StatCounter>98%</StatCounter>
              <StatDescription>Đánh giá tích cực</StatDescription>
            </StatItem>
            <StatItem data-aos="zoom-in" data-aos-delay="400">
              <StatIcon><i className="fas fa-headset"></i></StatIcon>
              <StatCounter>24/7</StatCounter>
              <StatDescription>Hỗ trợ</StatDescription>
            </StatItem>
          </StatsGrid>
        </ContentContainer>
      </StatsSection>

      <TeamSection>
        <ContentContainer>
          <SectionHeader data-aos="fade-up">
            <SectionBadge>Đội ngũ chuyên gia</SectionBadge>
            <SectionTitle>Gặp gỡ đội ngũ <GradientSpan>sáng tạo</GradientSpan> của chúng tôi</SectionTitle>
          </SectionHeader>
          <TeamGrid>
            {[
              { id: 1, name: "Nguyễn Trường Vinh Sơn", role: "Trưởng nhóm phát triển Frontend" },
              { id: 2, name: "Nguyễn Phước Thiện", role: "Chuyên gia phát triển Backend" },
              { id: 3, name: "Nguyễn Gia Triệu", role: "Kỹ sư phát triển Frontend" }
            ].map((member, index) => (
              <TeamMember key={member.id} data-aos="flip-left" data-aos-delay={index * 100}>
                <MemberImageContainer>
                <MemberImage 
                  src={memberImages[member.id] || defaultMember} 
                  alt={member.name} 
                  onError={(e) => {e.target.src = defaultMember}} // Xử lý lỗi ảnh
                />
                  <SocialIcons>
                    <SocialIcon href="#"><i className="fab fa-facebook-f"></i></SocialIcon>
                    <SocialIcon href="#"><i className="fab fa-twitter"></i></SocialIcon>
                    <SocialIcon href="#"><i className="fab fa-linkedin-in"></i></SocialIcon>
                  </SocialIcons>
                </MemberImageContainer>
                <MemberInfo>
                  <MemberName>{member.name}</MemberName>
                  <MemberRole>{member.role}</MemberRole>
                </MemberInfo>
              </TeamMember>
            ))}
          </TeamGrid>
        </ContentContainer>
      </TeamSection>

      <ValuesSection>
        <WaveSVG />
        <ContentContainer>
          <SectionHeader data-aos="fade-up">
            <SectionBadge>Giá trị cốt lõi</SectionBadge>
            <SectionTitle>Những <GradientSpan>giá trị</GradientSpan> chúng tôi theo đuổi</SectionTitle>
          </SectionHeader>
          <ValuesGrid>
            {[
              { icon: "fas fa-graduation-cap", title: "Chất lượng giáo dục", description: "Cam kết mang đến nội dung học tập chuẩn chương trình, đảm bảo chất lượng cao." },
              { icon: "fas fa-users", title: "Hỗ trợ học sinh", description: "Luôn đặt học sinh làm trung tâm, hỗ trợ tối đa trong quá trình học tập." },
              { icon: "fas fa-lightbulb", title: "Đổi mới sáng tạo", description: "Không ngừng cải tiến phương pháp giảng dạy và công nghệ để tối ưu trải nghiệm học tập." },
              { icon: "fas fa-shield-alt", title: "Tin cậy", description: "Xây dựng niềm tin với học sinh và phụ huynh thông qua sự minh bạch và uy tín." }
            ].map((value, index) => (
              <ValueCard key={index} data-aos="zoom-in-up" data-aos-delay={index * 100}>
                <ValueIcon><i className={value.icon}></i></ValueIcon>
                <ValueTitle>{value.title}</ValueTitle>
                <ValueDescription>{value.description}</ValueDescription>
                <HoverEffect />
              </ValueCard>
            ))}
          </ValuesGrid>
        </ContentContainer>
      </ValuesSection>
      
      <CTASection>
        <ContentContainer>
          <CTAContent data-aos="fade-up">
            <CTATitle>Sẵn sàng nâng cao chất lượng học tập?</CTATitle>
            <CTADescription>Hãy bắt đầu hành trình học tập cùng chúng tôi ngay hôm nay</CTADescription>
            <CTAButton>Bắt đầu ngay</CTAButton>
          </CTAContent>
        </ContentContainer>
      </CTASection>
    </PageContainer>
  );
};

// Animation Keyframes
const float = keyframes`
  0% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0) rotate(0deg); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50% }
  50% { background-position: 100% 50% }
  100% { background-position: 0% 50% }
`;

const animateBg = keyframes`
  from { background-position: 0 0; }
  to { background-position: 100% 100%; }
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
  padding: 0 2rem;
`;

const HeroSection = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 0;
  overflow: hidden;
  background-color: #0f172a;
`;

const AnimatedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #0f172a 0%, #1e293b 100%);
  z-index: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.05'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    animation: ${animateBg} 50s linear infinite;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 900px;
  padding: 0 20px;
`;

const GradientTitle = styled.h1`
  font-size: 72px;
  margin-bottom: 30px;
  font-weight: 800;
  line-height: 1.2;
  text-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  background: linear-gradient(to right, #4f46e5, #06b6d4, #14b8a6);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  animation: ${gradientMove} 5s ease infinite;
`;

const GradientSpan = styled.span`
  background: linear-gradient(to right, #4f46e5, #06b6d4, #14b8a6);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  animation: ${gradientMove} 5s ease infinite;
`;

const HeroDescription = styled.p`
  font-size: 22px;
  color: #e2e8f0;
  margin-bottom: 40px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const ShapesContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

const Shape = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.4;
  
  &.shape-1 {
    top: 10%;
    left: 10%;
    width: 200px;
    height: 200px;
    background: #4f46e5;
    animation: ${float} 8s ease-in-out infinite;
  }
  
  &.shape-2 {
    bottom: 20%;
    right: 15%;
    width: 250px;
    height: 250px;
    background: #06b6d4;
    animation: ${float} 12s ease-in-out infinite;
  }
  
  &.shape-3 {
    top: 60%;
    left: 15%;
    width: 180px;
    height: 180px;
    background: #14b8a6;
    animation: ${float} 10s ease-in-out infinite;
  }
  
  &.shape-4 {
    top: 30%;
    right: 10%;
    width: 220px;
    height: 220px;
    background: #3b82f6;
    animation: ${float} 14s ease-in-out infinite;
  }
`;

const MissionSection = styled.div`
  padding: 120px 0;
  background-color: #ffffff;
  position: relative;
`;

const MissionLayout = styled.div`
  display: flex;
  align-items: center;
  gap: 50px;
  
  @media (max-width: 992px) {
    flex-direction: column;
  }
`;

const MissionContent = styled.div`
  flex: 1;
  
  @media (max-width: 992px) {
    text-align: center;
    max-width: 100%;
  }
`;

const SectionBadge = styled.div`
  display: inline-block;
  background: linear-gradient(to right, #4f46e5, #3b82f6);
  color: white;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
`;

const SectionTitle = styled.h2`
  font-size: 36px;
  margin-bottom: 20px;
  color: #1e293b;
  font-weight: 700;
`;

const Description = styled.p`
  font-size: 18px;
  line-height: 1.7;
  color: #64748b;
  margin-bottom: 30px;
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 30px;
  
  @media (max-width: 992px) {
    justify-content: center;
  }
`;

const Badge = styled.div`
  background-color: #f1f5f9;
  color: #3b82f6;
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #3b82f6;
    color: white;
    transform: translateY(-5px);
  }
`;

const MissionImageContainer = styled.div`
  flex: 1;
`;

const ImageCard = styled.div`
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.5s ease;
  
  ${ImageCard}:hover & {
    transform: scale(1.1);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 30px;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${ImageCard}:hover & {
    opacity: 1;
  }
`;

const OverlayContent = styled.div`
  h3 {
    font-size: 24px;
    margin-bottom: 5px;
  }
  
  p {
    font-size: 16px;
    opacity: 0.9;
  }
`;

const StatsSection = styled.div`
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  color: white;
  padding: 80px 0;
  position: relative;
  overflow: hidden;
`;

const StatsBlob = styled.div`
  position: absolute;
  top: -150px;
  right: -150px;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(60px);
`;

const StatsGrid = styled.div`
  display: flex;
  justify-content: space-between;
  text-align: center;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const StatItem = styled.div`
  padding: 20px;
  flex: 1;
  
  @media (max-width: 768px) {
    width: 50%;
    margin-bottom: 30px;
  }
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const StatIcon = styled.div`
  font-size: 36px;
  margin-bottom: 15px;
  opacity: 0.9;
`;

const StatCounter = styled.h3`
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const StatDescription = styled.p`
  font-size: 18px;
  opacity: 0.9;
`;

const TeamSection = styled.div`
  padding: 100px 0;
  background-color: #fff;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 60px;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 50px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const TeamMember = styled.div`
  background-color: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-15px);
  }
`;

const MemberImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
  height: 320px; // Chiều cao cố định để đồng nhất
`;

const MemberImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${TeamMember}:hover & {
    transform: scale(1.1);
  }
`;

const SocialIcons = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 15px 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  transform: translateY(100%);
  transition: transform 0.3s ease;
  
  ${TeamMember}:hover & {
    transform: translateY(0);
  }
`;

const SocialIcon = styled.a`
  color: white;
  margin: 0 10px;
  font-size: 18px;
  transition: color 0.3s ease, transform 0.3s ease;
  
  &:hover {
    color: #4f46e5;
    transform: translateY(-5px);
  }
`;

const MemberInfo = styled.div`
  padding: 25px;
  text-align: center;
  background: white;
  border-radius: 0 0 20px 20px;
`;

const MemberName = styled.h3`
  font-size: 22px;
  margin-bottom: 8px;
  color: #1e293b;
  font-weight: 700;
`;

const MemberRole = styled.p`
  color: #4f46e5;
  font-weight: 500;
  font-size: 16px;
  opacity: 0.9;
`;

const ValuesSection = styled.div`
  background-color: #f8fafc;
  padding: 100px 0;
  position: relative;
  overflow: hidden;
`;

const WaveSVG = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='1' d='M0,224L48,213.3C96,203,192,181,288,176C384,171,480,181,576,197.3C672,213,768,235,864,224C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: cover;
`;

const ValuesGrid = styled.div`
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

const ValueCard = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px 25px;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  z-index: 1;
  
  &:hover {
    transform: translateY(-15px);
  }
`;

const ValueIcon = styled.div`
  font-size: 36px;
  margin-bottom: 20px;
  color: #4f46e5;
  position: relative;
  z-index: 2;
`;

const ValueTitle = styled.h3`
  font-size: 22px;
  margin-bottom: 15px;
  color: #1e293b;
  position: relative;
  z-index: 2;
`;

const ValueDescription = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #64748b;
  position: relative;
  z-index: 2;
`;

const HoverEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(59, 130, 246, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
  
  ${ValueCard}:hover & {
    opacity: 1;
  }
`;

const CTASection = styled.div`
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
  padding: 100px 0;
  color: white;
`;

const CTAContent = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: 42px;
  margin-bottom: 20px;
  font-weight: 700;
`;

const CTADescription = styled.p`
  font-size: 20px;
  margin-bottom: 40px;
  opacity: 0.9;
`;

const CTAButton = styled.button`
  background-color: white;
  color: #4f46e5;
  border: none;
  padding: 15px 40px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  }
`;

export default About;
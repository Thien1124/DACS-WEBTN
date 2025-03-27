import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const FooterContainer = styled.footer`
  background-color: ${props => props.theme === 'dark' ? '#0a0a14' : '#f1f1f1'};
  color: ${props => props.theme === 'dark' ? '#b3b3b3' : '#666666'};
  padding: 3rem 2rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const FooterSection = styled(motion.div)`
  display: flex;
  flex-direction: column;
`;

const FooterTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
`;

const FooterLink = styled(motion.a)`
  margin-bottom: 0.8rem;
  color: ${props => props.theme === 'dark' ? '#b3b3b3' : '#666666'};
  text-decoration: none;
  position: relative;
  width: fit-content;
  
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 1px;
    bottom: -2px;
    left: 0;
    background-color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
    transition: width 0.3s ease;
  }
  
  &:hover:after {
    width: 100%;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#333333' : '#dddddd'};
`;

function Footer() {
  const { theme } = useSelector(state => state.ui);
  
  const footerSections = [
    {
      title: 'Về LearnDG',
      links: [
        { text: 'Giới thiệu', url: '#' },
        { text: 'Đội ngũ giảng viên', url: '#' },
        { text: 'Tuyển dụng', url: '#' }
      ]
    },
    {
      title: 'Khóa học',
      links: [
        { text: 'Lập trình', url: '#' },
        { text: 'Thiết kế', url: '#' },
        { text: 'Marketing', url: '#' }
      ]
    },
    {
      title: 'Hỗ trợ',
      links: [
        { text: 'Câu hỏi thường gặp', url: '#' },
        { text: 'Liên hệ', url: '#' },
        { text: 'Điều khoản', url: '#' }
      ]
    }
  ];

  return (
    <FooterContainer theme={theme}>
      <FooterContent>
        {footerSections.map((section, i) => (
          <FooterSection
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            <FooterTitle theme={theme}>{section.title}</FooterTitle>
            {section.links.map((link, j) => (
              <FooterLink
                key={j}
                href={link.url}
                theme={theme}
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                {link.text}
              </FooterLink>
            ))}
          </FooterSection>
        ))}
      </FooterContent>
      
      <Copyright theme={theme}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
        >
          © {new Date().getFullYear()} LearnDG. Tất cả quyền được bảo lưu.
        </motion.p>
      </Copyright>
    </FooterContainer>
  );
}

export default Footer;
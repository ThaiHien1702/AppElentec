import { Twitch, Github, Facebook, Linkedin, FileText } from "lucide-react";
import { Link } from "react-router-dom";
const FooterLink = ({ href, to, children }) => {
  const className =
    "block text-gray-400 hover:text-white transition-colors duration-200";
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
};
const SocialLink = ({ href, children }) => {
  return (
    <a
      href={href}
      className="w-10 h-10 bg-blue-400 flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-gray-400 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
        <div className="space-y-4 md:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
              <FileText className="w-4 h-4 text-white"></FileText>
            </div>
            <span className="text-xl font-bold">Elentec</span>
          </Link>
          <p className="text-gray-400 leading-relaxed max-w-sm">
            Cách đơn giản nhất để xây dựng và triển khai các ứng dụng web.
          </p>
        </div>
        <div>
          <h3 className="text-base font-semibold mb-4">Sản phẩm</h3>
          <ul className="space-y-2">
            <li className="">
              <FooterLink to="/features">Tính năng</FooterLink>
            </li>
            <li className="">
              <FooterLink to="/testimonials">Đánh giá</FooterLink>
            </li>
            <li className="">
              <FooterLink to="/faqs">Câu hỏi thường gặp</FooterLink>
            </li>
          </ul>
        </div>
        <div className="">
          <h3 className="text-base font-semibold mb-4">Công ty</h3>
          <ul className="space-y-2">
            <li className="">
              <FooterLink to="/about">Về chúng tôi</FooterLink>
            </li>
            <li className="">
              <FooterLink to="/contact">Liên hệ</FooterLink>
            </li>
          </ul>
        </div>
        <div className="">
          <h3 className="text-base font-semibold mb-4">Pháp lý</h3>
          <ul className="space-y-2">
            <li className="">
              <FooterLink to="/privacy">Chính sách bảo mật</FooterLink>
            </li>
            <li className="">
              <FooterLink to="/terms">Điều khoản dịch vụ</FooterLink>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400">
            © 2026 Elentec. Tất cả các quyền được bảo lưu.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <SocialLink href="#">
              <Github className="w-5 h-5 text-white"></Github>
            </SocialLink>
            <SocialLink href="#">
              <Facebook className="w-5 h-5 text-white"></Facebook>
            </SocialLink>
            <SocialLink href="#">
              <Linkedin className="w-5 h-5 text-white"></Linkedin>
            </SocialLink>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

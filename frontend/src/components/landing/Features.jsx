import { ArrowBigRight } from "lucide-react";
import { FEAURES } from "../../utils/data";
const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px66 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Các tính năng mạnh mẽ giúp điều hành doanh nghiệp của bạn
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Việc điều hành doanh nghiệp hiệu quả đòi hỏi các tính năng quản trị
            quản lý tài chính/nhân sự/CRM tích hợp (ERP), tự động hóa quy trình,
            báo cáo thông minh theo thời gian thực và phân tích dữ liệu
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEAURES.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:translate-y-1 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              <a
                href="#"
                className="inline-flex items-center text-blue-400 font-medium mt-4 hover:text-black transition-colors duration-200"
              >
                Tìm hiểu thêm <ArrowBigRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

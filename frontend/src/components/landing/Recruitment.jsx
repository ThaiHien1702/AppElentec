import { useState } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  ChevronRight,
  CheckCircle,
  Building2,
} from "lucide-react";

const Recruitment = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const jobCategories = [
    { id: "all", label: "Tất cả vị trí" },
    { id: "production", label: "Sản xuất" },
    { id: "office", label: "Văn phòng" },
    { id: "technical", label: "Kỹ thuật" },
    { id: "management", label: "Quản lý" },
  ];

  const jobPostings = [
    {
      id: 1,
      category: "production",
      title: "Công nhân sản xuất",
      department: "Bộ phận sản xuất",
      location: "KCN Quang Minh, Mê Linh, Hà Nội",
      salary: "7,000,000 - 12,000,000 VNĐ",
      type: "Toàn thời gian",
      positions: "50 người",
      deadline: "31/03/2026",
      requirements: [
        "Độ tuổi: 18 - 40 tuổi",
        "Sức khỏe tốt, không sợ độ cao",
        "Có thể làm ca 3 ca luân phiên",
        "Không cần kinh nghiệm, công ty đào tạo",
      ],
      benefits: [
        "Lương cơ bản + phụ cấp + thưởng",
        "Tăng ca x1.5 - x2.0 - x3.0 theo quy định",
        "BHXH, BHYT, BHTN đầy đủ",
        "Thưởng lễ tết, sinh nhật, hiếu hỉ",
        "Nghỉ phép năm, du lịch hàng năm",
      ],
      urgent: true,
    },
    {
      id: 2,
      category: "production",
      title: "Công nhân kỹ thuật",
      department: "Bộ phận kỹ thuật sản xuất",
      location: "KCN Quang Minh, Mê Linh, Hà Nội",
      salary: "9,000,000 - 15,000,000 VNĐ",
      type: "Toàn thời gian",
      positions: "20 người",
      deadline: "31/03/2026",
      requirements: [
        "Tốt nghiệp THPT trở lên",
        "Am hiểu về cơ khí, điện tử",
        "Có kinh nghiệm làm việc tại nhà máy ưu tiên",
        "Có thể làm ca 3 ca luân phiên",
      ],
      benefits: [
        "Lương cạnh tranh theo năng lực",
        "Được đào tạo nâng cao tay nghề",
        "BHXH, BHYT, BHTN đầy đủ",
        "Môi trường làm việc chuyên nghiệp",
        "Cơ hội thăng tiến cao",
      ],
      urgent: true,
    },
    {
      id: 3,
      category: "office",
      title: "Nhân viên hành chính nhân sự",
      department: "Phòng hành chính nhân sự",
      location: "KCN Quang Minh, Mê Linh, Hà Nội",
      salary: "8,000,000 - 12,000,000 VNĐ",
      type: "Toàn thời gian",
      positions: "3 người",
      deadline: "25/03/2026",
      requirements: [
        "Tốt nghiệp Cao đẳng/Đại học chuyên ngành liên quan",
        "Am hiểu luật lao động",
        "Sử dụng thành thạo tin học văn phòng",
        "Có kinh nghiệm 1 năm ưu tiên",
      ],
      benefits: [
        "Lương thỏa thuận theo năng lực",
        "Làm việc giờ hành chính",
        "BHXH, BHYT, BHTN đầy đủ",
        "Thưởng theo hiệu quả công việc",
        "Chế độ đãi ngộ tốt",
      ],
      urgent: false,
    },
    {
      id: 4,
      category: "technical",
      title: "Kỹ sư điện - Điện tử",
      department: "Bộ phận kỹ thuật",
      location: "KCN Quang Minh, Mê Linh, Hà Nội",
      salary: "12,000,000 - 20,000,000 VNĐ",
      type: "Toàn thời gian",
      positions: "5 người",
      deadline: "30/03/2026",
      requirements: [
        "Tốt nghiệp Đại học chuyên ngành Điện - Điện tử",
        "Có kinh nghiệm 2 năm trở lên",
        "Biết đọc bản vẽ kỹ thuật",
        "Có khả năng làm việc độc lập và làm việc nhóm",
      ],
      benefits: [
        "Lương cao + thưởng dự án",
        "Môi trường làm việc hiện đại",
        "Được đào tạo công nghệ mới",
        "BHXH, BHYT, BHTN đầy đủ",
        "Cơ hội phát triển nghề nghiệp",
      ],
      urgent: true,
    },
    {
      id: 5,
      category: "management",
      title: "Trưởng/Phó phòng sản xuất",
      department: "Bộ phận sản xuất",
      location: "KCN Quang Minh, Mê Linh, Hà Nội",
      salary: "Thỏa thuận",
      type: "Toàn thời gian",
      positions: "2 người",
      deadline: "20/03/2026",
      requirements: [
        "Tốt nghiệp Đại học chuyên ngành liên quan",
        "Có kinh nghiệm 3-5 năm ở vị trí quản lý",
        "Am hiểu quy trình sản xuất linh kiện điện tử",
        "Kỹ năng lãnh đạo và quản lý nhân sự tốt",
      ],
      benefits: [
        "Mức lương hấp dẫn",
        "Quyền hạn và trách nhiệm rõ ràng",
        "Thưởng hiệu suất cao",
        "BHXH, BHYT, BHTN đầy đủ",
        "Cơ hội thăng tiến lên cấp cao",
      ],
      urgent: false,
    },
    {
      id: 6,
      category: "office",
      title: "Nhân viên kế toán",
      department: "Phòng tài chính kế toán",
      location: "KCN Quang Minh, Mê Linh, Hà Nội",
      salary: "8,000,000 - 15,000,000 VNĐ",
      type: "Toàn thời gian",
      positions: "2 người",
      deadline: "28/03/2026",
      requirements: [
        "Tốt nghiệp Cao đẳng/Đại học chuyên ngành Kế toán",
        "Am hiểu chế độ kế toán hiện hành",
        "Sử dụng thành thạo phần mềm kế toán",
        "Có kinh nghiệm 1-2 năm ưu tiên",
      ],
      benefits: [
        "Lương cạnh tranh",
        "Làm việc giờ hành chính",
        "BHXH, BHYT, BHTN đầy đủ",
        "Môi trường làm việc chuyên nghiệp",
        "Thưởng hiệu quả công việc",
      ],
      urgent: false,
    },
  ];

  const filteredJobs =
    selectedCategory === "all"
      ? jobPostings
      : jobPostings.filter((job) => job.category === selectedCategory);

  return (
    <section id="recruitment" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề phần */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Cơ hội <span className="text-blue-500">nghề nghiệp</span>
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tham gia đội ngũ ELENTEC - Nơi phát triển sự nghiệp của bạn
          </p>
        </div>

        {/* Phần Tại sao chọn chúng tôi */}
        <div className="bg-linear-to-r from-blue-500 to-blue-600 rounded-2xl p-8 md:p-12 mb-12 text-white">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6 text-center">
              Tại sao nên làm việc tại ELENTEC?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2">Lương thưởng hấp dẫn</h4>
                <p className="text-white/90 text-sm">
                  Chế độ lương thưởng cạnh tranh, đầy đủ phúc lợi theo luật
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2">
                  Môi trường chuyên nghiệp
                </h4>
                <p className="text-white/90 text-sm">
                  Làm việc trong môi trường quốc tế, hiện đại và thân thiện
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2">Cơ hội thăng tiến</h4>
                <p className="text-white/90 text-sm">
                  Lộ trình phát triển nghề nghiệp rõ ràng, nhiều cơ hội đào tạo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danh mục công việc */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {jobCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 shadow"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Danh sách công việc */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
            >
              {/* Tiêu đề công việc */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 text-sm flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {job.department}
                    </p>
                  </div>
                  {job.urgent && (
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      GẤP
                    </span>
                  )}
                </div>
              </div>

              {/* Chi tiết công việc */}
              <div className="p-6 space-y-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mr-3 text-blue-500 shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <DollarSign className="w-4 h-4 mr-3 text-green-500 shrink-0" />
                  <span className="font-semibold text-green-600">
                    {job.salary}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-4 h-4 mr-3 text-purple-500 shrink-0" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Users className="w-4 h-4 mr-3 text-orange-500 shrink-0" />
                  <span>Số lượng: {job.positions}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-3 text-red-500 shrink-0" />
                  <span>Hạn nộp: {job.deadline}</span>
                </div>

                {/* Yêu cầu */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm">
                    Yêu cầu:
                  </h4>
                  <ul className="space-y-2">
                    {job.requirements.slice(0, 3).map((req, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-600 flex items-start"
                      >
                        <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-500 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nút Ứng tuyển */}
                <button className="w-full mt-4 bg-linear-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium flex items-center justify-center group">
                  Ứng tuyển ngay
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Phần liên hệ */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Liên hệ tuyển dụng
            </h3>
            <p className="text-gray-600 mb-6">
              Để biết thêm thông tin chi tiết về các vị trí tuyển dụng hoặc nộp
              hồ sơ trực tiếp, vui lòng liên hệ:
            </p>
            <div className="space-y-3 text-left max-w-xl mx-auto">
              <div className="flex items-center justify-center">
                <span className="font-semibold text-gray-700 w-32">
                  Phòng HCNS:
                </span>
                <span className="text-blue-600 font-semibold">
                  024.XXXX.XXXX
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="font-semibold text-gray-700 w-32">Email:</span>
                <span className="text-blue-600 font-semibold">
                  hr@elentec.com.vn
                </span>
              </div>
              <div className="flex items-start justify-center">
                <span className="font-semibold text-gray-700 w-32">
                  Địa chỉ:
                </span>
                <span className="text-gray-600 flex-1 text-center">
                  KCN Quang Minh, Mê Linh, Hà Nội
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Recruitment;

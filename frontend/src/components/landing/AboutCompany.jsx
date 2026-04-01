import { Building2, Users, Award, Target, Factory, Globe } from "lucide-react";

const AboutCompany = () => {
  const companyStats = [
    { icon: Users, label: "Nhân viên", value: "1000+" },
    { icon: Factory, label: "Dây chuyền sản xuất", value: "5+" },
    { icon: Award, label: "Năm kinh nghiệm", value: "13+" },
    { icon: Globe, label: "Đối tác quốc tế", value: "10+" },
  ];

  const companyValues = [
    {
      icon: Target,
      title: "Sứ mệnh",
      description:
        "Cung cấp các sản phẩm điện tử chất lượng cao, đáp ứng nhu cầu của các đối tác toàn cầu với giá cả cạnh tranh nhất.",
    },
    {
      icon: Award,
      title: "Tầm nhìn",
      description:
        "Trở thành nhà cung cấp linh kiện điện tử hàng đầu khu vực Đông Nam Á, đóng góp vào sự phát triển của ngành công nghiệp điện tử Việt Nam.",
    },
    {
      icon: Building2,
      title: "Giá trị cốt lõi",
      description:
        "Chất lượng - Uy tín - Đổi mới - Phát triển bền vững. Chúng tôi cam kết xây dựng môi trường làm việc chuyên nghiệp và thân thiện.",
    },
  ];

  return (
    <section id="about" className="py-20 bg-linear-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tiêu đề phần */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Về <span className="text-blue-500">ELENTEC VIỆT NAM</span>
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Đối tác tin cậy trong lĩnh vực sản xuất linh kiện điện tử
          </p>
        </div>

        {/* Giới thiệu công ty */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Giới thiệu công ty
            </h3>
            <p className="text-gray-600 leading-relaxed">
              <strong>Công ty TNHH ELENTEC VIỆT NAM</strong> là doanh nghiệp
              100% vốn đầu tư từ Hàn Quốc, được thành lập và đi vào hoạt động
              chính thức từ tháng 12 năm 2010 tại Khu Công Nghiệp Quang Minh, Mê
              Linh, Hà Nội.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi chuyên sản xuất các linh kiện, phụ kiện điện tử như vỏ
              máy, pin, sạc và các chi tiết nhựa kỹ thuật cao cho các hãng điện
              tử nổi tiếng thế giới như <strong>HP</strong>,{" "}
              <strong>SONY</strong>, và đặc biệt là đối tác chiến lược của{" "}
              <strong>Samsung Electronics Việt Nam</strong>.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Với đội ngũ hơn 1000 nhân viên chuyên nghiệp và các dây chuyền sản
              xuất hiện đại, chúng tôi cam kết mang đến những sản phẩm chất
              lượng cao nhất cho khách hàng.
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h4 className="text-2xl font-bold text-gray-800 mb-6">
                Thông tin công ty
              </h4>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-32 text-gray-500 font-medium">
                    Tên công ty:
                  </div>
                  <div className="flex-1 text-gray-800 font-semibold">
                    ELENTEC VIỆT NAM
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-32 text-gray-500 font-medium">
                    Năm thành lập:
                  </div>
                  <div className="flex-1 text-gray-800">2010</div>
                </div>
                <div className="flex items-start">
                  <div className="w-32 text-gray-500 font-medium">
                    Quốc tịch:
                  </div>
                  <div className="flex-1 text-gray-800">
                    Hàn Quốc (100% vốn)
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-32 text-gray-500 font-medium">
                    Lĩnh vực:
                  </div>
                  <div className="flex-1 text-gray-800">
                    Sản xuất linh kiện điện tử
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-32 text-gray-500 font-medium">Địa chỉ:</div>
                  <div className="flex-1 text-gray-800">
                    KCN Quang Minh, Mê Linh, Hà Nội
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thống kê công ty */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {companyStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Giá trị công ty */}
        <div className="grid md:grid-cols-3 gap-8">
          {companyValues.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
              >
                <div className="bg-linear-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutCompany;

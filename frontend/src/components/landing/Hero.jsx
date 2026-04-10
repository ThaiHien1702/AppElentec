import { Link } from "react-router-dom";
import Elentec_IMG from "../../assets/maxresdefault.jpg";

const Hero = () => {
  const isAuthenticated = false;
  return (
    <section className="relative bg-[#fbfbfb] overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-size-[60px_60px]"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-2xl ms:text-5xl lg:text-6xl font-extrabold text-blue-400 leading-tigh mb-6">
            NHÀ MÁY ELENTEC - KCN Quang Minh
          </h1>
          <p className="text-lg ms:text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
            Nhà máy ELENTEC VIỆT NAM là doanh nghiệp 100% vốn đầu tư từ Hàn
            Quốc, được thành lập và đi vào hoạt động chính thức từ tháng 12 năm
            20120 chuyên sản xuất các linh, phụ kiện điện tử, vỏ, pin, sạc điện
            thoại cho các hãng nổi tiếng thế giới như HP, SONY, đặc biệt là đối
            tác chính của Công ty Samsung Electronic tronic Việt Nam
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-linear-to-r from-blue-400 to-blue-500 text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-500 transition-all duration-200 hover:scale-105 hover:shadow-2xs transform"
              >
                Đi tới bảng điều khiển
              </Link>
            ) : (
              <Link
                to="/signup"
                className="bg-linear-to-r from-blue-400 to-blue-500 text-white px-8 py-4 rounded-xl text-base sm:text-lg hover:bg-gray-800 transition-all duration-200 hover:scale-105 hover:shadow-2xl transform"
              >
                {" "}
                Bắt đầu miễn phí
              </Link>
            )}
            <a
              href="#features"
              className="border-2 border-black text-black px-8 py-4 rounded-xl text-base sm:text-lg hover:bg-white hover:text-black transition-all duration-200 hover:scale-105"
            >
              {" "}
              Tìm hiểu thêm
            </a>
          </div>
        </div>
        <div className="m-12 sm:mt-16 relative max-w-5xl mx-auto">
          <img
            src={Elentec_IMG}
            alt=" Cong ty TNHH Elentec"
            className="rounded-2xl shadow-2xl shadow-gray-300 border-4 border-gray-200/20"
          ></img>
        </div>
      </div>
    </section>
  );
};

export default Hero;

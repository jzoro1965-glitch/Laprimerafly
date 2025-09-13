import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import banner1 from '../../assets/img/banner/banner-1.jpg';
import banner2 from '../../assets/img/banner/banner-2.jpg';
import banner3 from '../../assets/img/banner/banner-3.JPG';
import banner4 from '../../assets/img/banner/banner-4.JPG';
import banner5 from '../../assets/img/banner/banner-5.JPG';

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate(); // Inisialisasi useNavigate

  const slides = [
    {
      id: 1,
      title: "",
      subtitle: "",
      description: "",
      buttonText: "Shop Now",
      image: banner1,
      bgColor: "",
      linkTo: "/shop"
    },
    {
      id: 2,
      title: "",
      subtitle: "",
      description: "",
      buttonText: "Shop Now",
      image: banner2,
      bgColor: "",
      linkTo: "/shop"
    },
    {
      id: 3,
      title: "",
      subtitle: "",
      description: "",
      buttonText: "Shop Now",
      image: banner3,
      bgColor: "",
      linkTo: "/shop"
    },
    {
      id: 4,
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      image: banner4,
      bgColor: "",
      linkTo: "/shop"
    },
    {
      id: 5,
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      image: banner5,
      bgColor: "",
      linkTo: "/shop"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Handler untuk tombol di slide
  const handleButtonClick = (linkTo) => {
    if (linkTo) {
      navigate(linkTo); // Menggunakan useNavigate untuk navigasi
    }
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-75`}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center text-white">
                  <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl md:text-2xl font-medium mb-6 animate-fade-in-delay-1">
                    {slide.subtitle}
                  </h2>
                  <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto animate-fade-in-delay-2 leading-relaxed">
                    {slide.description}
                  </p>
                  {/* Modifikasi tombol agar bisa dinavigasi */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 z-20 group"
      >
        <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 z-20 group"
      >
        <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 right-8 text-white animate-bounce z-20">
        <div className="flex flex-col items-center">
          <span className="text-sm mb-2">Scroll</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Inline Style for Animations (if not in a global CSS file) */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay-1 {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
        
        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s ease-out 0.6s both;
        }
      `}</style>
    </section>
  );
}

export default Hero;
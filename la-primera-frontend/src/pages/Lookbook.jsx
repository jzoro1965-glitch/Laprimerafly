import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import foto landscape
import photo1 from "../assets/img/lookbook/photo1.JPG";
import photo2 from "../assets/img/lookbook/photo2.JPG";
import photo3 from "../assets/img/lookbook/photo3.JPG";
import photo4 from "../assets/img/lookbook/photo4.JPG";
import photo5 from "../assets/img/lookbook/photo5.JPG";
import photo6 from "../assets/img/lookbook/photo6.JPG";
import photo7 from "../assets/img/lookbook/photo7.JPG";
import photo15 from "../assets/img/lookbook/miring1.jpeg";
import photo16 from "../assets/img/lookbook/miring2.jpeg";
import photo17 from "../assets/img/lookbook/miring3.jpeg";

// Import foto portrait (IMG-...)
import photo8 from "../assets/img/lookbook/IMG-20250904-WA0028.JPG";
import photo9 from "../assets/img/lookbook/IMG-20250904-WA0029.JPG";
import photo10 from "../assets/img/lookbook/IMG-20250904-WA0030.JPG";
import photo11 from "../assets/img/lookbook/IMG-20250904-WA0031.JPG";
import photo12 from "../assets/img/lookbook/IMG-20250904-WA0032.JPG";
import photo13 from "../assets/img/lookbook/wa1.jpeg";
import photo14 from "../assets/img/lookbook/wa3.jpeg";

function Lookbook() {
  const [openSection, setOpenSection] = useState(null);

  const sections = [
    {
      title: "Art 1",
      photos: [
        photo1, photo2, photo3, photo4, photo5, photo6, photo7,
        photo8, photo9, photo10, photo11, photo12, photo13, photo14, photo15, photo16, photo17,
      ],
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {sections.map((section, idx) => (
        <div key={idx} className="w-full flex flex-col items-center">
          
          {/* Tombol Section */}
          <div className="w-full bg-black py-8 sm:py-12 flex justify-center">
            <button
              onClick={() =>
                setOpenSection(openSection === idx ? null : idx)
              }
              className="px-8 sm:px-14 py-4 sm:py-8 bg-black text-white text-xl sm:text-3xl font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition"
              style={{ border: "2px solid #0e0404ff" }}
            >
              {section.title}
            </button>
          </div>

          {/* Foto muncul dengan animasi */}
          <AnimatePresence>
            {openSection === idx && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="columns-1 sm:columns-2 md:columns-3 gap-6 mt-8 w-full max-w-6xl px-4"
              >
                {section.photos.map((src, index) => (
                  <motion.div
                    key={index}
                    variants={item}
                    className="mb-6 break-inside-avoid rounded-xl overflow-hidden shadow-lg"
                  >
                    <img
                      src={src}
                      alt={`${section.title} ${index + 1}`}
                      className="w-full object-contain"
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default Lookbook;

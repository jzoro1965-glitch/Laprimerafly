import React from "react";
import NewsletterImage from "../../assets/img/banner/IMG_3474.PNG"; // pastikan path benar

const Newsletter = () => {
  return (
    <div className="relative w-full">
      {/* Gambar Banner */}
      <picture>
        <source srcSet={NewsletterImage} media="(max-width: 640px)" />
        <source srcSet={NewsletterImage} media="(max-width: 1024px)" />
        <source srcSet={NewsletterImage} media="(min-width: 1250px)" />

        <img
          src={NewsletterImage}
          alt="La Primera Banner"
          className="w-full h-[200px] sm:h-[300px] md:h-[500px] lg:h-[600px] object-cover"
        />
      </picture>

      {/* Tombol di kanan atas */}
   <div className="absolute bottom-8 right-1/4">
  <a
    href="/shop"
    className="bg-[#b60000] hover:bg-red-800 text-white font-semibold py-2 px-8 rounded-md text-lg transition duration-300 shadow-md"
  >
    Shop
  </a>
</div>



    </div>
  );
};

export default Newsletter;

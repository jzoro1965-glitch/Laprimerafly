// src/pages/About.jsx
import Footer from "../components/common/Footer";

function About() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Section About */}
      <section className="flex-1 py-16 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
            About LaPrimeraFly
          </h1>

          <div className="text-lg sm:text-xl text-gray-700 leading-relaxed space-y-6">
            <p>
              La Primera was founded on{" "}
              <span className="font-semibold">March 16, 2025</span>. The name{" "}
              <span className="font-semibold">La Primera</span> is derived from
              the Spanish language, meaning{" "}
              <span className="italic">“to be the first.”</span>
            </p>

            <p>
              The brand name was inspired by the shared backgrounds of its
              founders, who faced similar circumstances. That's why we decided
              to create the brand—it just came to us, you know?{" "}
              <span className="italic">Hehe..</span>
            </p>

            <p>
              Moving on to our first article, we were inspired by lofty goals,
              visualizing constellations as symbols of unlimited hope and high
              aspirations. Many challenges were overcome to reach the release of
              this first article.
            </p>

            <p>
              We hope that in the future, there will be more articles with
              innovative ideas that align with our principles—to achieve the
              hopes we envision, in line with our brand name.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default About;

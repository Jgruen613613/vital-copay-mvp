"use client";

export function HeroSection() {
  function scrollToSavings() {
    document.querySelector("#check-savings")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="hero" className="relative bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] text-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          Free Medication Savings Finder
        </span>

        <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
          Stop Overpaying for Your Specialty Medication.
        </h1>

        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Most patients on specialty medications like Humira, Enbrel, Stelara, and Rinvoq
          don&apos;t know about programs that could save them $2,000&ndash;$10,000 per year.
          We find them for you &mdash; for free.
        </p>

        <button
          onClick={scrollToSavings}
          className="bg-white text-[#1a365d] font-semibold text-lg px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
        >
          Check Your Savings Now &rarr;
        </button>

        <p className="text-blue-200 text-sm mt-4">
          Free &middot; No account required &middot; Takes 30 seconds
        </p>
      </div>

      {/* Stats bar */}
      <div className="max-w-4xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0">
        {[
          { stat: "97%", desc: "of specialty patients miss available savings programs" },
          { stat: "$2,000\u2013$10,000", desc: "typical annual savings range" },
          { stat: "5 minutes", desc: "average time to check your savings" },
          { stat: "$0", desc: "cost to you \u2014 our service is free" },
        ].map((item, i) => (
          <div key={i} className="text-center px-4 py-3 md:border-r md:last:border-r-0 border-white/20">
            <p className="text-2xl md:text-3xl font-bold">{item.stat}</p>
            <p className="text-xs md:text-sm text-blue-200 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

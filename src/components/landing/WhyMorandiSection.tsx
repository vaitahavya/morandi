'use client';

export default function WhyMorandiSection() {
  const reasons = [
    {
      icon: (
        <svg className="w-12 h-12 text-soft-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Integrated Supply Chain",
      description: "From sourcing to delivery, we ensure a seamless process rooted in care — using 100% natural fibres."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-clay-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Quality Assurance",
      description: "Every product goes through rigorous checks to meet the highest standards."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-soft-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      ),
      title: "Expert Backed Design",
      description: "Skilled experts craft each product blending comfort and style."
    }
  ];

  return (
    <section className="py-20 bg-earthy-beige relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-clay-pink"></div>
        <div className="absolute top-32 right-20 w-24 h-24 rounded-full bg-soft-sage"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 rounded-full bg-clay-pink"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 rounded-full bg-soft-sage"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-deep-charcoal">
            Why Morandi Lifestyle?
          </h2>
          <div className="w-24 h-1 bg-clay-pink mx-auto rounded-full"></div>
        </div>
        
        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {reasons.map((reason, index) => (
            <div 
              key={index}
              className="text-center group"
            >
              {/* Icon Container */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-morandi-white shadow-soft flex items-center justify-center group-hover:shadow-card transition-all duration-300 group-hover:transform group-hover:scale-110">
                {reason.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl md:text-2xl font-serif font-semibold mb-4 text-deep-charcoal">
                {reason.title}
              </h3>
              
              <p className="text-deep-charcoal/70 font-sans leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 bg-morandi-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-soft">
            <div className="w-3 h-3 rounded-full bg-soft-sage"></div>
            <span className="text-deep-charcoal font-medium">Experience the difference</span>
            <div className="w-3 h-3 rounded-full bg-clay-pink"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

export default function GreaterPurposeSection() {
  const purposes = [
    {
      icon: (
        <svg className="w-12 h-12 text-clay-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Innovation in Every Detail",
      description: "In every stitch, fresh visions rise. Threads of maternity wear weave tales beneath the skies."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-soft-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: "Sustainability at Heart",
      description: "With every thread, we honor the Earth — embracing zero-waste practices to leave nothing behind but beauty for generations ahead."
    },
    {
      icon: (
        <svg className="w-12 h-12 text-clay-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: "Lifestyle Integration",
      description: "Our products fit seamlessly into your life — whether you're dressing for motherhood, lounging in co-ord sets, or embracing everyday elegance."
    }
  ];

  return (
    <section className="py-20 bg-morandi-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-deep-charcoal">
            Our Greater Purpose
          </h2>
          <div className="w-24 h-1 bg-clay-pink mx-auto rounded-full"></div>
        </div>
        
        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {purposes.map((purpose, index) => (
            <div 
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              {/* Icon Container */}
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-earthy-beige to-soft-sage/30 flex items-center justify-center group-hover:shadow-card transition-all duration-300">
                {purpose.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl md:text-2xl font-serif font-semibold mb-4 text-deep-charcoal">
                {purpose.title}
              </h3>
              
              <p className="text-deep-charcoal/70 font-sans leading-relaxed">
                {purpose.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Decorative Bottom Border */}
        <div className="mt-16 flex justify-center">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-clay-pink/30"></div>
            <div className="w-3 h-3 rounded-full bg-soft-sage/50"></div>
            <div className="w-3 h-3 rounded-full bg-clay-pink/30"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

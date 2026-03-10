'use client';

import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        {/* Background Image */}
        <Image
          src="/images/banners/pexels-lucasmendesph-3094441.jpg"
          alt="About Morandi Lifestyle - Crafting Beautiful Spaces"
          fill
          priority
          className="object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-deep-charcoal/70 via-deep-charcoal/50 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl">
              {/* Main Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 text-morandi-white leading-tight">
                About Morandi Lifestyle
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl lg:text-2xl mb-8 text-morandi-white/90 font-sans leading-relaxed max-w-2xl">
                Crafting beautiful spaces with curated lifestyle products that celebrate life's most precious moments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gradient-to-br from-earthy-beige to-soft-sage/30">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Section Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-8 text-deep-charcoal">
              Our Story
            </h2>
            
            {/* Story Content */}
            <div className="space-y-6 text-lg md:text-xl text-deep-charcoal/80 font-sans leading-relaxed">
              <p className="font-medium">
                Morandi Lifestyle was born from a passion for creating beautiful, functional spaces that enhance everyday living.
              </p>
              
              <p>
                We believe that every home deserves thoughtfully curated products that combine style, comfort, and quality. 
                From the tender moments of new motherhood to the comfort of a well-made bed, we craft experiences that 
                transform ordinary spaces into sanctuaries of beauty and peace.
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="mt-12 flex justify-center items-center space-x-8">
              {/* Home Icon */}
              <div className="w-16 h-16 rounded-full bg-clay-pink/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-clay-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              
              {/* Heart Icon */}
              <div className="w-16 h-16 rounded-full bg-soft-sage/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-soft-sage" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
                </svg>
              </div>
              
              {/* Star Icon */}
              <div className="w-16 h-16 rounded-full bg-clay-pink/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-clay-pink" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-20 bg-morandi-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-deep-charcoal">
              Our Mission
            </h2>
            <div className="w-24 h-1 bg-clay-pink mx-auto rounded-full"></div>
          </div>
          
          {/* Mission Content */}
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg md:text-xl text-deep-charcoal/80 font-sans leading-relaxed mb-8">
              We're dedicated to providing premium maternity and baby care products, healthcare textiles, home bedding, 
              and hospitality solutions. Our commitment to quality craftsmanship and attention to detail ensures that 
              every product meets the highest standards of excellence.
            </p>
            
            <p className="text-lg text-deep-charcoal/70 font-sans leading-relaxed">
              Every thread tells a story, every fabric holds a promise — to comfort, to care, to celebrate the beautiful 
              journey of life in all its forms.
            </p>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-20 bg-gradient-to-br from-soft-sage/20 to-earthy-beige/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-deep-charcoal">
              What We Offer
            </h2>
            <div className="w-24 h-1 bg-soft-sage mx-auto rounded-full"></div>
          </div>
          
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Maternity & Baby Care */}
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-morandi-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-all duration-300">
                <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-clay-pink/20 to-clay-pink/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-clay-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-semibold mb-4 text-deep-charcoal">
                  Maternity & Baby Care
                </h3>
                <p className="text-deep-charcoal/70 font-sans leading-relaxed">
                  From feeding aprons to designer baby quilts, we provide everything needed for comfortable parenting. 
                  Each piece is crafted with love and care for the most precious moments of life.
                </p>
              </div>
            </div>

            {/* Healthcare Textiles */}
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-morandi-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-all duration-300">
                <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-soft-sage/30 to-soft-sage/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-soft-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-semibold mb-4 text-deep-charcoal">
                  Healthcare Textiles
                </h3>
                <p className="text-deep-charcoal/70 font-sans leading-relaxed">
                  Premium hospital bedding and patient care products designed for comfort and hygiene. 
                  Where healing meets comfort in every thread.
                </p>
              </div>
            </div>

            {/* Home & Bedding */}
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-morandi-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-all duration-300">
                <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-clay-pink/20 to-clay-pink/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-clay-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-semibold mb-4 text-deep-charcoal">
                  Home & Bedding
                </h3>
                <p className="text-deep-charcoal/70 font-sans leading-relaxed">
                  Luxurious bedding, dohars, and home textiles that transform your living spaces. 
                  Create sanctuaries of comfort and style.
                </p>
              </div>
            </div>

            {/* Hospitality Solutions */}
            <div className="group hover:transform hover:scale-105 transition-all duration-300">
              <div className="bg-morandi-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-all duration-300">
                <div className="w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-soft-sage/30 to-soft-sage/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-soft-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-semibold mb-4 text-deep-charcoal">
                  Hospitality Solutions
                </h3>
                <p className="text-deep-charcoal/70 font-sans leading-relaxed">
                  Professional-grade hotel bedding and hospitality products for exceptional guest experiences. 
                  Where every stay becomes a memory.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-20 bg-morandi-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-deep-charcoal">
              Our Values
            </h2>
            <div className="w-24 h-1 bg-clay-pink mx-auto rounded-full"></div>
          </div>
          
          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Quality */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-earthy-beige to-soft-sage/30 flex items-center justify-center group-hover:shadow-card transition-all duration-300">
                <svg className="w-12 h-12 text-clay-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-semibold mb-4 text-deep-charcoal">
                Quality
              </h3>
              <p className="text-deep-charcoal/70 font-sans leading-relaxed">
                Premium materials and craftsmanship in every product. We believe in creating pieces that last, 
                bringing beauty and comfort for years to come.
              </p>
            </div>

            {/* Care */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-earthy-beige to-soft-sage/30 flex items-center justify-center group-hover:shadow-card transition-all duration-300">
                <svg className="w-12 h-12 text-soft-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-semibold mb-4 text-deep-charcoal">
                Care
              </h3>
              <p className="text-deep-charcoal/70 font-sans leading-relaxed">
                Thoughtful design for comfort and well-being. Every product is created with love, 
                understanding the needs of those who will use it.
              </p>
            </div>

            {/* Innovation */}
            <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-earthy-beige to-soft-sage/30 flex items-center justify-center group-hover:shadow-card transition-all duration-300">
                <svg className="w-12 h-12 text-clay-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl md:text-2xl font-serif font-semibold mb-4 text-deep-charcoal">
                Innovation
              </h3>
              <p className="text-deep-charcoal/70 font-sans leading-relaxed">
                Modern solutions for contemporary living. We blend traditional craftsmanship with 
                innovative design to create products that enhance your lifestyle.
              </p>
            </div>
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

      {/* Our Team Section */}
      <section className="py-20 bg-gradient-to-br from-soft-sage/20 to-earthy-beige/50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-deep-charcoal">
              Our Team
            </h2>
            <div className="w-24 h-1 bg-soft-sage mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Mounica Gopi */}
            <div className="group">
              <div className="bg-morandi-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 mb-5 rounded-full bg-gradient-to-br from-clay-pink/20 to-clay-pink/10 flex items-center justify-center shrink-0">
                  <span className="text-xl font-serif font-semibold text-clay-pink">MG</span>
                </div>
                <p className="text-sm font-medium text-clay-pink uppercase tracking-wide mb-1">Director, People Management</p>
                <h3 className="text-xl font-serif font-semibold text-deep-charcoal mb-3">Mounica Gopi</h3>
                <p className="text-deep-charcoal/70 font-sans text-sm leading-relaxed flex-grow">
                  MBA graduate and corporate HR professional—loving mother, homemaker, and daring entrepreneur. A risk-taker who thrives on bold experiments while remaining approachable and open-hearted. She fuses ambition with soulful growth, adapting seamlessly, inspiring others, and forging deep connections.
                </p>
              </div>
            </div>

            {/* Ravi Pyaraka */}
            <div className="group">
              <div className="bg-morandi-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 mb-5 rounded-full bg-gradient-to-br from-soft-sage/30 to-soft-sage/20 flex items-center justify-center shrink-0">
                  <span className="text-xl font-serif font-semibold text-soft-sage">RP</span>
                </div>
                <p className="text-sm font-medium text-soft-sage uppercase tracking-wide mb-1">Director, Strategy and Implementation</p>
                <h3 className="text-xl font-serif font-semibold text-deep-charcoal mb-3">Ravi Pyaraka</h3>
                <p className="text-deep-charcoal/70 font-sans text-sm leading-relaxed flex-grow">
                  Close to 35 years of experience as a working professional and bootstrapped entrepreneur. Strong business acumen with a clear focus on innovation, technology integration, and creating value for the industry. Brings capability in lowering business risks, financial discipline, growth progression, focused stability, high ownership, and business scaling.
                </p>
              </div>
            </div>

            {/* G Anjaneyulu Goud */}
            <div className="group">
              <div className="bg-morandi-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 mb-5 rounded-full bg-gradient-to-br from-earthy-beige to-soft-sage/30 flex items-center justify-center shrink-0">
                  <span className="text-xl font-serif font-semibold text-deep-charcoal/80">AG</span>
                </div>
                <p className="text-sm font-medium text-deep-charcoal/70 uppercase tracking-wide mb-1">Director, Communication and PR</p>
                <h3 className="text-xl font-serif font-semibold text-deep-charcoal mb-3">G Anjaneyulu Goud</h3>
                <p className="text-deep-charcoal/70 font-sans text-sm leading-relaxed flex-grow">
                  A veteran with 35+ years of experience in public life as a social worker. Currently holding a position of Co-Director at Yoga University of Bharat, Bangalore.
                </p>
              </div>
            </div>

            {/* Mr. Pundalik */}
            <div className="group">
              <div className="bg-morandi-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 mb-5 rounded-full bg-gradient-to-br from-clay-pink/20 to-clay-pink/10 flex items-center justify-center shrink-0">
                  <span className="text-xl font-serif font-semibold text-clay-pink">P</span>
                </div>
                <p className="text-sm font-medium text-clay-pink uppercase tracking-wide mb-1">Director, International Marketing</p>
                <h3 className="text-xl font-serif font-semibold text-deep-charcoal mb-3">Mr. Pundalik</h3>
                <p className="text-deep-charcoal/70 font-sans text-sm leading-relaxed flex-grow">
                  Nominee for the Padma award 2026, with over 35 years of experience in marketing, strategic leadership, and negotiation. Deep industry insight and a proven track record in building and scaling brands add significant value to the organization.
                </p>
              </div>
            </div>

            {/* MVN Acharya */}
            <div className="group">
              <div className="bg-morandi-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 mb-5 rounded-full bg-gradient-to-br from-soft-sage/30 to-soft-sage/20 flex items-center justify-center shrink-0">
                  <span className="text-xl font-serif font-semibold text-soft-sage">MA</span>
                </div>
                <p className="text-sm font-medium text-soft-sage uppercase tracking-wide mb-1">Director, Business Development</p>
                <h3 className="text-xl font-serif font-semibold text-deep-charcoal mb-3">MVN Acharya</h3>
                <p className="text-deep-charcoal/70 font-sans text-sm leading-relaxed flex-grow">
                  Entrepreneur with 25 years of experience in the pharma industry and strong acumen in business development.
                </p>
              </div>
            </div>

            {/* Vaitahavya Vadlamani */}
            <div className="group">
              <div className="bg-morandi-white rounded-2xl p-8 shadow-card hover:shadow-soft transition-all duration-300 h-full flex flex-col">
                <div className="w-14 h-14 mb-5 rounded-full bg-gradient-to-br from-earthy-beige to-clay-pink/20 flex items-center justify-center shrink-0">
                  <span className="text-xl font-serif font-semibold text-deep-charcoal/80">VV</span>
                </div>
                <p className="text-sm font-medium text-deep-charcoal/70 uppercase tracking-wide mb-1">Chief Technology Officer</p>
                <h3 className="text-xl font-serif font-semibold text-deep-charcoal mb-3">Vaitahavya Vadlamani</h3>
                <p className="text-deep-charcoal/70 font-sans text-sm leading-relaxed flex-grow">
                  Technology strategist and entrepreneur focused on building digital infrastructure that enables modern brands to scale through technology, automation, and intelligent media systems. Founder of Sree Drisya Media. Specializes in scalable digital ecosystems—website architectures, content management systems, marketing automation pipelines, and AI-assisted creative workflows—integrating technology with business strategy for sustainable growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 
'use client';

export default function StorytellingSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-earthy-beige to-soft-sage/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-8 text-deep-charcoal">
            Whispers of Wonder
          </h2>
          
          {/* Story Content */}
          <div className="space-y-6 text-lg md:text-xl text-deep-charcoal/80 font-sans leading-relaxed">
            <p className="font-medium">
              Bundles of joy on the way, and hearts full of dreams? Shop our Maternity Wear.
            </p>
            
            <p>
              Wrapped in comfort and elegance, our maternity wear celebrates this sacred season of life. 
              Let's nurture each other as we nurture the tiny miracles within — growing stronger together 
              as this beautiful journey begins.
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="mt-12 flex justify-center items-center space-x-8">
            {/* Blooming Flower Icon */}
            <div className="w-16 h-16 rounded-full bg-clay-pink/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-clay-pink" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z" />
              </svg>
            </div>
            
            {/* Mother Silhouette Icon */}
            <div className="w-16 h-16 rounded-full bg-soft-sage/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-soft-sage" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z" />
              </svg>
            </div>
            
            {/* Heart Icon */}
            <div className="w-16 h-16 rounded-full bg-clay-pink/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-clay-pink" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

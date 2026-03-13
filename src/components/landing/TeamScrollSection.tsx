'use client';

import Image from 'next/image';
import Link from 'next/link';

interface TeamMember {
  name: string;
  designation: string;
  image?: string;
  initials?: string;
  accentColor: 'clay-pink' | 'soft-sage' | 'earthy-beige';
}

const teamMembers: TeamMember[] = [
  {
    name: 'Mounica Gopi',
    designation: 'Director, People Management',
    image: '/images/team/mounica-gopi.png',
    accentColor: 'clay-pink',
  },
  {
    name: 'Ravi Pyaraka',
    designation: 'Director, Strategy and Implementation',
    initials: 'RP',
    accentColor: 'soft-sage',
  },
  {
    name: 'G Anjaneyulu Goud',
    designation: 'Director, Communication and PR',
    image: '/images/team/g-anjaneyulu-goud.png',
    accentColor: 'earthy-beige',
  },
  {
    name: 'Makarand Pundalik',
    designation: 'Director, International Marketing',
    image: '/images/team/makarand-pundalik.png',
    accentColor: 'clay-pink',
  },
  {
    name: 'MVN Acharya',
    designation: 'Director, Business Development',
    initials: 'MA',
    accentColor: 'soft-sage',
  },
  {
    name: 'Vaitahavya Vadlamani',
    designation: 'Chief Technology Officer',
    initials: 'VV',
    accentColor: 'earthy-beige',
  },
  {
    name: 'K. Venkat Durga Prasad',
    designation: 'Director, Finance and Strategy',
    image: '/images/team/k-venkat-durga-prasad.png',
    accentColor: 'soft-sage',
  },
];

const accentStyles = {
  'clay-pink': {
    ring: 'ring-clay-pink/30',
    bg: 'bg-gradient-to-br from-clay-pink/20 to-clay-pink/10',
    text: 'text-clay-pink',
  },
  'soft-sage': {
    ring: 'ring-soft-sage/30',
    bg: 'bg-gradient-to-br from-soft-sage/30 to-soft-sage/20',
    text: 'text-soft-sage',
  },
  'earthy-beige': {
    ring: 'ring-earthy-beige/50',
    bg: 'bg-gradient-to-br from-earthy-beige to-soft-sage/30',
    text: 'text-deep-charcoal/80',
  },
};

export default function TeamScrollSection() {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-soft-sage/10 to-earthy-beige/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 text-deep-charcoal">
            Meet Our Team
          </h2>
          <div className="w-24 h-1 bg-clay-pink mx-auto rounded-full mb-4"></div>
          <p className="text-deep-charcoal/70 font-sans text-lg max-w-2xl mx-auto">
            The passionate people behind Morandi Lifestyle
          </p>
        </div>
      </div>

      {/* Scrolling Container */}
      <div className="relative">
        {/* Gradient fade on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-soft-sage/10 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-earthy-beige/30 to-transparent z-10 pointer-events-none"></div>

        {/* Scrollable track */}
        <div className="overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-6 px-4 md:px-8 lg:px-16 w-max">
            {teamMembers.map((member, index) => {
              const styles = accentStyles[member.accentColor];
              return (
                <div
                  key={index}
                  className="group flex-shrink-0 w-64 md:w-72"
                >
                  <div className="bg-morandi-white rounded-2xl p-6 shadow-card hover:shadow-soft transition-all duration-300 h-full flex flex-col items-center text-center">
                    {/* Avatar */}
                    {member.image ? (
                      <div className={`w-24 h-24 mb-4 rounded-full overflow-hidden shrink-0 ring-2 ${styles.ring}`}>
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className={`w-24 h-24 mb-4 rounded-full ${styles.bg} flex items-center justify-center shrink-0`}>
                        <span className={`text-2xl font-serif font-semibold ${styles.text}`}>
                          {member.initials}
                        </span>
                      </div>
                    )}

                    {/* Name */}
                    <h3 className="text-lg font-serif font-semibold text-deep-charcoal mb-1">
                      {member.name}
                    </h3>

                    {/* Designation */}
                    <p className={`text-xs font-medium uppercase tracking-wide ${styles.text}`}>
                      {member.designation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* View All Link */}
      <div className="text-center mt-10">
        <Link
          href="/about#team"
          className="inline-flex items-center gap-2 px-6 py-3 bg-deep-charcoal text-morandi-white rounded-full font-medium hover:bg-deep-charcoal/90 transition-colors duration-300"
        >
          View Full Team
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

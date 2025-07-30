export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="mb-4 text-4xl font-bold">About Morandi Lifestyle</h1>
        <p className="text-lg text-gray-600">
          Crafting beautiful spaces with curated lifestyle products
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Our Story</h2>
          <p className="text-gray-700 leading-relaxed">
            Morandi Lifestyle was born from a passion for creating beautiful, functional spaces that enhance everyday living. 
            We believe that every home deserves thoughtfully curated products that combine style, comfort, and quality.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            We're dedicated to providing premium maternity and baby care products, healthcare textiles, home bedding, 
            and hospitality solutions. Our commitment to quality craftsmanship and attention to detail ensures that 
            every product meets the highest standards of excellence.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">What We Offer</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="mb-2 text-lg font-semibold">Maternity & Baby Care</h3>
              <p className="text-gray-600">
                From feeding aprons to designer baby quilts, we provide everything needed for comfortable parenting.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="mb-2 text-lg font-semibold">Healthcare Textiles</h3>
              <p className="text-gray-600">
                Premium hospital bedding and patient care products designed for comfort and hygiene.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="mb-2 text-lg font-semibold">Home & Bedding</h3>
              <p className="text-gray-600">
                Luxurious bedding, dohars, and home textiles that transform your living spaces.
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="mb-2 text-lg font-semibold">Hospitality Solutions</h3>
              <p className="text-gray-600">
                Professional-grade hotel bedding and hospitality products for exceptional guest experiences.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Our Values</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Quality</h3>
              <p className="text-sm text-gray-600">Premium materials and craftsmanship in every product</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Care</h3>
              <p className="text-sm text-gray-600">Thoughtful design for comfort and well-being</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
                <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Innovation</h3>
              <p className="text-sm text-gray-600">Modern solutions for contemporary living</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 
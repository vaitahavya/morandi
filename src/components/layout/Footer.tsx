export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:gap-12">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Morandi Lifestyle</h3>
            <p className="mt-2 text-sm">
              Crafted with love. Inspiring spaces with curated décor and lifestyle products.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Links</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="/about" className="hover:text-white">About</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
              <li><a href="/blog" className="hover:text-white">Blog</a></li>
              <li><a href="/policies" className="hover:text-white">Policies</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Morandi Lifestyle. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

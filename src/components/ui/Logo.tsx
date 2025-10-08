import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      {/* Logo image placeholder */}
      <div className="relative w-32 h-8 md:w-40 md:h-10">
        <Image
          src="/morandi lifestyle.png"
          alt="MORANDI Lifestyle"
          width={160}
          height={40}
          className="object-contain"
          onError={(e) => {
            // Fallback to text if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        {/* Fallback text logo */}
        <div className="hidden items-center space-x-2">
          <div className="flex">
            <span className="bg-blue-400 text-white px-1 py-1 text-lg font-bold">M</span>
            <span className="bg-teal-300 text-white px-1 py-1 text-lg font-bold">O</span>
            <span className="bg-sky-300 text-white px-1 py-1 text-lg font-bold">R</span>
            <span className="bg-blue-500 text-white px-1 py-1 text-lg font-bold">A</span>
            <span className="bg-rose-300 text-white px-1 py-1 text-lg font-bold">N</span>
            <span className="bg-gray-500 text-white px-1 py-1 text-lg font-bold">D</span>
            <span className="bg-teal-500 text-white px-1 py-1 text-lg font-bold">I</span>
          </div>
          <span className="text-gray-400 text-sm font-light italic">Lifestyle</span>
        </div>
      </div>
    </Link>
  );
} 
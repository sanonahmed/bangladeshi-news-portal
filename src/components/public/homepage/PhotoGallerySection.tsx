import Link from "next/link";
import Image from "next/image";
import { Camera } from "lucide-react";

interface GalleryPhoto {
  id: string;
  title: string;
  image: string;
  photographer: string;
  slug: string;
}

const DEMO_PHOTOS: GalleryPhoto[] = [
  {
    id: "photo-1",
    title: "কুয়াশাচ্ছন্ন ভোরে পদ্মা নদীর বুকে জেলেদের ব্যস্ত জীবন",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    photographer: "আহমেদ হাসান / বাংলা নিউজ",
    slug: "padma-river-morning-fishermen",
  },
  {
    id: "photo-2",
    title: "শরতের নীল আকাশে কাশফুলের দোলা",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    photographer: "সৌরভ দাশ / বাংলা নিউজ",
    slug: "autumn-kashful-blooming-nature",
  },
  {
    id: "photo-3",
    title: "ঐতিহাসিক লালবাগ কেল্লায় দর্শনার্থীদের পদচারণা",
    image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
    photographer: "নাসরিন আক্তার / বাংলা নিউজ",
    slug: "lalbagh-fort-historical-heritage",
  },
];

export function PhotoGallerySection() {
  return (
    <section className="mt-8 border-t-2 border-[var(--color-primary)] pt-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="bengali-headline text-xl md:text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[var(--color-primary)] inline-block"></span>
          ছবিঘর
        </h2>
        <Link
          href="/photos"
          className="text-xs md:text-sm font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
        >
          সব ছবি &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEMO_PHOTOS.map((photo) => (
          <Link
            key={photo.id}
            href={`/photos`}
            className="group block border border-[var(--color-border)] p-2.5 bg-[var(--color-bg)] hover:border-[var(--color-primary)] transition-colors"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-bg-secondary)] mb-2">
              <Image
                src={photo.image}
                alt={photo.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute top-2 left-2 bg-black/70 text-white p-1.5 rounded-sm">
                <Camera size={14} />
              </div>
            </div>
            <h3 className="bengali-headline text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
              {photo.title}
            </h3>
            <span className="text-[11px] text-[var(--color-text-faint)] mt-1.5 block">
              ছবি: {photo.photographer}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

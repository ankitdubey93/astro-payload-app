import { useState } from 'react';

export type GalleryImage = { src: string; alt: string };

/** Interactive product gallery (React island). */
export default function WatchGallery({ images }: { images: GalleryImage[] }) {
	const [active, setActive] = useState(0);
	const current = images[active];
	if (!current) return null;

	return (
		<div className="space-y-3">
			<div className="aspect-square overflow-hidden bg-black/5">
				<img src={current.src} alt={current.alt} className="h-full w-full object-cover" />
			</div>
			{images.length > 1 && (
				<div className="flex gap-3">
					{images.map((image, index) => (
						<button
							key={image.src}
							type="button"
							onClick={() => setActive(index)}
							aria-label={`Show image ${index + 1}`}
							aria-current={index === active}
							className={`size-20 overflow-hidden border-2 ${index === active ? 'border-ink' : 'border-transparent opacity-60 hover:opacity-100'}`}
						>
							<img src={image.src} alt="" className="h-full w-full object-cover" />
						</button>
					))}
				</div>
			)}
		</div>
	);
}

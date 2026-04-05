import { brandsData } from "@/data/brands";

export default function BrandsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Marcas Parceiras
          </h2>
          <p className="text-gray-600 text-lg">
            Trabalhamos com as melhores marcas de ciclismo do mundo
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {brandsData.map((brand) => (
            <a
              key={brand.id}
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow group"
              title={brand.description}
            >
              <div className="h-16 flex items-center justify-center mb-4">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-h-16 max-w-full object-contain group-hover:scale-110 transition-transform"
                />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 text-center">
                {brand.name}
              </h3>
              <p className="text-xs text-gray-500 text-center mt-2">
                {brand.description}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

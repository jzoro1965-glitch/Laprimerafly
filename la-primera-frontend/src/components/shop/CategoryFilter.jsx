// src/components/shop/CategoryFilter.jsx

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-12">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
            activeCategory === category.id
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
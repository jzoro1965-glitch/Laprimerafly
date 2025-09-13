import BlogCard from './BlogCard';

function BlogList({ posts, currentPage, totalPages, onPageChange }) {
  return (
    <>
      {/* Blog Posts Grid */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-red-600 hover:text-white shadow-md'
              }`}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => onPageChange(index + 1)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                  currentPage === index + 1
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                    : 'bg-white text-gray-700 hover:bg-red-600 hover:text-white shadow-md'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-red-600 hover:text-white shadow-md'
              }`}
            >
              Next
            </button>
          </div>
        </section>
      )}
    </>
  );
}

export default BlogList;
function BlogCard({ post, isFeatured = false }) {
  if (isFeatured) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="relative">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-64 lg:h-full object-cover"
            />
            <div className="absolute top-6 left-6">
              <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                FEATURED
              </span>
            </div>
          </div>
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-red-600 font-medium capitalize">
                {post.category}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{post.readTime}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h2>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{post.author}</p>
                  <p className="text-sm text-gray-600">{post.date}</p>
                </div>
              </div>
              <button className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition-colors duration-300">
                Baca Selengkapnya
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
      <div className="relative overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
            {post.category}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readTime}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors leading-tight">
          {post.title}
        </h3>
        
        <p className="text-gray-600 mb-4 leading-relaxed">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {post.author.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {post.author}
            </span>
          </div>
          
          <button className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors duration-300">
            Baca →
          </button>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
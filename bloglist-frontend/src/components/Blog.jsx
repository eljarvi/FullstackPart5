import { useState, useEffect } from 'react'
import blogService from '../services/blogs'

const Blog = ({ blog, handleLike, handleDelete }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }


  return (
    <div className="blog" style={{ border: '1px solid black', padding: 5, marginBottom: 5 }}>
      <div>
        {blog.title}{' '}
        <button onClick={toggleVisibility}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>

      {visible && (
        <div className="blogDetails">
          <div>{blog.url}</div>
          <div>
            likes {blog.likes}{' '}
            <button onClick={() => handleLike(blog)}>like</button>
          </div>
          <div>{blog.author}</div>{' '}
          <button onClick={() => handleDelete(blog)}>remove</button>
        </div>
      )}
    </div>
  )
}

export default Blog
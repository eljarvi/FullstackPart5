import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'
import { Notification, ErrorNotification } from './components/Notification'


const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const [error, setError] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs(blogs)
    )
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBloglistUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])



  const handleLike = async (blog) => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id || blog.user
    }

    const returnedBlog = await blogService.update(blog.id, updatedBlog)

    setBlogs(blogs.map(b =>
      b.id !== blog.id ? b : returnedBlog
    ))
  }

  const handleDelete = async (blog) => {
    const ok = window.confirm(`Remove blog ${blog.title} by ${blog.author}?`)
    if (!ok) return

    await blogService.remove(blog.id)
    setBlogs(blogs.filter(b => b.id !== blog.id))
  }

  const notify = (note) => {
    setNotification(note)
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const notifyError = (error) => {
    setError(error)
    setTimeout(() => {
      setError(null)
    }, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({ username, password })

      window.localStorage.setItem(
        'loggedBloglistUser', JSON.stringify(user)
      )

      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      notifyError('wrong username or password')
    }
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('loggedBloglistUser')
    blogService.setToken(null)
  }

  const createBlog = async (blogObject) => {
    try {
      blogFormRef.current.toggleVisibility()
      const returnedBlog = await blogService.create(blogObject) // send to backend

      setBlogs(blogs.concat(returnedBlog))                   // update state
      notify('Blog added')
    } catch (exception) {
      notifyError('Error creating a blog')
    }
  }

  const loginForm = () => (
    <div>
      <form onSubmit={handleLogin}>
        <div>
          <label>
            username
            <input
              type="text"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
          </label>
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )

  const blogForm = () => {
    return (
      <Togglable buttonLabel='add blog' ref={blogFormRef}>
        <BlogForm createBlog={createBlog} />
      </Togglable>
    )

  }

  const blogsListed = () => (
    <div>
      {[...blogs].sort((a, b) => b.likes - a.likes).map(blog =>
        <Blog key={blog.id} blog={blog} handleLike={handleLike} handleDelete={handleDelete} />
      )}
    </div>
  )
  return (
    <div>
      {!user && (
        <div>
          <h2>log in to application</h2>
          <Notification message={notification} />
          <ErrorNotification message={error} />
          {loginForm()}
        </div>
      )
      }
      {user && (
        <div>
          <h2>blogs</h2>
          <Notification message={notification} />
          <ErrorNotification message={error} />
          <p>
            {user.name} logged in{' '}
            <button onClick={handleLogout}>
              logout
            </button>
          </p>
          {blogForm()}
          {blogsListed()}
        </div>
      )
      }
    </div>
  )
}

export default App
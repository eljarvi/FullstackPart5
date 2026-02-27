import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

test('renders title, does not render url or likes by default', () => {
    const blog = {
        title: 'Component testing is done with react-testing-library',
        author: 'me',
        url: 'something.com',
        likes: 0
    }

    render(<Blog blog={blog} />)

    const element = screen.getByText('Component testing is done with react-testing-library')
    expect(element).toBeDefined()

    const element2 = screen.queryByText('something.com')
    expect(element2).toBeNull()

    const element3 = screen.queryByText('0')
    expect(element3).toBeNull()
})

test('blog shows author, url and likes when view button is clicked, hides when hide clicked', async () => {

    const blog = {
        title: 'Test Blog',
        author: 'John Doe',
        url: 'http://example.com',
        likes: 5,
        user: {
            username: 'testuser',
            name: 'Test User',
            id: '123'
        }
    }

    const handleLike = vi.fn()
    const handleDelete = vi.fn()

    render(<Blog blog={blog} handleLike={handleLike} handleDelete={handleDelete} />)

    expect(screen.queryByText('John Doe')).toBeNull()
    expect(screen.queryByText('http://example.com')).toBeNull()
    expect(screen.queryByText('likes 5')).toBeNull()

    const user = userEvent.setup()

    await user.click(screen.getByText('view'))

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('http://example.com')).toBeInTheDocument()
    expect(screen.getByText('likes 5')).toBeInTheDocument()

    await user.click(screen.getByText('hide'))

    expect(screen.queryByText('John Doe')).toBeNull()
    expect(screen.queryByText('http://example.com')).toBeNull()
    expect(screen.queryByText('likes 5')).toBeNull()
})


test('calls event handler twice when like button is clicked twice', async () => {
    const blog = {
        title: 'Test Blog',
        author: 'John Doe',
        url: 'http://example.com',
        likes: 5,
        user: {
            username: 'testuser',
            name: 'Test User',
            id: '123'
        }
    }

    const handleLike = vi.fn()
    const handleDelete = vi.fn()

    render(
        <Blog
            blog={blog}
            handleLike={handleLike}
            handleDelete={handleDelete}
        />
    )

    const user = userEvent.setup()

    await user.click(screen.getByText('view'))

    const likeButton = screen.getByText('like')

    await user.click(likeButton)
    await user.click(likeButton)

    expect(handleLike.mock.calls).toHaveLength(2)
})

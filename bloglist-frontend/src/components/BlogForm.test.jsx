import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogForm from './BlogForm'

test('calls createBlog with correct data when form is submitted', async () => {
    const createBlog = vi.fn()

    render(<BlogForm createBlog={createBlog} />)

    const user = userEvent.setup()

    const titleInput = screen.getByLabelText('title')
    const authorInput = screen.getByLabelText('author')
    const urlInput = screen.getByLabelText('url')
    const createButton = screen.getByText('create')

    await user.type(titleInput, 'Testing React forms')
    await user.type(authorInput, 'Test Author')
    await user.type(urlInput, 'http://example.com')

    await user.click(createButton)

    expect(createBlog.mock.calls).toHaveLength(1)

    expect(createBlog).toHaveBeenCalledWith({
        title: 'Testing React forms',
        author: 'Test Author',
        url: 'http://example.com'
    })
})

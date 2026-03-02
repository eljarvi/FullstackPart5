const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')



blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({}).populate('user', { username: 1, name: 1, id: 1 })
    response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
    const body = request.body

    const user = request.user

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)

})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    const blogId = request.params.id
    const blog = await Blog.findById(blogId)

    if (!blog) {
        return response.status(404).json({ error: 'blog not found' })
    }

    const ownerId = blog.user.toString()

    const user = request.user

    if (!(ownerId === user._id.toString())) {
        return response.status(401).json({ error: 'not authorized to delete this blog' })
    }

    await Blog.findByIdAndDelete(blogId)
    user.blogs = user.blogs.filter(id => id.toString() !== blogId)
    await user.save()
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const newBlog = {
        author: request.body.author,
        title: request.body.title,
        url: request.body.url,
        likes: request.body.likes,
        user: request.body.user
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        newBlog,
        { new: true, runValidators: true, context: 'query' }
    )
    response.json(updatedBlog)
})



module.exports = blogsRouter

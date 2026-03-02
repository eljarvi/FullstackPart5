const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = helper.initialBlogs
        .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

describe('when there are intitially some blogs saved', () => {

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')

        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('a blog includes id string and no _id', async () => {
        const response = await api.get('/api/blogs')

        response.body.forEach(blog => {
            assert.ok(blog.id)
            assert.strictEqual(typeof blog.id, 'string')
            assert.strictEqual(blog._id, undefined)
        })
    })

    describe('adding a blog', () => {

        test('a valid blog can be added', async () => {
            const newBlog = {
                title: "Ellenin blogi",
                author: "Ellen Kalma",
                url: "http://wwww.ellenkalma.fi",
                likes: 500,
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()
            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

            const authors = blogsAtEnd.map(b => b.author)
            assert(authors.includes('Ellen Kalma'))
        })

        test('a blog without likes gets 0 likes', async () => {
            const newBlog = {
                title: "Ellenin blogi",
                author: "Ellen Kalma",
                url: "http://wwww.ellenkalma.fi",
            }

            const added = await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            assert.strictEqual(added.body.likes, 0)

            const response = await api.get('/api/blogs')

            assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
        })

        test('a blog without an url is not added', async () => {
            const newBlog = {
                title: "Ellenin blogi",
                author: "Ellen Kalma",
                likes: 5,
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)

            const response = await api.get('/api/blogs')

            assert.strictEqual(response.body.length, helper.initialBlogs.length)
        })

        test('a blog without a title is not added', async () => {
            const newBlog = {
                author: "Ellen Kalma",
                url: 'joku url',
                likes: 5,
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)

            const response = await api.get('/api/blogs')

            assert.strictEqual(response.body.length, helper.initialBlogs.length)
        })

        test('a blog without url and title is not added', async () => {
            const newBlog = {
                author: "Ellen Kalma",
                likes: 5,
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)

            const response = await api.get('/api/blogs')

            assert.strictEqual(response.body.length, helper.initialBlogs.length)
        })
    })

    describe('deleting a blog', () => {

        test('a blog can be deleted', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[0]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb()

            const ids = blogsAtEnd.map(b => b.id)
            assert(!ids.includes(blogToDelete.id))

            assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
        })
    })

    describe('updating a blog', () => {

        test('a blog can be updated', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[0]

            const updatedData = {
                title: 'Uusi otsikko',
                author: blogToUpdate.author,
                url: blogToUpdate.url,
                likes: blogToUpdate.likes + 1
            }

            const response = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(updatedData)
                .expect(200)
                .expect('Content-Type', /application\/json/)

            assert.strictEqual(response.body.title, 'Uusi otsikko')
            const blogsAtEnd = await helper.blogsInDb()
            const updatedBlog = blogsAtEnd.find(b => b.id === blogToUpdate.id)

            assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 1)

        })
    })
})

after(async () => {
    await mongoose.connection.close()
})

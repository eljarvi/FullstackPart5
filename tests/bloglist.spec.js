const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
        await request.post('http://localhost:3003/api/testing/reset')
        await request.post('http://localhost:3003/api/users', {
            data: {
                name: 'Matti Luukkainen',
                username: 'mluukkai',
                password: 'salainen'
            }
        })

        await page.goto('http://localhost:5173')
    })

    test('Login form is shown', async ({ page }) => {
        await expect(page.getByText('log in to application')).toBeVisible()
        await expect(page.getByLabel('username')).toBeVisible()
        await expect(page.getByLabel('password')).toBeVisible()
    })

    describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {

            await page.getByLabel('username').fill('mluukkai')
            await page.getByLabel('password').fill('salainen')

            await page.getByRole('button', { name: 'login' }).click()

            await expect(page.getByText('Matti Luukkainen logged in')).toBeVisible()
        })

        test('fails with wrong credentials', async ({ page }) => {

            await page.getByLabel('username').fill('mluukkai')
            await page.getByLabel('password').fill('vaara')

            await page.getByRole('button', { name: 'login' }).click()

            await expect(page.getByText('wrong username or password')).toBeVisible()
        })
    })

    describe('When logged in', () => {
        beforeEach(async ({ page }) => {
            await page.getByLabel('username').fill('mluukkai')
            await page.getByLabel('password').fill('salainen')
            await page.getByRole('button', { name: 'login' }).click()
        })

        test('a new blog can be created', async ({ page }) => {
            await page.getByRole('button', { name: 'add blog' }).click()
            await page.getByLabel('title').fill('title of the blog')
            await page.getByLabel('author').fill('author of the blog')
            await page.getByLabel('url').fill('url of the blog')
            await page.getByRole('button', { name: 'create' }).click()
            await expect(page.getByText('title of the blog')).toBeVisible()
        })

        test('a blog can be liked', async ({ page }) => {
            await page.getByRole('button', { name: 'add blog' }).click()
            await page.getByLabel('title').fill('Testiblogi')
            await page.getByLabel('author').fill('Testaaja')
            await page.getByLabel('url').fill('http://example.com')
            await page.getByRole('button', { name: 'create' }).click()

            await page.getByRole('button', { name: 'view' }).click()

            await page.getByRole('button', { name: 'like' }).click()

            await expect(page.getByText('likes 1')).toBeVisible()
        })
    })
})
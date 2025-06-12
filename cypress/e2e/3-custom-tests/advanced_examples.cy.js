/// <reference types="cypress" />

context('Advanced Cookies', () => {
  beforeEach(() => {
    cy.visit('cypress/fixtures/simple_page.html')
  })

  it('persists cookie across page loads and paths', () => {
    cy.setCookie('session_id', 'abc123', { path: '/' })
    cy.getCookie('session_id').should('have.property', 'value', 'abc123')

    cy.visit('cypress/fixtures/simple_page.html#/other')
    cy.getCookie('session_id').should('have.property', 'value', 'abc123')

    cy.clearCookie('session_id', { path: '/' })
    cy.getCookie('session_id').should('be.null')
  })

  it('handles multiple cookies with the same name on different paths', () => {
    cy.setCookie('pathCookie', 'root', { path: '/' })
    cy.setCookie('pathCookie', 'sub', { path: '/sub' })

    cy.getAllCookies().should((cookies) => {
      const rootCookie = cookies.find((c) => c.path === '/')
      const subCookie = cookies.find((c) => c.path === '/sub')
      expect(rootCookie).to.have.property('value', 'root')
      expect(subCookie).to.have.property('value', 'sub')
    })
  })
})

context('Cache using localStorage', () => {
  beforeEach(() => {
    cy.visit('cypress/fixtures/simple_page.html')
  })

  it('stores API result in localStorage and reuses it across reloads', () => {
    let callCount = 0
    const fresh = { value: 'fresh' }

    cy.intercept('GET', '/cache-data', (req) => {
      callCount += 1
      req.reply({ statusCode: 200, body: fresh })
    }).as('cache')

    const fetchAndCache = () => {
      return cy.window().then((win) => {
        const existing = win.localStorage.getItem('cache')
        if (existing) {
          return JSON.parse(existing)
        }

        return fetch('/cache-data')
          .then((r) => r.json())
          .then((data) => {
            win.localStorage.setItem('cache', JSON.stringify(data))
            return data
          })
      })
    }

    fetchAndCache().then((data) => {
      expect(data).to.deep.equal(fresh)
    })

    cy.wrap(null).then(() => expect(callCount).to.eq(1))

    cy.reload()

    fetchAndCache().then((data) => {
      expect(data).to.deep.equal(fresh)
    })

    cy.wrap(null).then(() => expect(callCount).to.eq(1))
  })
})

context('Advanced API interactions', () => {
  beforeEach(() => {
    cy.visit('cypress/fixtures/simple_page.html')
  })

  it('creates a user and handles server errors with retries', () => {
    let attempts = 0

    cy.intercept('POST', '/api/users', (req) => {
      attempts += 1
      if (attempts < 3) {
        req.reply({ statusCode: 500, body: { error: 'try again' } })
      } else {
        req.reply({ statusCode: 201, body: { id: 1, name: req.body.name } })
      }
    }).as('createUser')

    cy.window().then((win) => {
      const attempt = (n = 0) => {
        return fetch('/api/users', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: 'Alice' }),
        }).then((res) => {
          if (!res.ok && n < 2) {
            throw new Error('retry')
          }
          return res.json()
        }).catch(() => attempt(n + 1))
      }

      return attempt()
    }).then((body) => {
      expect(body).to.deep.equal({ id: 1, name: 'Alice' })
    })

    cy.wrap(null).then(() => expect(attempts).to.eq(3))
  })
})
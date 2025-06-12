
describe('User Profile Flow', () => {
  before(() => {
    cy.setCookie("suggest_store_popup_closed", "true");
    cy.visit('/customer/account/login/');
  });

  it('Logs in and navigates to account info', () => {
    cy.get('#email').type('test.user@example.com');
    cy.get('#pass').type('securePassword123');
    cy.get('button.login').click();

    cy.contains('My Account').should('exist');
    cy.get('.account-nav').contains('Account Information').click();

    cy.get('#firstname').should('be.visible');
    cy.get('#lastname').should('be.visible');
    cy.get('#change-email').should('not.be.checked');
  });
});

describe('Check window and location info', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/commands/location');
  });

  it('Validates location and window props', () => {
    cy.url().should('include', '/location');
    cy.location().should((loc) => {
      expect(loc.hostname).to.equal('example.cypress.io');
      expect(loc.protocol).to.eq('https:');
    });
    cy.window().should('have.property', 'top');
    cy.document().should('have.property', 'charset').and('eq', 'UTF-8');
  });
});

describe('Responsive tests', () => {
  it('Should toggle menu on mobile', () => {
    cy.visit('https://example.cypress.io/commands/viewport');
    cy.viewport('iphone-6');
    cy.get('.navbar-toggle').should('be.visible').click();
    cy.get('.nav').find('a').should('be.visible');
  });
});

describe('Cookies test', () => {
  it('Sets and reads a cookie', () => {
    cy.setCookie('user_session', 'abc123');
    cy.getCookie('user_session').should('have.property', 'value', 'abc123');
  });
});

describe('Upload file test', () => {
  it('Uploads a file', () => {
    const fileName = 'sample.pdf';
    cy.get('input[type="file"]').selectFile(`cypress/fixtures/${fileName}`);
    cy.get('.upload-success').should('contain', 'Upload complete');
  });
});

describe('Network wait test', () => {
  it('Waits for a GET request to finish', () => {
    cy.intercept('GET', '/api/user/*').as('getUser');
    cy.get('.load-user-btn').click();
    cy.wait('@getUser').its('response.statusCode').should('eq', 200);
  });
});

describe('Network request examples', () => {
  it('Makes a direct API call and waits on intercept', () => {
    cy.intercept('GET', '**/comments/*').as('getComment');
    cy.request('https://jsonplaceholder.cypress.io/comments/1');
    cy.wait('@getComment').its('response.statusCode').should('eq', 200);
  });

  it('Chains API requests', () => {
    cy.request('https://jsonplaceholder.cypress.io/users?_limit=1')
      .its('body.0')
      .then((user) => {
        cy.request('POST', 'https://jsonplaceholder.cypress.io/posts', {
          userId: user.id,
          title: 'Cypress Test',
          body: 'Testing with cy.request',
        }).its('status').should('eq', 201);
      });
  });
});

describe('Alias usage', () => {
  before(() => {
    cy.visit('https://example.cypress.io/commands/aliasing');
  });

  it('Aliases elements and network calls', () => {
    cy.get('.as-table').find('tbody>tr').first().find('td').first().find('button').as('firstBtn');
    cy.get('@firstBtn').click();
    cy.get('@firstBtn').should('have.class', 'btn-success');

    cy.intercept('GET', '**/comments/*').as('getComment');
    cy.get('.network-btn').click();
    cy.wait('@getComment');
  });
});

describe('Local storage handling', () => {
  before(() => {
    cy.visit('https://example.cypress.io/commands/storage');
  });

  it('Reads and clears localStorage', () => {
    cy.get('.ls-btn').click();
    cy.getAllLocalStorage().should((storage) => {
      expect(storage['https://example.cypress.io']).to.have.property('prop1', 'red');
    });
    cy.clearLocalStorage();
    cy.getAllLocalStorage().should((storage) => {
      expect(storage['https://example.cypress.io']).to.deep.equal({});
    });
  });
});

describe('File operations', () => {
  it('Writes and reads a fixture file', () => {
    const user = { id: 1, name: 'John Doe' };
    cy.writeFile('cypress/fixtures/tempUser.json', user);
    cy.readFile('cypress/fixtures/tempUser.json').should('deep.equal', user);
  });
});

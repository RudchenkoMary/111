
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

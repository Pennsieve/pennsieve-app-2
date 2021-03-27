describe('Org Settings', function () {
  before(function () {
    cy.fixture('user').as('user').then(user => {
      const { EMAIL, PASSWORD } = user

      cy.loginByJSON(EMAIL, PASSWORD)
        .then(response => {
          cy.setCookie('user_token', response.body.sessionToken)
        })
    })
  })

  it('can view org settings', function () {
    const { ORG_ID } = this.user
    cy.visit(`/${ORG_ID}/settings`)
  })
})
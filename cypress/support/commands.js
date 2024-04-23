// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
// Cypress.Commands.add("deletarUsuario", function (id) {
//   cy.request("DELETE", "/users/" + id);
// });

import { fakerPT_BR } from "@faker-js/faker";

var nome = fakerPT_BR.person.fullName();
var email = fakerPT_BR.internet.email();
var token;

Cypress.Commands.add("userCreate", () => {
  cy.request({
    method: "POST",
    url: "/users",
    body: {
      name: nome,
      email: email,
      password: "teste1",
    },
  });
});

Cypress.Commands.add("userLogin", () => {
  cy.request({
    method: "POST",
    url: "auth/login",
    body: {
      email: email,
      password: "teste1",
    },
  }).then(function (response) {
    token = response.body.accessToken;
  });
});

Cypress.Commands.add("userAdmin", () => {
  cy.request({
    method: "PATCH",
    url: "users/admin",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
});
//export default Commands;

//cenários de testes relacionados a criaçao de usuários, autenticaçao e consultas
//https://raromdb-3c39614e42d4.herokuapp.com/api/users

import { fakerPT_BR } from "@faker-js/faker";

var nome = fakerPT_BR.person.fullName();
var email = fakerPT_BR.internet.email();

describe("Cenários de teste relacionados a criaçao inválidas de usuário", () => {
  it("Cadastrar usuário sem inserir nome", () => {
    cy.request({
      method: "POST",
      url: "/users",
      body: {
        email: "emailvalido@raro.com",
        password: "teste1",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: [
          "name must be longer than or equal to 1 characters",
          "name must be a string",
          "name should not be empty",
        ],
        statusCode: 400,
      });
    });
  });

  it("Cadastrar usuário sem inserir email", () => {
    cy.request({
      method: "POST",
      url: "/users",
      body: {
        name: "Nome Válido",
        password: "teste1",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: [
          "email must be longer than or equal to 1 characters",
          "email must be an email",
          "email should not be empty",
        ],
        statusCode: 400,
      });
    });
  });

  it("Cadastrar usuário com email invalido", () => {
    cy.request({
      method: "POST",
      url: "/users",
      body: {
        name: "Nome Válido",
        email: "@.com",
        password: "teste1",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: ["email must be an email"],
        statusCode: 400,
      });
    });
  });

  it("Cadastrar usuário com senha maior que 12 digitos", () => {
    cy.request({
      method: "POST",
      url: "/users",
      body: {
        name: "Nome valido",
        email: "emailvalido@raro.com",
        password: "12345678910111213",
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: ["password must be shorter than or equal to 12 characters"],
        statusCode: 400,
      });
    });
  });

  it("Cadastrar usuário com senha menor que 6 digitos", () => {
    cy.request({
      method: "POST",
      url: "/users",
      body: {
        name: "Nome válido",
        email: "emailvalido@raro.com",
        password: "12345",
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: ["password must be longer than or equal to 6 characters"],
        statusCode: 400,
      });
    });
  });
});

describe("Cenários de teste relacionados a criaçao de usuario", () => {
  it("Cadastro de usuário válido", () => {
    cy.request({
      method: "POST",
      url: "/users",
      body: {
        name: nome,
        email: email,
        password: "teste1",
      },
    }).then(function (response) {
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property("id");
      expect(response.body.name).to.equal(nome);
      expect(response.body.email).to.equal(email);
      expect(response.body.type).to.equal(0);
      expect(response.body.active).to.equal(true);
    });
  });

  it("Cadastro de usuário ja cadastrado", () => {
    cy.request({
      method: "POST",
      url: "/users",
      body: {
        name: nome,
        email: email,
        password: "teste1",
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(409);
      expect(response.body.message).to.equal("Email already in use");
    });
  });
});

describe("Autenticaçao usuário ", () => {
  var token;

  it("Realizando login com email inválido", () => {
    cy.request({
      method: "POST",
      url: "auth/login",
      body: {
        email: "@email.com",
        password: "teste1",
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: ["email must be an email"],
        statusCode: 400,
      });
    });
  });

  it("Autenticando usuário válido", () => {
    cy.request("POST", "auth/login", {
      email: email,
      password: "teste1",
    }).then(function (response) {
      token = response.body.accessToken;
    });
  });

  it("Promovendo user admin", () => {
    cy.request({
      method: "PATCH",
      url: "users/admin",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
  });

  it("Procurar o usuário pelo id", () => {
    cy.request({
      method: "GET",
      url: "/users/1",
      headers: {
        Authorization: "Bearer " + token,
      },
    }).then(function (response) {
      expect(response.status).to.equal(200);
    });
  });

  it("Listar usuários como adm", () => {
    cy.request({
      method: "GET",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users",
      headers: {
        Authorization: "Bearer " + token,
      },
    }).then(function (response) {
      expect(response.status).to.equal(200);
    });
  });

  it("Listar usuários como usuario comum", () => {
    cy.request({
      method: "GET",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users",
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        message: "Access denied.",
        error: "Unauthorized",
        statusCode: 401,
      });
    });
  });
});

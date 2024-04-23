//cenários de testes relacionados a criaçao de usuários, autenticaçao e consultas
//https://raromdb-3c39614e42d4.herokuapp.com/api/users

import { fakerPT_BR } from "@faker-js/faker";

var nome = fakerPT_BR.person.fullName();
var email = fakerPT_BR.internet.email();
var token;

describe("Cenários de teste relacionados a criaçao inválidas de usuário", () => {
  it("Deve retornar erro ao tentar cadastrar com campo Name vazio", () => {
    cy.request({
      method: "POST",
      url: "/users",
      body: {
        name: "",
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
          "name should not be empty",
        ],
        statusCode: 400,
      });
    });
  });

  it("Deve retornar erro ao tentar cadastrar com campo Name diferente de string", () => {
    cy.request({
      method: "POST",
      url: "/users",
      body: {
        name: 10,
        email: "emailvalido@raro.com",
        password: "teste1",
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: [
          "name must be longer than or equal to 1 and shorter than or equal to 100 characters",
          "name must be a string",
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
  it("Deve retornar sucesso ao cadastrar usuário", () => {
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

  it("Deve retornar erro ao tentar cadastrar usuário já cadastrado", () => {
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

describe("Cenários de testes relacionados a autenticaçao de usuário ", () => {
  //var token;
  var idUser;

  it("Autenticando usuário válido", () => {
    cy.request("POST", "auth/login", {
      email: email,
      password: "teste1",
    }).then(function (response) {
      token = response.body.accessToken;
      expect(response.status).to.equal(200);
      idUser = response.body.id;
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
      url: "/users",
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
      url: "/users",
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

describe("Cenários de testes relacionados a criaçao de review com usuário comum", () => {
  it("Deve retornar erro ao tentar cadastrar com usuario comum", () => {
    cy.request({
      method: "POST",
      url: "/users/review",
      body: {
        movieId: 50,
        score: 0,
        reviewText: "legal",
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(401);
      expect(response.body).to.deep.equal({
        error: "Unauthorized",
        message: "Access denied.",
        statusCode: 401,
      });
    });
  });
});

describe("Cenários de testes relacionados a criaçao de review com usuaro adm", () => {
  it("Deve retornar sucesso ao tentar cadastrar review", () => {
    cy.request({
      method: "POST",
      url: "/users/review",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        movieId: 717,
        score: 5,
        reviewText: "legal",
      },
    }).then(function (response) {
      expect(response.status).to.equal(201);
    });
  });

  it("Deve retornar erro ao tentar cadastrar review com score menor que 1", () => {
    cy.request({
      method: "POST",
      url: "/users/review",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        movieId: 717,
        score: 0,
        reviewText: "legal",
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: "Score should be between 1 and 5",
        statusCode: 400,
      });
    });
  });

  it("Deve retornar erro ao tentar cadastrar review com score maior que 5", () => {
    cy.request({
      method: "POST",
      url: "/users/review",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        movieId: 717,
        score: 6,
        reviewText: "legal",
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: "Score should be between 1 and 5",
        statusCode: 400,
      });
    });
  });
});

describe("Cenários de testes relacionados a listagem de review", () => {
  it("Deve retornar lista de reviews cadastrados pelo usuário", () => {
    cy.request({
      method: "GET",
      url: "/users/review/all",
      headers: {
        Authorization: "Bearer " + token,
      },
    }).then(function (response) {
      expect(response.status).to.equal(200);
    });
  });
});

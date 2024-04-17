//cenários de testes relacionados a criaçao de filmes, listagem e consultas
//https://raromdb-3c39614e42d4.herokuapp.com/api/users

import { fakerPT_BR } from "@faker-js/faker";

var email = fakerPT_BR.internet.email();
var token;

describe("Cenários de testes relacionados a consulta de filmes", () => {
  it("Listar todos os filmes disponíveis", () => {
    cy.request({
      method: "GET",
      url: "https://raromdb-3c39614e42d4.herokuapp.com/api/movies",
    }).then(function (response) {
      expect(response.status).to.equal(200);
    });
  });

  it("Consultar filme por ID ", () => {
    cy.request({
      method: "GET",
      url: "/movies/search?title=1",
    }).then(function (response) {
      expect(response.status).to.equal(200);
    });
  });
});

describe("Cenários de testes relacionados a cadastros de filmes", () => {
  before(() => {
    cy.request("POST", "https://raromdb-3c39614e42d4.herokuapp.com/api/users", {
      name: "Carol",
      email: email,
      password: "teste1",
    });
    cy.request(
      "POST",
      "https://raromdb-3c39614e42d4.herokuapp.com/api/auth/login",
      {
        email: email,
        password: "teste1",
      }
    ).then(function (response) {
      token = response.body.accessToken;

      cy.request({
        method: "PATCH",
        url: "https://raromdb-3c39614e42d4.herokuapp.com/api/users/admin/",
        headers: {
          Authorization: "Bearer " + token,
        },
      });
    });
  });

  it("Cadastrar um filme sem inserir o título", () => {
    cy.request({
      method: "POST",
      url: "/movies",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        title: "",
        genre: "Ação",
        description: "FIlme de ação",
        durationInMinutes: 60,
        releaseYear: 2024,
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: [
          "title must be longer than or equal to 1 characters",
          "title should not be empty",
        ],
        statusCode: 400,
      });
    });
  });

  it("Cadastrar um filme sem inserir o genero", () => {
    cy.request({
      method: "POST",
      url: "/movies",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        title: "Onde o vento faz a curva",
        genre: "",
        description: "FIlme de ação",
        durationInMinutes: 60,
        releaseYear: 2024,
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: [
          "genre must be longer than or equal to 1 characters",
          "genre should not be empty",
        ],
        statusCode: 400,
      });
    });
  });

  it("Cadastrar um filme sem inserir a descriçao", () => {
    cy.request({
      method: "POST",
      url: "/movies",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        title: "Onde o vento faz a curva",
        genre: "brega",
        description: "",
        durationInMinutes: 60,
        releaseYear: 2024,
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(400);
      expect(response.body).to.deep.equal({
        error: "Bad Request",
        message: [
          "description must be longer than or equal to 1 characters",
          "description should not be empty",
        ],
        statusCode: 400,
      });
    });
  });

  it("Cadastrar filme com sucesso", () => {
    cy.request({
      method: "POST",
      url: "/movies",
      headers: {
        Authorization: "Bearer " + token,
      },
      body: {
        title: "Onde o vento faz a curva",
        genre: "brega",
        description: "teste teste teste teset ",
        durationInMinutes: 60,
        releaseYear: 2024,
      },
      failOnStatusCode: false,
    }).then(function (response) {
      expect(response.status).to.equal(201);
    });
  });
});

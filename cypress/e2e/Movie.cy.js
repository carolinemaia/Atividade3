//cenários de testes relacionados a criaçao de filmes, listagem e consultas
//https://raromdb-3c39614e42d4.herokuapp.com/api/users

import { fakerPT_BR } from "@faker-js/faker";

var email = fakerPT_BR.internet.email();
var token;

before(() => {
  // cy.userCreate();
  // cy.userLogin();
  // cy.userAdmin();

  cy.request("POST", "/users", {
    name: "Carol",
    email: email,
    password: "teste1",
  });
  cy.request("POST", "/auth/login", {
    email: email,
    password: "teste1",
  }).then(function (response) {
    token = response.body.accessToken;

    cy.request({
      method: "PATCH",
      url: "/users/admin",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
  });
});

describe("Rota de fillme", () => {
  //describe pai

  var idFilme;
  const film = {
    title: "Batman vs Superman",
    genre: "ação",
    description: "Uma turminha do barulho",
    durationInMinutes: 120,
    releaseYear: 2015,
  };

  describe("Cenários de testes relacionados a consulta de filmes", () => {
    it("Deve retornar sucesso ao buscar todos os filmes disponiveis", () => {
      cy.request({
        method: "GET",
        url: "https://raromdb-3c39614e42d4.herokuapp.com/api/movies",
      }).then(function (response) {
        expect(response.status).to.equal(200);
      });
    });

    it("Deve retornar sucesso ao consultar filme por ID ", () => {
      cy.request({
        method: "GET",
        url: "/movies/search?title=" + idFilme,
      }).then(function (response) {
        expect(response.status).to.equal(200);
        idFilme = response.body.id;
      });
    });
  });

  describe("Cenários de testes relacionados a cadastros de filmes", () => {
    it("Deve retornar erro ao cadastrar filme sem Titulo", () => {
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

    it("Deve retornar erro ao cadastrar filme sem genero", () => {
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

    it("Deve retornar erro ao cadastrar filme sem descriçao", () => {
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

    it("Deve retornar sucesso ao cadastrar filme com dados válidos", () => {
      cy.fixture("/movieCreate.json").then((dadosFilme) => {
        cy.request({
          method: "POST",
          url: "/movies",
          headers: {
            Authorization: "Bearer " + token,
          },
          body: dadosFilme,
        }).then(function (response) {
          expect(response.status).to.equal(201);
          idFilme = response.body.id;
        });
      });
    });
  });

  describe("Cenários de testes relacionados a atualizaçao de filmes", () => {
    it("Deve retornar erro a atualizar filme como usuario comum", () => {
      cy.request({
        method: "PUT",
        url: "/movies/0",
        body: {
          title: "teste",
          genre: "teste",
          description: "teste",
          durationInMinutes: 120,
          releaseYear: 2010,
        },
        failOnStatusCode: false,
      }).then(function (response) {
        expect(response.status).to.equal(401);
      });
    });

    it("Deve retornar sucesso a atualizar filme", () => {
      cy.request({
        method: "PUT",
        url: "/movies/" + idFilme,
        headers: {
          Authorization: "Bearer " + token,
        },
        body: {
          title: "teste",
          genre: "teste",
          description: "teste",
          durationInMinutes: 120,
          releaseYear: 2010,
        },
      }).then(function (response) {
        expect(response.status).to.equal(204);
      });
    });
  });
});

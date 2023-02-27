const express = require("express");
const {
  listaContas,
  criarContas,
  atualizarConta,
  deletarConta,
  depositar,
  sacar,
  transferir,
  saldo,
  extrato,
} = require("./controladores/sistema.bancario");
const { validarSenha } = require("./intermediarios/senha.middleware");
const rotas = express();
rotas.use(express.json());

rotas.post("/contas", criarContas);
rotas.delete("/contas/:numeroConta", deletarConta);
rotas.put("/contas/:numeroConta/usuario", atualizarConta);
rotas.post("/transacoes/depositar", depositar);
rotas.post("/transacoes/sacar", sacar);
rotas.post("/transacoes/transferir", transferir);
rotas.get("/contas/saldo", saldo);
rotas.get("/contas/extrato", extrato);

rotas.get("/contas", validarSenha, listaContas);

module.exports = rotas;

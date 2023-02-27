const arrayConta = require("../dados/bancodedados");
const { format } = require("date-fns");
let data = () => format(new Date(), "yyyy-MM-d H:m:s");

let registrarDeposito = (numero_conta, valor) => {
  arrayConta.depositos.push({
    data: data(),
    numero_conta: numero_conta,
    valor: valor,
  });
};
let registrarSaque = (numero_conta, valor) => {
  arrayConta.saques.push({
    data: data(),
    numero_conta: numero_conta,
    valor: valor,
  });
};

let registrarTransferencia = (
  numero_conta_origem,
  numero_conta_destino,
  valor
) => {
  arrayConta.transferencias.push({
    data: data(),
    numero_conta_origem: numero_conta_origem,
    numero_conta_destino: numero_conta_destino,
    valor: valor,
  });
};

module.exports = {
  registrarDeposito,
  registrarSaque,
  registrarTransferencia,
};

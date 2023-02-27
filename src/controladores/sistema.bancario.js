const arrayConta = require("../dados/bancodedados");
const {
  registrarDeposito,
  registrarSaque,
  registrarTransferencia,
} = require("../utils/data.utils");
let numeroDaConta = 1;

const listaContas = (req, res) => {
  return res.status(200).json(arrayConta.contas);
};

const criarContas = (req, res) => {
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
  const verificar = arrayConta.contas.find((elemento) => {
    return elemento.usuario.cpf === cpf || elemento.usuario.email === email;
  });

  if (verificar) {
    return res
      .status(409)
      .json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" });
  }
  if (!nome) {
    return res
      .status(400)
      .json({ mensagem: "O nome é obrigatório, Por favor preencha-o." });
  }
  if (!cpf) {
    return res
      .status(400)
      .json({ mensagem: "O cpf é obrigatório, Por favor preencha-o." });
  }
  if (!data_nascimento) {
    return res.status(400).json({
      mensagem: "A data de nascimento é obrigatório, Por favor preencha-a.",
    });
  }
  if (!telefone) {
    return res
      .status(400)
      .json({ mensagem: "O telefone é obrigatório, Por favor preencha-o." });
  }
  if (!email) {
    return res
      .status(400)
      .json({ mensagem: "O email é obrigatório, Por favor preencha-o." });
  }
  if (!senha) {
    return res
      .status(400)
      .json({ mensagem: "A senha é obrigatória, Por favor preencha-o." });
  }

  const conta = {
    numero: numeroDaConta++,
    saldo: 0,
    usuario: {
      nome,
      cpf,
      data_nascimento,
      telefone,
      email,
      senha,
    },
  };

  arrayConta.contas.push(conta);
  return res.status(201).send();
};

const atualizarConta = (req, res) => {
  const { numeroConta } = req.params;
  const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

  if (!nome) {
    return res.status(400).json({ mensagem: "favor informar o nome." });
  }
  if (!data_nascimento) {
    return res
      .status(400)
      .json({ mensagem: "favor informar a data de nascimento." });
  }
  if (!telefone) {
    return res.status(400).json({ mensagem: "favor informar o telefone" });
  }
  if (!email) {
    return res.status(400).json({ mensagem: "favor informar o email" });
  }
  if (!senha) {
    return res.status(400).json({ mensagem: "favor informar a senha" });
  }

  const contaExiste = arrayConta.contas.find((conta) => {
    return conta.numero === Number(numeroConta);
  });
  if (!contaExiste) {
    return res
      .status(404)
      .json({ mensagem: "Número da conta não encontrado." });
  }

  const verificarCpf = arrayConta.contas.find((conta) => {
    return conta.usuario.cpf === cpf && conta.numero !== Number(numeroConta);
  });

  if (verificarCpf) {
    return res
      .status(409)
      .json({ mensagem: "cpf já esta sendo utilizado em outra conta" });
  }
  const verificarEmail = arrayConta.contas.find((conta) => {
    return (
      conta.usuario.email === email && conta.numero !== Number(numeroConta)
    );
  });

  if (verificarEmail) {
    return res
      .status(409)
      .json({ mensagem: "Email já esta sendo utilizado em outra conta" });
  }

  contaExiste.usuario.cpf = cpf;
  contaExiste.usuario.nome = nome;
  contaExiste.usuario.data_nascimento = data_nascimento;
  contaExiste.usuario.telefone = telefone;
  contaExiste.usuario.senha = senha;
  contaExiste.usuario.email = email;

  return res.status(201).send();
};

const deletarConta = (req, res) => {
  const { numeroConta } = req.params;

  const contaExiste = arrayConta.contas.findIndex((conta) => {
    return conta.numero === Number(numeroConta);
  });
  if (contaExiste === -1) {
    return res.status(400).json({ mensagem: "Conta não encontrada" });
  }

  if (arrayConta.contas[contaExiste].saldo > 0) {
    return res.status(400).json({
      mensagem: "Não é possivel deletar a conta pois a mesma possue saldo",
    });
  }

  arrayConta.contas.splice(contaExiste, 1);
  return res.send();
};

const depositar = (req, res) => {
  const { numero_conta, valor } = req.body;

  const contaExiste = arrayConta.contas.find((conta) => {
    return conta.numero === Number(numero_conta);
  });

  if (!contaExiste) {
    return res
      .status(404)
      .json({ mensagem: "Numero de conta não encontrado." });
  }

  if (!valor || valor <= 0) {
    return res
      .status(400)
      .json({ mensagem: "favor informar um valor válido." });
  }

  contaExiste.saldo += valor;

  registrarDeposito(numero_conta, valor);

  return res.send();
};

const sacar = (req, res) => {
  const { numero_conta, valor, senha } = req.body;

  const contaExiste = arrayConta.contas.find((conta) => {
    return conta.numero === Number(numero_conta);
  });

  if (!contaExiste) {
    return res.status(404).json({ mensagem: "numero de conta não encontrado" });
  }
  if (senha !== contaExiste.usuario.senha) {
    return res.status(400).json({ mensagem: "Senha incorreta." });
  }

  if (valor <= 0) {
    return res.status(400).json({ mensagem: "Valor invalido" });
  }

  if (valor > contaExiste.saldo) {
    return res.status(400).json({ mensagem: "Saldo insuficiente!" });
  }

  contaExiste.saldo -= valor;

  registrarSaque(numero_conta, valor);
  return res.send();
};

const transferir = (req, res) => {
  const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

  if (!numero_conta_origem || !numero_conta_destino || !senha || !valor) {
    return res
      .status(400)
      .json({ mensagem: "Todos os dados precisam ser preenchidos." });
  }

  const contaOrigem = arrayConta.contas.find((conta) => {
    return conta.numero === Number(numero_conta_origem);
  });
  if (!contaOrigem) {
    return res
      .status(400)
      .json({ mensagem: "Conta de origem não encontrada!" });
  }

  const contaDestino = arrayConta.contas.find((conta) => {
    return conta.numero === Number(numero_conta_destino);
  });

  if (!contaDestino) {
    return res
      .status(400)
      .json({ mensagem: "Conta do destinatário não encontrada!" });
  }

  if (contaOrigem.usuario.senha !== senha) {
    return res.status(400).json({ mensagem: "Senha incorreta!" });
  }

  if (valor <= 0) {
    return res.status(400).json({ mensagem: "insira um valor válido" });
  }

  if (contaOrigem.saldo < valor) {
    return res.status(400).json({ mensagem: "Saldo insuficiente!" });
  }

  contaOrigem.saldo -= valor;
  contaDestino.saldo += valor;

  registrarTransferencia(numero_conta_origem, numero_conta_destino, valor);

  res.send();
};

const saldo = (req, res) => {
  const { numero_conta, senha } = req.query;

  if (!numero_conta || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Numero da conta e senha são obrigatórios." });
  }

  const contaExiste = arrayConta.contas.find((conta) => {
    return conta.numero === Number(numero_conta);
  });

  if (!contaExiste) {
    return res
      .status(404)
      .json({ mensagem: "Numero de conta não encontrado." });
  }

  if (senha !== contaExiste.usuario.senha) {
    return res.status(401).json({ mensagem: "Senha inválida!" });
  }

  return res.status(200).json({ saldo: contaExiste.saldo });
};

const extrato = (req, res) => {
  const { numero_conta, senha } = req.query;

  if (!numero_conta || !senha) {
    return res
      .status(400)
      .json({ mensagem: "Numero da conta e senha precisam ser informados!" });
  }

  const contaExiste = arrayConta.contas.find((conta) => {
    return conta.numero === Number(numero_conta);
  });

  if (!contaExiste) {
    return res.status(404).json({ mensagem: "Conta não encontrada!" });
  }

  if (senha !== contaExiste.usuario.senha) {
    return res.status(400).json({ mensagem: "Senha incorreta!" });
  }

  const depositos = arrayConta.depositos.filter((lista) => {
    return lista.numero_conta === numero_conta;
  });
  const saques = arrayConta.saques.filter((lista) => {
    return lista.numero_conta === numero_conta;
  });

  const transferencias = arrayConta.transferencias.reduce(
    (acumulador, transferencia) => {
      if (transferencia.numero_conta_origem === numero_conta) {
        acumulador.transferenciasEnviadas.push(transferencia);
      } else if (transferencia.numero_conta_destino === numero_conta) {
        acumulador.transferenciasRecibidas.push(transferencia);
      }
      return acumulador;
    },
    {
      transferenciasEnviadas: [],
      transferenciasRecibidas: [],
    }
  );

  const listaExtrato = {
    depositos: depositos,
    saques: saques,
    ...transferencias,
  };

  return res.status(200).json(listaExtrato);
};

module.exports = {
  listaContas,
  criarContas,
  atualizarConta,
  deletarConta,
  depositar,
  sacar,
  transferir,
  saldo,
  extrato,
};

// Client ID oficial da aplicação Baila NoCode
const CLIENT_ID = "Ov23liIVqkNHd6IgDPve";

let accessToken = "";
let githubUser = "";

let blocos = [
  { tipo: "imagem", valor: "https://unsplash.com" },
  { tipo: "titulo", valor: "Bem-vindo ao Meu Espaço" },
  { tipo: "texto", valor: "Criado visualmente no Baila NoCode e alojado 100% grátis no GitHub." },
  { tipo: "botao", valor: "Falar Comigo", link: "https://github.com" }
];

function atualizarPreview() {
  const frame = document.getElementById("previewFrame");
  const container = document.getElementById("carrdContainer");
  const bgColor = document.getElementById("bgColor").value;
  const cardColor = document.getElementById("cardColor").value;
  const accentColor = document.getElementById("accentColor").value;

  frame.style.backgroundColor = bgColor;
  container.style.backgroundColor = cardColor;
  container.innerHTML = "";

  blocos.forEach((bloco, index) => {
    const div = document.createElement("div");
    div.className = "editable-item";

    let htmlBloco = "";
    if (bloco.tipo === "titulo") {
      htmlBloco = `<h1 contenteditable="true" onblur="editarBloco(${index}, this.innerText)">${bloco.valor}</h1>`;
    } else if (bloco.tipo === "texto") {
      htmlBloco = `<p contenteditable="true" onblur="editarBloco(${index}, this.innerText)">${bloco.valor}</p>`;
    } else if (bloco.tipo === "botao") {
      htmlBloco = `<a href="${bloco.link}" target="_blank" style="display:inline-block;padding:12px 24px;background:${accentColor};color:#ffffff;border-radius:8px;text-decoration:none;font-weight:bold;" contenteditable="true" onblur="editarBloco(${index}, this.innerText)">${bloco.valor}</a>`;
    } else if (bloco.tipo === "imagem") {
      htmlBloco = `<img src="${bloco.valor}" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid ${accentColor};">`;
    }

    div.innerHTML = `
      <div class="item-tools">
        <button onclick="moverBloco(${index}, -1)" title="Subir">⬆️</button>
        <button onclick="moverBloco(${index}, 1)" title="Descer">⬇️</button>
        <button onclick="apagarBloco(${index})" title="Apagar">🗑️</button>
      </div>
      ${htmlBloco}
    `;

    container.appendChild(div);
  });
}

function editarBloco(index, novoTexto) {
  blocos[index].valor = novoTexto;
}

function moverBloco(index, direcao) {
  const novoIndex = index + direcao;
  if (novoIndex < 0 || novoIndex >= blocos.length) return;
  const temp = blocos[index];
  blocos[index] = blocos[novoIndex];
  blocos[novoIndex] = temp;
  atualizarPreview();
}

function apagarBloco(index) {
  blocos.splice(index, 1);
  atualizarPreview();
}

function adicionarBloco(tipo) {
  if (tipo === "titulo") blocos.push({ tipo: "titulo", valor: "Novo Título" });
  if (tipo === "texto") blocos.push({ tipo: "texto", valor: "Toca aqui para editar este texto..." });
  if (tipo === "botao") {
    const link = prompt("Qual o link do botão?", "https://") || "#";
    blocos.push({ tipo: "botao", valor: "Clica Aqui", link: link });
  }
  if (tipo === "imagem") {
    const url = prompt("Cola o link da imagem:");
    if (url) blocos.push({ tipo: "imagem", valor: url });
  }
  atualizarPreview();
}

// Login Oficial GitHub OAuth (Baila NoCode)
async function iniciarLoginGitHub() {
  const proxy = "https://corsproxy.io?";
  const res = await fetch(proxy + encodeURIComponent("https://github.com"), {
    method: "POST",
    headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: CLIENT_ID, scope: "repo" })
  });

  const data = await res.json();
  document.getElementById("userCode").innerText = data.user_code;
  document.getElementById("verifyLink").href = data.verification_uri;
  document.getElementById("deviceCodeArea").classList.remove("hidden");

  const intervalo = setInterval(async () => {
    const tokenRes = await fetch(proxy + encodeURIComponent("https://github.com"), {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        device_code: data.device_code,
        grant_type: "urn:ietf:params:oauth:grant-type:device_code"
      })
    });

    const tokenData = await tokenRes.json();
    if (tokenData.access_token) {
      clearInterval(intervalo);
      accessToken = tokenData.access_token;
      obterDadosUtilizador();
    }
  }, 5000);
}

async function obterDadosUtilizador() {
  const res = await fetch("https://github.com", {
    headers: { "Authorization": `Bearer ${accessToken}` }
  });
  const user = await res.json();
  githubUser = user.login;

  document.getElementById("loginBtn").classList.add("hidden");
  document.getElementById("deviceCodeArea").classList.add("hidden");
  document.getElementById("userLogged").classList.remove("hidden");
  document.getElementById("ghUsername").innerText = githubUser;
}

// Gerar múltiplos ficheiros e ativar GitHub Pages automaticamente
async function publicarProjeto() {
  const repo = document.getElementById("repoName").value.trim().replace(/\s+/g, '-');
  const status = document.getElementById("statusMsg");
  const accentColor = document.getElementById("accentColor").value;

  if (!accessToken) {
    status.innerHTML = "⚠️ Clica em <b>Entrar com GitHub</b> primeiro!";
    return;
  }
  if (!repo) {
    status.innerHTML = "⚠️ Escreve um nome para o projeto.";
    return;
  }

  status.innerHTML = "⏳ Baila NoCode a gerar ficheiros...";

  const conteudoLimpo = blocos.map(b => {
    if (b.tipo === "titulo") return `<h1>${b.valor}</h1>`;
    if (b.tipo === "texto") return `<p>${b.valor}</p>`;
    if (b.tipo === "botao") return `<a href="${b.link}" class="btn" target="_blank">${b.valor}</a>`;
    if (b.tipo === "imagem") return `<img src="${b.valor}" class="avatar">`;
  }).join("\n    ");

  const ficheiros = {
    "index.html": `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${repo} — Criado com Baila NoCode</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="card">
    ${conteudoLimpo}
  </div>
  <script src="js/main.js"></script>
</body>
</html>`,
    "css/style.css": `body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${document.getElementById("bgColor").value};
  color: white;
  font-family: -apple-system, sans-serif;
}
.card {
  background-color: ${document.getElementById("cardColor").value};
  padding: 40px 30px;
  border-radius: 20px;
  max-width: 480px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}
.avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${accentColor};
}
.btn {
  display: inline-block;
  margin-top: 15px;
  padding: 12px 26px;
  background: ${accentColor};
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
}`,
    "js/main.js": `console.log("Site gerado por Baila NoCode");`,
    "README.md": `# ${repo}\n\nProjeto gerado visualmente através da plataforma **Baila NoCode**.`
  };

  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json"
  };

  try {
    // 1. Criar Repositório
    await fetch("https://github.com/repos", {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: repo,
        description: "Criado com Baila NoCode",
        private: false
      })
    });

    // 2. Enviar os 4 ficheiros para o GitHub
    for (const [caminho, conteudo] of Object.entries(ficheiros)) {
      await fetch(`https://github.com{githubUser}/${repo}/contents/${caminho}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: `Baila NoCode: adicionar ${caminho}`,
          content: btoa(unescape(encodeURIComponent(conteudo)))
        })
      });
    }

    // 3. Ativar GitHub Pages automaticamente
    await fetch(`https://github.com{githubUser}/${repo}/pages`, {
      method: "POST",
      headers,
      body: JSON.stringify({ source: { branch: "main", path: "/" } })
    });

    status.innerHTML = `✅ <b>Publicado com sucesso!</b><br>
    📂 Código: <a href="https://github.com{githubUser}/${repo}" target="_blank">Ver Repositório</a><br>
    🌐 Site Online (aguarda 1 min): <a href="https://${githubUser}.github.io/${repo}/" target="_blank">Abrir Site</a>`;
  } catch (e) {
    status.innerHTML = "❌ Erro ao publicar. Verifica o nome do repositório.";
  }
}

atualizarPreview();

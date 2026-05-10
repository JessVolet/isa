const messageBox = document.getElementById("messageBox");
const statusLabel = document.getElementById("statusLabel");
const sparkLine = document.getElementById("sparkLine");
const card = document.querySelector(".forum-shell");
const partyBtn = document.getElementById("partyBtn");
const sceneBtn = document.getElementById("sceneBtn");
const openingBtn = document.getElementById("openingBtn");
const resetBtn = document.getElementById("resetBtn");
const buttons = document.querySelectorAll(".action-btn");
const animeArt = document.getElementById("animeArt");
const avatarArt = document.getElementById("avatarArt");
const animeLabel = document.getElementById("animeLabel");
const animeRating = document.getElementById("animeRating");
const animeTags = document.getElementById("animeTags");
const visitCounter = document.getElementById("visitCounter");
const radioBtn = document.getElementById("radioBtn");
const radioAudio = document.getElementById("radioAudio");
const radioStatus = document.getElementById("radioStatus");

const confettiPalette = ["#ffb703", "#00d4ff", "#ff4fd8", "#d6ff6b", "#ffffff"];
const nekosImageEndpoint = "https://api.nekosapi.com/v4/images/random/file?rating=safe&tags=girl";
const sceneThemes = [
  { accent: "#ff74bc", accent2: "#59c8ff", accent3: "#ffe06f" },
  { accent: "#ff8db5", accent2: "#7fe0ff", accent3: "#f7d96d" },
  { accent: "#c97dff", accent2: "#6fd3ff", accent3: "#ffd166" },
  { accent: "#ff7f95", accent2: "#6be7c8", accent3: "#ffe28a" },
];
let partyMode = false;
let partyTimer = null;
let confettiTimer = null;
let audioContext = null;
let openingTimer = null;
let openingMode = false;
let visits = 128;
let sceneThemeIndex = 0;
let radioOn = true;

function getRatingLabel(rating) {
  return rating ? rating.toUpperCase() : "SAFE";
}

function applyTheme(theme) {
  if (!theme) {
    return;
  }

  const setColor = (name, value) => document.documentElement.style.setProperty(name, value);
  setColor("--accent", theme.accent);
  setColor("--accent-2", theme.accent2);
  setColor("--accent-3", theme.accent3);
}

function describeScene(imageSrc) {
  animeArt.src = imageSrc;
  avatarArt.src = imageSrc;
  animeArt.alt = "Ilustración anime estilo retro para Isa";
  avatarArt.alt = "Avatar anime de Isa";
  animeLabel.textContent = `Escena lista para felicitar a Isa con energía anime y vibra de foro viejo.`;
  animeRating.textContent = "SAFE";
  animeTags.textContent = "retro, anime";
  applyTheme(sceneThemes[sceneThemeIndex % sceneThemes.length]);
}

function updateRadioStatus(text, active = radioOn) {
  radioStatus.textContent = text;
  radioBtn.textContent = active ? "Radio ON" : "Radio OFF";
}

async function startRadio() {
  try {
    radioAudio.loop = true;
    radioAudio.volume = 0.75;
    await radioAudio.play();
    updateRadioStatus("Reproduciendo Anime Nexus en vivo.", true);
  } catch (error) {
    updateRadioStatus("Autoplay bloqueado. Toca el botón para iniciar.", true);
  }
}

function stopRadio() {
  radioAudio.pause();
  updateRadioStatus("Radio detenida.", false);
}

async function loadRandomScene() {
  animeLabel.textContent = "Cargando Miku para Isa...";
  animeRating.textContent = "SAFE";
  animeTags.textContent = "miku, vocaloid";

  try {
    const loader = new Image();
    const mikuSrc = "assets/miku.jpeg";

    loader.decoding = "async";
    loader.referrerPolicy = "no-referrer";

    const imageSrc = await new Promise((resolve, reject) => {
      loader.onload = () => resolve(loader.src);
      loader.onerror = () => reject(new Error("Image load failed"));
      loader.src = mikuSrc;
    });

    sceneThemeIndex += 1;
    describeScene(imageSrc);
    visits += 1;
    visitCounter.textContent = `${String(visits).padStart(4, "0")} visitas`;
    showMessage("¡Miku está lista para felicitar a Isa! 🎵", { confetti: true });
  } catch (error) {
    animeLabel.textContent = "Miku necesita recargar. Intenta de nuevo.";
    animeRating.textContent = "SAFE";
    animeTags.textContent = "miku";
    animeArt.removeAttribute("src");
    avatarArt.removeAttribute("src");
    animeArt.alt = "Miku no disponible";
    avatarArt.alt = "Avatar Miku no disponible";
    showMessage("No se pudo cargar a Miku, pero la felicitación sigue lista.", { confetti: false });
  }
}

function buildSparkLine() {
  sparkLine.innerHTML = "";
  for (let index = 0; index < 8; index += 1) {
    const bar = document.createElement("span");
    bar.style.animationDelay = `${index * 90}ms`;
    sparkLine.appendChild(bar);
  }
}

function pulseCard() {
  card.classList.remove("flash");
  void card.offsetWidth;
  card.classList.add("flash");
}

function pulseMessage() {
  messageBox.classList.remove("pop");
  void messageBox.offsetWidth;
  messageBox.classList.add("pop");
}

function createConfettiBurst(amount = 16) {
  for (let index = 0; index < amount; index += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = confettiPalette[index % confettiPalette.length];
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
    piece.style.animationDelay = `${Math.random() * 180}ms`;
    piece.style.width = `${8 + Math.random() * 10}px`;
    piece.style.height = `${10 + Math.random() * 12}px`;
    document.body.appendChild(piece);
    window.setTimeout(() => piece.remove(), 1400);
  }
}

function startConfettiRain() {
  if (confettiTimer) {
    return;
  }

  createConfettiBurst(10);
  confettiTimer = window.setInterval(() => createConfettiBurst(4), 850);
}

function stopConfettiRain() {
  if (!confettiTimer) {
    return;
  }

  window.clearInterval(confettiTimer);
  confettiTimer = null;
}

function getAudioContext() {
  if (!audioContext) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtor();
  }

  return audioContext;
}

function playTone(context, frequency, startTime, duration, type = "square", gainValue = 0.04) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode).connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.05);
}

function startOpeningLoop() {
  const context = getAudioContext();
  context.resume();

  const melody = [
    659.25, 783.99, 880, 987.77,
    880, 783.99, 659.25, 587.33,
  ];
  const bass = [
    164.81, 164.81, 196, 196,
    174.61, 174.61, 196, 196,
  ];

  let step = 0;
  const loopStep = () => {
    const now = context.currentTime;
    playTone(context, melody[step % melody.length], now, 0.18, "square", 0.03);
    if (step % 2 === 0) {
      playTone(context, bass[step % bass.length], now, 0.26, "triangle", 0.022);
    }
    step += 1;
  };

  loopStep();
  openingTimer = window.setInterval(loopStep, 240);
}

function stopOpeningLoop() {
  if (openingTimer) {
    window.clearInterval(openingTimer);
    openingTimer = null;
  }

  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
    audioContext = null;
  }
}

function showMessage(text, { confetti = true } = {}) {
  messageBox.textContent = text;
  statusLabel.textContent = partyMode ? "Fiesta encendida" : "Mensaje del foro";
  pulseCard();
  pulseMessage();
  buildSparkLine();

  if (confetti) {
    createConfettiBurst(partyMode ? 24 : 14);
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    showMessage(button.dataset.message || "¡Felicidades, Isa!", { confetti: true });
  });
});

partyBtn.addEventListener("click", () => {
  partyMode = !partyMode;
  card.classList.toggle("party", partyMode);
  partyBtn.textContent = partyMode ? "Fiesta activa" : "Activar fiesta";
  statusLabel.textContent = partyMode ? "Modo fiesta activado" : "Listo para felicitar";
  showMessage(
    partyMode
      ? "Modo fiesta activado. Isa merece una lluvia continua de brillo, color y energía bonita, estilo foro antiguo."
      : "Fiesta apagada. Puedes seguir enviando mensajes retro cuando quieras.",
    { confetti: partyMode }
  );

  if (partyTimer) {
    window.clearInterval(partyTimer);
    partyTimer = null;
  }

  if (partyMode) {
    partyTimer = window.setInterval(() => createConfettiBurst(10), 1700);
  }
});

radioBtn.addEventListener("click", async () => {
  radioOn = !radioOn;
  if (radioOn) {
    await startRadio();
    showMessage("Radio encendida. La noche ya tiene opening de fondo.", { confetti: false });
    return;
  }

  stopRadio();
  showMessage("Radio apagada. Queda el modo visual retro listo.", { confetti: false });
});

sceneBtn.addEventListener("click", () => {
  loadRandomScene();
});


resetBtn.addEventListener("click", () => {
  partyMode = false;
  openingMode = false;
  card.classList.remove("party");
  partyBtn.textContent = "Activar fiesta";
  openingBtn.textContent = "Opening OFF";
  statusLabel.textContent = "Listo para felicitar";
  messageBox.textContent = "Toca un botón para disparar una felicitación animada.";
  buildSparkLine();

  if (partyTimer) {
    window.clearInterval(partyTimer);
    partyTimer = null;
  }

  stopOpeningLoop();
  animeLabel.textContent = "Toca un botón para disparar una felicitación animada.";
  animeRating.textContent = "SAFE";
  animeTags.textContent = "retro, anime";
});

buildSparkLine();
startConfettiRain();
loadRandomScene();
startRadio();

// Referencias DOM
  const toggleBtn = document.getElementById('toggleGame');
  const gameContainer = document.getElementById('gameContainer');
  const controls = document.getElementById('controls');
  const game = document.getElementById('game');
  const player = document.getElementById('player');
  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const restartBtn = document.getElementById('restartBtn');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const scoreDisplay = document.getElementById('score');

  const levelDisplay = document.getElementById('levelDisplay');
  const livesDisplay = document.getElementById('livesDisplay');
  const pointsDisplay = document.getElementById('pointsDisplay');
  const progressBar = document.getElementById('progressBar');
  const statsPanel = document.getElementById('statsPanel');
  const gameOverMsg = document.getElementById('gameOverMsg');

  // Skins buttons
  const skinButtons = document.querySelectorAll('#skinSelector button');

  // Estado del juego
  let gameActive = false;
  let gameRunning = false;
  let gameInterval, obstacleInterval;
  let score = 0;
  let lives = 3;
  let level = 1;
  let obstacleSpeed = 5;
  let spawnRate = 1000;
  let playerX = 125;
  let currentSkin = 'skinYellow'; // default

  // Configuración skins colores
  const skins = {
    skinYellow: '#ffeb3b',
    skinBlue: '#2196f3',
    skinGreen: '#4caf50',
    skinPurple: '#9c27b0',
    skinPink: '#E977FF'
  };

  // Activar / desactivar juego
 toggleBtn.addEventListener('click', () => {
  gameActive = !gameActive;

  toggleBtn.textContent = gameActive ? '⛔ Desactivar Juego' : '🎮 Activar Juego';

  // Mostrar u ocultar elementos
  gameContainer.classList.toggle('hidden', !gameActive);
  statsPanel.classList.toggle('hidden', !gameActive);
  controls.style.display = gameActive ? 'flex' : 'none';
  document.getElementById('skinTopCenter').style.display = gameActive ? 'flex' : 'none';

  // Fondo dinámico
  document.body.style.background = gameActive ? '#B3E5FC' : 'rgba(255,255,255,0.5)';

  // Reiniciar juego visualmente
  resetGame();
  hideGameOver();
});



  // Botones de control
  startBtn.addEventListener('click', () => {
    if (!gameRunning) {
      gameRunning = true;
      gameInterval = setInterval(updateObstacles, 20);
      obstacleInterval = setInterval(spawnObstacle, spawnRate);
      hideGameOver();
    }
  });

  stopBtn.addEventListener('click', () => {
    stopGame();
    resetGame();
    hideGameOver();
  });

  restartBtn.addEventListener('click', () => {
    stopGame();
    resetGame();
    startBtn.click();
  });

  leftBtn.addEventListener('click', () => movePlayer(-25));
  rightBtn.addEventListener('click', () => movePlayer(25));

  // Teclado
  document.addEventListener('keydown', (e) => {
    if (!gameActive || !gameRunning) return;
    if (e.key === 'ArrowLeft') movePlayer(-25);
    if (e.key === 'ArrowRight') movePlayer(25);
  });

  // Skins selector events
  skinButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      changeSkin(btn.id);
    });
  });

  // Cambiar skin
  function changeSkin(skinId) {
  currentSkin = skinId;

  skinButtons.forEach(b => b.classList.remove('selected'));
  const selectedBtn = document.getElementById(skinId);
  if (selectedBtn) selectedBtn.classList.add('selected');

  player.style.background = skins[skinId];
  player.style.boxShadow = `0 0 10px ${skins[skinId]}aa`;

  // Mostrar el color del skin en el panel
  const skinBox = document.getElementById('currentSkinBox');
  if (skinBox) {
    skinBox.style.background = skins[skinId];
    skinBox.style.boxShadow = `0 0 8px ${skins[skinId]}aa`;
  }
}



  // Mover jugador
  function movePlayer(delta) {
    playerX += delta;
    playerX = Math.max(0, Math.min(250, playerX));
    player.style.left = playerX + 'px';
  }

  // Resetear juego
  function resetGame() {
    score = 0;
    lives = 3;
    level = 1;
    obstacleSpeed = 5;
    spawnRate = 1000;
    playerX = 125;
    player.style.left = playerX + 'px';
    document.querySelectorAll('.obstacle').forEach(el => el.remove());
    updateStats();
    hideGameOver();
  }

  // Parar juego
  function stopGame() {
    clearInterval(gameInterval);
    clearInterval(obstacleInterval);
    gameRunning = false;
  }

  // Actualizar stats en panel
  function updateStats() {
    levelDisplay.textContent = level;
    livesDisplay.textContent = lives;
    pointsDisplay.textContent = score;
    scoreDisplay.textContent = score;

    // Barra progreso nivel (0-100 puntos modulo)
    let progress = (score % 100);
    progressBar.style.width = progress + '%';
  }

  // Subir nivel
  function checkLevelUp() {
    const newLevel = Math.floor(score / 100) + 1;
    if (newLevel > level) {
      level = newLevel;
      obstacleSpeed += 1;
      spawnRate = Math.max(400, spawnRate - 100);
      clearInterval(obstacleInterval);
      obstacleInterval = setInterval(spawnObstacle, spawnRate);
      updateStats();
    }
  }

  // Crear obstáculo
  function spawnObstacle() {
    const obs = document.createElement('div');
    obs.classList.add('obstacle');
    obs.style.left = Math.floor(Math.random() * 6) * 50 + 'px';
    obs.style.top = '0px';
    game.appendChild(obs);
  }

  // Actualizar obstáculos y detección colisiones
  function updateObstacles() {
   document.querySelectorAll('.obstacle').forEach(obs => {
  let top = parseInt(obs.style.top || '0');
  top += obstacleSpeed;
  obs.style.top = top + 'px';

  // Colisión (bounding box)
  const obsX = parseInt(obs.style.left);
  const obsY = top;

  const playerY = 350;
  const collision =
    obsX < playerX + 50 &&
    obsX + 50 > playerX &&
    obsY < playerY + 50 &&
    obsY + 50 > playerY;

  if (collision) {
    obs.remove();
    loseLife();
    return;
  }

  // Obstáculo evitado
  if (top > 400) {
    obs.remove();
    score += 5;
    updateStats();
    checkLevelUp();
  }
});

  }

  // Perder vida
  function loseLife() {
    lives--;
    updateStats();
    if (lives <= 0) {
      gameOver();
    }
  }

  // Mostrar mensaje Game Over
  function gameOver() {
    stopGame();
    showGameOver();
  }

  function showGameOver() {
    gameOverMsg.style.display = 'block';
  }
  function hideGameOver() {
    gameOverMsg.style.display = 'none';
  }

  // Iniciar con skin default
  changeSkin(currentSkin);


const skinToggleBtn = document.getElementById('skinToggleBtn');
const skinOptionsTop = document.getElementById('skinOptionsTop');
const topSkinColors = document.querySelectorAll('#skinOptionsTop .skin-color');

skinToggleBtn.addEventListener('click', () => {
  skinOptionsTop.style.display = skinOptionsTop.style.display === 'flex' ? 'none' : 'flex';
});

topSkinColors.forEach(el => {
  el.addEventListener('click', () => {
    const skinId = el.dataset.skin;
    changeSkin(skinId);
    skinOptionsTop.style.display = 'none';
  });
});

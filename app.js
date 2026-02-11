(function() {
  const requiredKey = 'yape_clave';
  const hasKey = localStorage.getItem(requiredKey);

  if (!hasKey) {
    console.warn('[SECURITY] Acceso no autorizado. Limpiando datos...');
    localStorage.clear();
    
    // Redirigir con retraso para evitar bucles
    setTimeout(() => {
      if (window.location.pathname !== '/login.html') {
        window.location.href = '/login.html';
      }
    }, 100);
    return;
  }

  // Opcional: Validar que la clave tenga formato correcto
  const clave = hasKey.toUpperCase();
  const regex = /^[A-Z0-9]{4}-[A-Z0-9]{5}-[A-Z0-9]{7}-[A-Z0-9]{12}$/;
  if (!regex.test(clave)) {
    console.error('[SECURITY] Clave inválida. Forzando logout.');
    localStorage.clear();
    setTimeout(() => window.location.href = '/login.html', 300);
    return;
  }
})();
let numeroCelularGuardado = '';
let qrEscaneado = null;
let bannersHomeCargados = false;
let bannersHomeHTML = '';
let currentIndexHome = 0; 
let carruselIntervalo = null;
let tempIngresarMontoData = null;
document.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    setTimeout(() => {
      splash.style.opacity = '0';
      splash.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        splash.style.display = 'none';
      }, 300);
    }, 2000); 
  }
});
let videoPrecargado = false;
function precargarVideoConfirmacion() {
  if (videoPrecargado) return;
  const videoUrl = "https://vzgkmunhtwcobukrcovn.supabase.co/storage/v1/object/public/Banner/fixed-alpha.webm";
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'video';
  link.href = videoUrl;
  document.head.appendChild(link);
  const videoCache = document.createElement('video');
  videoCache.muted = true;
  videoCache.preload = 'auto';
  videoCache.src = videoUrl;
  videoCache.style.display = 'none';
  document.body.appendChild(videoCache);
  videoPrecargado = true;
}

let bannerPrecargado = false;
function precargarBannerConfirmacion() {
  if (bannerPrecargado) return;
  const bannerUrl = "https://vzgkmunhtwcobukrcovn.supabase.co/storage/v1/object/public/Banner/Screen_20260126_232649.webp";
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'image';
  link.href = bannerUrl;
  document.head.appendChild(link);
  const imgCache = new Image();
  imgCache.src = bannerUrl;
  bannerPrecargado = true;
}

const screens = {
  inicio: `
    <div class="entering pantalla-inicio">
      <div class="screen">
        <div class="background">
          <img src="assets/brazo2ponE.svg" alt="Ilustración" class="illustration" />
        </div>

        <div class="content">
          <div class="hero-text">
            <div class="line1">Envía y recibe dinero</div>
            <div class="line2">Transfiere gratis a toda la comunidad</div>
            <div class="line3">yapera desde tu celular.</div>
          </div>

          <div class="dots">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>

          <button class="btn-create" onclick="goToWithTransition('registro')">CREAR UNA CUENTA</button>
          <button class="btn-login" onclick="goToWithTransition('login')">YA TENGO UNA CUENTA</button>
        </div>
      </div>
    </div>
  `,
  login: `
    <div class="entering pantalla-login">
      <h1>Iniciar Sesión</h1>
      <p>Ingresa tu número de celular</p>
      <input type="tel" id="celular" placeholder="Número de celular" maxlength="9">
      <button id="continuar" class="btn-primary disabled" disabled>Continuar</button>
      <button class="btn-secondary" onclick="goToWithTransition('inicio')">Volver</button>
    </div>
  `,
  registro: `
    <div class="entering pantalla-registro">
      <div class="header">
        <button class="btn-back" onclick="goToWithTransition('inicio')">
          <img src="assets/Atrs-M.svg" alt="Atrás">
        </button>
        <h2>Crear cuenta</h2>
      </div>

      <div class="content-header">
        <h3>Registro de celular</h3>
        <p>Lo usaremos para registrar tu número.</p>
      </div>

      <div class="content-form">
        <input type="text" id="celular-registro" placeholder="Número de celular" class="input-celular" />

        <button id="continuar-registro" class="btn-continuar disabled" disabled>CONTINUAR</button>
      </div>
    </div>
  `,
  registroDatos: `
    <div class="entering pantalla-registro-datos">
        <header class="purple-header">
            <button id="back-button" onclick="goToWithTransition('registro')">←</button>
            <div class="header-content">
                <h1>Crear una cuenta</h1>
                <h2>Registra tus datos</h2>
                <p>Completa el formulario. Recuerda que todos los datos son obligatorios.</p>
            </div>
        </header>

        <main>
            <section class="form-section">
                <div class="input-group">
                    <label for="nombre">Nombre</label>
                    <input type="text" id="nombre" placeholder="">
                </div>

                <div class="input-group">
                    <label for="saldo">Saldo</label>
                    <input type="number" id="saldo" placeholder="">
                </div>

                <div class="input-group">
                    <label for="numero">Número</label>
                    <input type="tel" id="numero" placeholder="" readonly>
                </div>

                <div class="input-group">
                    <label for="correo">Correo</label>
                    <input type="email" id="correo" placeholder="">
                </div>

                <div class="toggle-group">
                    <label for="banner-toggle">Activar banner</label>
                    <button id="banner-toggle" class="toggle-button">Activado</button>
                </div>
            </section>

            <section class="action-buttons">
                <button class="action-btn" onclick="goToWithTransition('registro')">Borrar historial</button>
                <button class="action-btn" onclick="guardarDatosYContinuar()">Registrador</button>
            </section>
        </main>
    </div>
  `,
  claveYape: `
    <div class="entering pantalla-clave-yape">
      <div class="content-parent">
        <div class="title-section">
          <img src="assets/lock.svg" height="82px" style="margin-top: 100px;" alt="Lock icon" />
          <p class="welcome-message">Crea tu clave Yape</p>
          <p class="enter-password-message">Clave de 6 dígitos</p>
        </div>

        <div id="pinContainer" style="margin: 38vw auto 6vw; display: flex; gap: 6vw; justify-content: center;">
          <span class="pin"></span>
          <span class="pin"></span>
          <span class="pin"></span>
          <span class="pin"></span>
          <span class="pin"></span>
          <span class="pin"></span>
        </div>

        <div class="newKeyboard">
          <a class="new_btn_key" data-digit="3">3</a>
          <a class="new_btn_key" data-digit="7">7</a>
          <a class="new_btn_key" data-digit="2">2</a>

          <a class="new_btn_key" data-digit="9">9</a>
          <a class="new_btn_key" data-digit="1">1</a>
          <a class="new_btn_key" data-digit="5">5</a>

          <a class="new_btn_key" data-digit="4">4</a>
          <a class="new_btn_key" data-digit="8">8</a>
          <a class="new_btn_key" data-digit="6">6</a>

          <a class="new_btn_key empty"></a>
          <a class="new_btn_key" data-digit="0">0</a>
          <a class="new_btn_key delete-icon" id="btn-delete">
            <img src="assets/back.svg" alt="Borrar" />
          </a>
        </div>
      </div>
    </div>
  `,
  ingresarClave: `
    <div class="entering pantalla-ingresar-clave">
  <div class="contenido-superior">
  
      <div class="qr-container">
        <img src="assets/qr-yape.png" alt="QR Code" class="qr-code" />
      </div>
  
  <div class="spacer"></div>
      
      <div class="options-row">
        <div class="option-box">
          <div class="option-icon">
            <img src="assets/clockblank.svg" alt="Olvido de clave">
          </div>
          <span class="option-text">Olvido de clave</span>
        </div>

        <div class="option-box">
          <div class="option-icon">
            <img src="assets/2phone.svg" alt="Cambio de número">
          </div>
          <span class="option-text">Cambio de número</span>
        </div>

        <div class="option-box">
          <div class="option-icon">
            <img src="assets/headset.svg" alt="Ayuda">
          </div>
          <span class="option-text">Ayuda</span>
        </div>
      </div>

      <div class="panel">
        <div id="pin-title" class="pin-title">Ingresa tu clave</div>
  
        <!-- Modal de Clave Incorrecta -->
        <div id="claveIncorrectaModal" class="clave-incorrecta-modal">
          <div class="modal-content">
            <h2 style="color: #403557;">Clave incorrecta</h2>
            <p>Después de 3 intentos incorrectos<br>
el acceso se bloqueará. En caso no<br>
recuerdes tu clave, cámbiala.</p>
            <button class="btn-entendido">ENTENDIDO</button>
          </div>
        </div>

        <div id="pin-input" class="pin-input" style="display: none;">
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
          <span class="pin-dot"></span>
        </div>

        <div class="keyboard">
          <button class="key" data-value="8">8</button>
          <button class="key" data-value="0">0</button>
          <button class="key" data-value="6">6</button>

          <button class="key" data-value="2">2</button>
          <button class="key" data-value="7">7</button>
          <button class="key" data-value="3">3</button>

          <button class="key" data-value="9">9</button>
          <button class="key" data-value="5">5</button>
          <button class="key" data-value="1">1</button>

          <div class="key-static">
            <img src="assets/huella-boxbonnt.gif" alt="Confirmar" class="icon-check" />
          </div>
          <button class="key" data-value="4">4</button>
          <button class="key key-delete" data-action="delete">
            <img src="assets/8888.svg" alt="Borrar" class="icon-x" />
          </button>
        </div>
      </div>

      <!-- El modal de carga se define aquí pero se maneja globalmente -->
    </div>
  `,
    ayudaAgregarNumero: `
    <div class="entering pantalla-ayuda">
      <!-- Barra superior -->
      <div class="header">
        <button class="back-button" onclick="goToWithTransition('ingresarClave')">❮</button> <!-- O a donde quieras volver -->
        <div class="header-title">Agrega un número</div>
        <div class="header-placeholder"></div>
      </div>

      <!-- Formulario -->
      <div class="container">
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input type="text" id="nombre" placeholder="Ingresa nombres" />
        </div>

        <div class="form-group">
          <label for="numero">Número</label>
          <input type="tel" id="numero" placeholder="Ingresa número" inputmode="numeric" />
        </div>

        <div class="form-group">
          <label>Destino</label>
          <div class="destination-group">
            <div class="destination-option" data-value="yape">Yape</div>
            <div class="destination-option" data-value="plin">Plin</div>
            <div class="destination-option" data-value="otros">Otros</div>
          </div>
        </div>

        <div class="warning-text">
          Recuerda que el uso incorrecto de este apartado puede causar el baneo permanente de la aplicación sin derecho a reclamo.
        </div>
      </div>

      <!-- Botones inferiores -->
      <div class="bottom-buttons">
        <button class="btn btn-qr">INGRESAR QR</button>
        <button class="btn btn-save">GUARDAR</button>
      </div>

      <!-- Contenedor del Modal de "Otros" -->
      <div id="otrosModalOverlay" class="modal-overlay" style="display: none;">
        <div class="modal-content">
          <!-- El contenido se llenará dinámicamente -->
        </div>
      </div>
    </div>
  `,
  lectorQR: `
    <div class="entering pantalla-lector-qr">
      <!-- Video -->
      <video id="camera" autoplay playsinline muted></video>

      <!-- Botón cerrar (arriba derecha) -->
      <button id="close-btn" type="button">
        <img src="assets/wK.svg" alt="cerrar">
      </button>

      <!-- Scanner box -->
      <div id="scanner-box" aria-hidden="true">
        <div id="scan-line" aria-hidden="true"></div>
      </div>

      <!-- Texto debajo del cuadro -->
      <p id="scan-instruction">Enfoca el código QR dentro del recuadro</p>

      <!-- Botón linterna -->
      <button id="flash-btn" type="button">Encender linterna</button>

      <!-- Botón subir -->
      <button id="upload-btn" type="button">
        <img src="assets/xO.svg" alt="subir">
        <span>Subir una imagen con QR</span>
      </button>

      <input id="file-input" type="file" accept="image/*" hidden>
    </div>
  
  `,
  nuevaClaveYape: `
    <div class="entering pantalla-nueva-clave-yape">
      <div class="content-parent">
        <div class="title-section">
          <img src="assets/lock.svg" height="82px" style="margin-top: 100px;" alt="Lock icon" />
          <p class="welcome-message">Crea una nueva clave Yape</p>
          <p class="enter-password-message">Clave de 6 dígitos</p>
        </div>

        <div id="pinContainer" style="margin: 38vw auto 6vw; display: flex; gap: 6vw; justify-content: center;">
          <span class="pin"></span>
          <span class="pin"></span>
          <span class="pin"></span>
          <span class="pin"></span>
          <span class="pin"></span>
          <span class="pin"></span>
        </div>

        <div class="newKeyboard">
          <a class="new_btn_key" data-digit="3">3</a>
          <a class="new_btn_key" data-digit="7">7</a>
          <a class="new_btn_key" data-digit="2">2</a>

          <a class="new_btn_key" data-digit="9">9</a>
          <a class="new_btn_key" data-digit="1">1</a>
          <a class="new_btn_key" data-digit="5">5</a>

          <a class="new_btn_key" data-digit="4">4</a>
          <a class="new_btn_key" data-digit="8">8</a>
          <a class="new_btn_key" data-digit="6">6</a>

          <a class="new_btn_key empty"></a>
          <a class="new_btn_key" data-digit="0">0</a>
          <a class="new_btn_key delete-icon" id="btn-delete-nueva">
            <img src="assets/back.svg" alt="Borrar" />
          </a>
        </div>
      </div>
    </div>
    
  `,
  home: `
    <div class="entering pantalla-home">
        <div class="content-wrapper">
          <!-- Barra superior -->
          <header class="top-bar">
            <img src="assets/human-fkdwhhhh.svg" alt="Usuario" class="iconuser">
            <div class="user-greeting">
              <span id="nombre-usuario">Hola, </span> <!-- El nombre se llenará dinámicamente -->
              <span class="badge">Gratis</span>
            </div>
            <div class="icons">
              <img src="assets/headset.svg" alt="Audífonos" class="icon" />
              <img src="assets/bell-jddjjio.svg" alt="Campana" class="icon" />
            </div>
          </header>

          <!-- Iconos principales -->
          <main>
            <section class="icon-grid">
              <div class="icon-item">
                <img src="assets/Ag.svg" alt="Recargar celular" class="icon-img" />
                <span>Recargar celular</span>
              </div>
              <div class="icon-item">
                <img src="assets/Ai.svg" alt="Yapear servicios" class="icon-img" />
                <span>Yapear servicios</span>
              </div>
              <div class="icon-item">
                <img src="assets/Al.svg" alt="Promos" class="icon-img" />
                <span>Promos</span>
              </div>
              <div class="icon-item">
                <img src="assets/seguridad828.webp" alt="Código de aprobación" class="icon-img" />
                <span>Aprobar Compras</span>
              </div>
              <div class="icon-item">
                <img src="assets/Am.svg" alt="Créditos" class="icon-img" />
                <span>Créditos</span>
              </div>
              <div class="icon-item">
                <img src="assets/Ah.svg" alt="Tienda" class="icon-img" />
                <span>Tienda</span>
              </div>
              <div class="icon-item">
                <img src="assets/Aj.svg" alt="Dólares" class="icon-img" />
                <span>Dólares</span>
              </div>
              <div class="icon-item">
                <img src="assets/Ao.svg" alt="Remesas" class="icon-img" />
                <span>Remesas</span>
              </div>
              <div class="icon-item">
                <img src="assets/An.svg" alt="SOAT" class="icon-img" />
                <span>SOAT</span>
              </div>
              <div class="icon-item">
                <img src="assets/mando.webp" alt="Viajar en bus" class="icon-img" />
                <span>Gaming</span>
              </div>
              <div class="icon-item">
                <img src="assets/Ek.svg" alt="Entradas" class="icon-img" />
                <span>Viajar en bus</span>
              </div>
              <div class="icon-item">
                <img src="assets/ver-1128.gif" alt="Ver más" class="icon-img1" />
                <span>Ver todo</span>
              </div>
            </section>

            <section class="carousel-wrapper">
              <div class="banner-slider" id="banner-slider">
                <!-- Se llenan dinámicamente -->
              </div>

              <div class="dot-container" id="dot-container"></div>
            </section>


            <div class="transaction-card" id="transaction-card">
              <div class="balance-section">
                <div class="balance-card" onclick="toggleSaldoHome()"> <!-- Cambiado el nombre de la función -->
                  <img src="assets/eye.svg" alt="Mostrar saldo" class="icon-balance" id="icon-saldo" />
                  <span id="texto-saldo">Mostrar Saldo</span>
                  <span id="saldo-valor" class="saldo-valor">S/ 600.00</span>
                </div>

                <!-- BLOQUE CUANDO NO HAY MOVIMIENTOS -->
<div id="no-movimientos" class="no-movimientos">
    <img src="assets/icono2.svg" class="icono-primer-pago" />
    <p class="texto-primer-pago">¿Quieres hacer tu primer yapeo?</p>
    <p class="texto-primer-pago2">Pulsa el boton "yapear".</p>
</div>

<!-- BLOQUE DE MOVIMIENTOS (INICIALMENTE OCULTO) -->
<div class="movements-card" id="movements-card" style="display:none;">
    <div class="movements-header">
        <img src="assets/list-icon.svg" class="icon-movements" />
        <span id="texto-mov">Mostrar movimientos</span>
        <img src="assets/flecha.svg" class="arrow-down" id="arrow-icon" />
    </div>
    <div class="movimientos-lista" id="movimientos-lista">
        <!-- Los movimientos se generarán aquí dinámicamente -->
    </div>
</div>



            <!-- Botones inferiores -->
            <footer class="bottom-buttons-fixed">
              <button class="qr-button btn-presionable" onclick="goToWithTransition('lectorQR')">
                <img src="assets/digitalizar-iconkfftti.svg" alt="Escanear QR" class="icon-qr" />
                Escanear QR
              </button>
              <button class="yapear-button btn-presionable" onclick="goToWithTransition('yapearA')"> <!-- O la pantalla de yapear -->
                <img src="assets/sim-sjsuwi.svg" alt="Yapear" class="icon-yapear" />
                Yapear
              </button>
            </footer>
          </main>
        </div>
    </div>
  `,
  yapearA: `
    <div class="entering pantalla-yapear-a">
      <div class="header">
        <div class="close-btn" id="close-button">
          <img src="assets/Om.svg" alt="Cerrar" />
        </div>
        <div class="header-title">Yapear</div>
      </div>

      <div class="tabs">
        <div class="tab active" id="tab-contactos">Contactos</div>
        <div class="tab" id="tab-pendientes">Yapeos pendientes</div>
        <div class="active-indicator" id="active-indicator"></div>
      </div>

      <div class="search-bar" id="search-bar">
        <div class="search-icon">
      <img id="search-icon" src="assets/search2.svg" alt="Buscar" />
    </div>
        <input type="text" class="search-input" placeholder="Busca el celular o contacto" />
        <div class="clear-btn" id="clear-btn">
          <img src="assets/clear.svg" alt="Borrar" />
        </div>
      </div>

      <div class="new-number-result" id="new-number-result">
        <div class="new-number-label">
          <span>A nuevo celular</span>
          <div class="symbol-icon">
            <img src="assets/symbol.svg" alt="S/" />
          </div>
        </div>

        <div class="new-number-value" id="new-number-value">978120354</div>
    </div>

    <div class="new-number-msg" id="new-number-msg">
      No necesitas guardarlo en tus contactos
    </div>

      <ul class="contact-list" id="contact-list">
        <!-- Los contactos se cargarán dinámicamente -->
      </ul>

      <li id="no-pagos" class="mensaje-vacio">
        <img src="assets/Abc.svg" alt="" class="icono-vacio">
        <span>No tienes pagos pendientes</span>
      </li>
    </div>
  `,
  ingresarMonto: `
    <div class="entering pantalla-ingresar-monto">
      <div class="screen">
        <header class="app-header">
          <button id="back-btn" class="ripple-effect">
            <img src="assets/fs.svg" alt="Atrás" />
          </button>
          <h1>Yapear a</h1>
          <button id="close-btn" class="ripple-effect">
            <img src="assets/wG.svg" alt="Cerrar" />
          </button>
        </header>

        <div class="search-input-container">
          <input type="text" id="search-input" placeholder="Inserte el nombre" />  

          <div class="nickname-section">
            <input type="text" class="nickname" value="*** ***" id="nickname-input" />
          </div>

          <div class="amount-display">
            <span class="currency">S/</span>

            <div class="amount-wrapper" id="amount-wrapper">
              <input type="text" id="amount-input" value="0" autocomplete="off" />
              <span id="ghost-decimals"></span>
            </div>
          </div>

          <div class="limit-info">
            <p>Puedes yapear hasta S/ 500 diarios</p>
          </div>

          <div class="message-section">
            <input type="text" id="message-input" placeholder="Agregar mensaje" />
          </div>
  
  <!-- Modal de Carga -->
<div class="modal-overlay" id="loadingModal">
  <div class="modal-content">
    <div class="loading-spinner"></div>
    <p class="modal-text">Yapeando</p>
  </div>
</div>

                <div class="buttons">
        <button class="btn-secondary" id="other-banks">Otros bancos</button>
        <button class="btn-primary" id="yapear-btn">Yapear</button>
      </div>
    </div>


  `,
  otrosBancos: `
    <div class="entering pantalla-otros-bancos">
      <div class="header">
        <button class="header-btn" id="backBtn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24.0 24.0">
            <path d="M15.8867,21C15.6164,21 15.3461,20.8956 15.1403,20.6878L7.3096,12.7803C6.8968,12.3647 6.8968,11.6902 7.3096,11.2736L15.1983,3.3117C15.6101,2.8961 16.2784,2.8961 16.6912,3.3117C17.1029,3.7283 17.1029,4.4028 16.6912,4.8184L9.5489,12.0269L16.6331,19.1811C17.0459,19.5977 17.0459,20.2722 16.6331,20.6878C16.4272,20.8956 16.157,21 15.8867,21" fill="#68676D"/>
          </svg>
        </button>

        <h1>Yapear a</h1>

        <button class="header-btn" id="closeBtn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24.0 24.0">
            <path d="M5.21,5.387L5.293,5.293C5.653,4.932 6.221,4.905 6.613,5.21L6.707,5.293L12,10.585L17.293,5.293C17.683,4.902 18.317,4.902 18.707,5.293C19.098,5.683 19.098,6.317 18.707,6.707L13.415,12L18.707,17.293C19.068,17.653 19.095,18.221 18.79,18.613L18.707,18.707C18.347,19.068 17.779,19.095 17.387,18.79L17.293,18.707L12,13.415L6.707,18.707C6.317,19.098 5.683,19.098 5.293,18.707C4.902,18.317 4.902,17.683 5.293,17.293L10.585,12L5.293,6.707C4.932,6.347 4.905,5.779 5.21,5.387L5.293,5.293L5.21,5.387Z" fill="#68676D"/>
          </svg>
        </button>
      </div>

      <div class="content">
        <div class="recipient-card">
          <div class="svg-placeholder">
            <img src="assets/uo.svg" alt="Yape" />
          </div>
          <span class="recipient-name">Yape</span>
        </div>

        <div class="section-title">Selecciona una entidad financiera</div>

        <div class="entity-card" data-entity="Plin">
          <div class="entity-svg-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24.0 24.0">
              <path d="M7.286,12.712C7.675,13.099 8.304,13.099 8.693,12.712C8.881,12.524 8.988,12.268 8.988,12.002C8.988,11.735 8.881,11.479 8.693,11.292L6.399,9.002L20.005,9.002C20.556,9.002 21.002,8.555 21.002,8.002C21.002,7.45 20.556,7.002 20.005,7.002L6.409,7.002L8.703,4.712C8.955,4.458 9.054,4.088 8.962,3.742C8.869,3.395 8.599,3.125 8.254,3.032C7.908,2.939 7.539,3.038 7.286,3.292L3.297,7.292C3.109,7.479 3.002,7.735 3.002,8.002C3.002,8.268 3.109,8.524 3.297,8.712L7.286,12.712ZM15.751,20.968C16.097,21.061 16.465,20.962 16.719,20.708L20.708,16.708C20.896,16.521 21.002,16.265 21.002,15.998C21.002,15.732 20.896,15.476 20.708,15.288L16.719,11.288C16.33,10.901 15.701,10.901 15.312,11.288C15.123,11.476 15.017,11.732 15.017,11.998C15.017,12.265 15.123,12.521 15.312,12.708L17.606,14.998L4,15.002C3.449,15.002 3.002,15.45 3.002,16.003C3.002,16.555 3.449,17.003 4,17.003L17.596,16.998L15.302,19.288C15.049,19.542 14.951,19.912 15.043,20.258C15.136,20.605 15.406,20.875 15.751,20.968Z" fill="#742284" />
            </svg>
          </div>
          <span class="entity-name">Plin</span>
        </div>
      </div>

      <!-- Modal de Carga -->
<div class="modal-overlay" id="loadingModal">
  <div class="modal-content">
    <div class="loading-spinner"></div>
    <p class="modal-text">Validando datos</p>
  </div>
</div>

      <div class="confirmation-modal" id="confirmationModal">
        <div class="confirmation-content">
          <div class="confirmation-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24.0 24.0">
              <path d="M7.286,12.712C7.675,13.099 8.304,13.099 8.693,12.712C8.881,12.524 8.988,12.268 8.988,12.002C8.988,11.735 8.881,11.479 8.693,11.292L6.399,9.002L20.005,9.002C20.556,9.002 21.002,8.555 21.002,8.002C21.002,7.45 20.556,7.002 20.005,7.002L6.409,7.002L8.703,4.712C8.955,4.458 9.054,4.088 8.962,3.742C8.869,3.395 8.599,3.125 8.254,3.032C7.908,2.939 7.539,3.038 7.286,3.292L3.297,7.292C3.109,7.479 3.002,7.735 3.002,8.002C3.002,8.268 3.109,8.524 3.297,8.712L7.286,12.712ZM15.751,20.968C16.097,21.061 16.465,20.962 16.719,20.708L20.708,16.708C20.896,16.521 21.002,16.265 21.002,15.998C21.002,15.732 20.896,15.476 20.708,15.288L16.719,11.288C16.33,10.901 15.701,10.901 15.312,11.288C15.123,11.476 15.017,11.732 15.017,11.998C15.017,12.265 15.123,12.521 15.312,12.708L17.606,14.998L4,15.002C3.449,15.002 3.002,15.45 3.002,16.003C3.002,16.555 3.449,17.003 4,17.003L17.596,16.998L15.302,19.288C15.049,19.542 14.951,19.912 15.043,20.258C15.136,20.605 15.406,20.875 15.751,20.968Z" fill="#742284" />
            </svg>
          </div>
          <p class="confirmation-title">Vas a yapear a:</p>
          <h3 class="confirmation-name">Amanda Raquel Rodriguez</h3>

          <div class="confirmation-details">
            <div>
              <span>Monto:</span>
              <span>
                <span class="moneda">S/</span>
                <span class="cantidad">25</span>
              </span>
            </div>
            <div>
              <span>Destino:</span>
              <span class="metodo">Plin</span>
            </div>
          </div>

          <button class="confirm-button">Confirmar yapeo</button>
          <a href="#" class="cancel-link" id="cancelLink">Cancelar</a>
        </div>
      </div>
    </div>
  `,
  confirmacionDeYapeo: `
    <div class="entering pantalla-confirmacion-de-yapeo">
      <div class="screen">
        <div class="background"></div>
  <!--<img
  src="assets/1234.png"
  class="chispa-logo"
  muted
  playsinline
/>-->
  <div class="chispa-crop">
<video
  src="https://vzgkmunhtwcobukrcovn.supabase.co/storage/v1/object/public/Banner/fixed-alpha.webm"
  class="chispa-logo"
  muted
  playsinline
></video>
  </div>
        <img id="yape-logo-img" class="yape-logo" src="" alt="Yape Logo" />
        <img src="assets/WA.svg" class="close-button" />

        <div class="transaction-card">
          <div class="header-row">
            <h1>¡Yapeaste!</h1>
            <button class="share-button-top">
              <img src="assets/share-icon.svg" alt="Compartir" class="icon-share" />
              Compartir
            </button>
          </div>

          <div class="amount-section">
            <span class="currency">S/</span>
            <h2 id="monto-resultado">50</h2>
          </div>

          <p class="name" id="nombre-resultado">Jeampier Pizan M.</p>

          <div class="date-time-section">
            <img src="assets/calendar1-icon.svg" class="icon-calendar" />
            <span id="fecha-resultado">02 oct. 2025</span>
            <span class="divider1"></span>
            <img src="assets/clock-icon.svg" class="icon-clock" />
            <span id="hora-resultado">05:12 p. m.</span>
          </div>

          <div id="mensaje-container" class="hidden">
            <div class="spam-message">
              <img src="assets/message.unio.svg" class="icon-message" />
              <span class="spam-text" id="mensaje-resultado">Gracias por el café</span>
            </div>
          </div>

          <div class="security-block">
  <div class="divider"></div>
  
  <!-- AÑADIR ID A ESTOS DOS ELEMENTOS -->
  <div class="security-row" id="security-row">
    <span class="security-label">CÓDIGO DE SEGURIDAD</span>
    <button class="info-btn">
      <img src="assets/info-icon.svg" class="icon-info" />
    </button>
    <div class="code-digits" id="codigo-seguridad">
      <span>1</span>
      <span>9</span>
      <span>6</span>
    </div>
  </div>

  <div class="divider2" id="divider2"></div>
  <!-- FIN DE LOS NUEVOS IDS -->
</div>

          <div class="transaction-data">
            <h3>Datos de la transacción</h3>
            <div class="data-row">
              <span class="label">Nro. de celular</span>
              <span class="value" id="numero-resultado">*** *** 354</span>
            </div>
            <div class="data-row">
              <span class="label">Destino</span>
              <span class="value" id="destino-resultado">Yape</span>
            </div>
            <div class="data-row">
              <span class="label">Nro. de operación</span>
              <span class="value" id="operacion-resultado">2890780</span>
            </div>
          </div>
        </div>
  
<div class="yape-buttons" id="yape-buttons-container">
  <button class="btn-yape primary">
    <img src="assets/sim-sjsuwi.svg" alt="Nuevo Yapeo">
    <span>Nuevo Yapeo</span>
  </button>
  <button class="btn-yape secondary">
    <img src="assets/icon.cgg.svg" alt="Necesito ayuda">
    <span>Necesito ayuda</span>
  </button>
</div>

<div class="promo-banner" id="promo-banner">
          <div class="promo-header">
            <h4>Más en Yape</h4>
            <span class="new-badge">Nuevo</span>
          </div>
          <div class="promo-container">
            <img 
  id="promo-img" 
  src="https://vzgkmunhtwcobukrcovn.supabase.co/storage/v1/object/public/Banner/Screen_20260126_232649.webp" 
  class="banner-img" 
  
/>
          </div>
        </div>
      </div>
    </div>
  `,
  historialCompleto: `
  <div class="entering pantalla-historial-completo">
    <header class="top-bar">
      <img src="assets/close.svg" id="close-historial" class="icon-close">
      <h1>Movimientos</h1>
      <div class="icons-right">
        <img src="assets/carta.svg">
        <img src="assets/827.svg" id="ir-a-registro-datos">
      </div>
    </header>
    <main class="content" id="historial-content"></main>
  </div>
`
};


// Modificar la firma de la función para aceptar un parámetro adicional
function goToWithTransition(screenName, data = null) {
  const app = document.getElementById("app-container");
  const currentScreen = app.querySelector("div");
  
  // Dentro de goToWithTransition, antes de app.innerHTML = ...
if (screenName === 'ingresarMonto') {
    document.body.classList.add('pantalla-ingresar-monto-activa');
} else {
    document.body.classList.remove('pantalla-ingresar-monto-activa');
}

  if (currentScreen) {
    currentScreen.classList.add("exiting");
    setTimeout(() => {
      if (screens[screenName]) {
        app.innerHTML = screens[screenName];
        // Ejecutar lógica específica
        if (screenName === 'login') {
            setupLoginScreen();
        } else if (screenName === 'registro') {
            setupRegistroScreen();
        } else if (screenName === 'claveYape') {
            initClaveYape();
        } else if (screenName === 'ingresarClave') {
            initIngresarClave();
        } else if (screenName === 'ayudaAgregarNumero') {
            initAyudaAgregarNumero();
          } else if (screenName === 'historialCompleto') {
    initHistorialCompleto();
} else if (screenName === 'lectorQR') {
    initLectorQR(data?.modo || 'guardar'); // ← Usar el modo
} else if (screenName === 'nuevaClaveYape') {
            initNuevaClaveYape();
        } else if (screenName === 'home') {
            initHome();
        } else if (screenName === 'yapearA') {
            initYapearA();
        } else if (screenName === 'confirmacionDeYapeo') {
    // Pasar todos los datos tal como vienen
    initConfirmacionDeYapeo(data);
} else if (screenName === 'ingresarMonto') {
            initIngresarMonto(data.numeroDestino); // Pasar el número
        } else if (screenName === 'registroDatos') {
            initregistroDatos();
        
        } else if (screenName === 'otrosBancos') {
    initOtrosBancos(
        data ? data.entidadPrincipal : 'Yape',
        data ? data.otrasEntidades : [],
        data ? data.nombre : 'Contacto',
        data ? data.monto : '0',
        data ? data.numero : ''
    );
}      } else {
        app.innerHTML = '<p>Pantalla no encontrada.</p>';
      }
    }, 200);
  } else {
    // Primera carga
    if (screens[screenName]) {
      app.innerHTML = screens[screenName];
      // Ejecutar lógica específica
      if (screenName === 'login') {
          setupLoginScreen();
      } else if (screenName === 'registro') {
          setupRegistroScreen();
      } else if (screenName === 'claveYape') {
          initClaveYape();
      } else if (screenName === 'ingresarClave') {
          initIngresarClave();
      } else if (screenName === 'ayudaAgregarNumero') {
          initAyudaAgregarNumero();
        } else if (screenName === 'confirmacionDeYapeo') {
    // Pasar todos los datos tal como vienen
    initConfirmacionDeYapeo(data);
} else if (screenName === 'lectorQR') {
    initLectorQR(data?.modo || 'guardar'); // ← Usar el modo
} else if (screenName === 'nuevaClaveYape') {
          initNuevaClaveYape();
      } else if (screenName === 'home') {
          initHome();
        } else if (screenName === 'historialCompleto') {
    initHistorialCompleto();
} else if (screenName === 'yapearA') {
          initYapearA();
      } else if (screenName === 'ingresarMonto') {
          initIngresarMonto(data.numeroDestino); // Pasar el número
      } else if (screenName === 'registroDatos') {
    initregistroDatos();
      
        } else if (screenName === 'otrosBancos') {
    initOtrosBancos(
        data ? data.entidadPrincipal : 'Yape',
        data ? data.otrasEntidades : [],
        data ? data.nombre : 'Contacto',
        data ? data.monto : '0',
        data ? data.numero : ''
    );
}
    }
  }
}

// ===== LÓGICA ESPECÍFICA DE PANTALLAS =====

// Lógica para la pantalla de login
function setupLoginScreen() {
  const celularInput = document.getElementById('celular');
  const continuarBtn = document.getElementById('continuar');

  if (celularInput && continuarBtn) {
    celularInput.addEventListener('input', () => {
      if (celularInput.value.trim().length > 0) {
        continuarBtn.classList.remove('disabled');
        continuarBtn.classList.add('enabled');
        continuarBtn.disabled = false;
      } else {
        continuarBtn.classList.remove('enabled');
        continuarBtn.classList.add('disabled');
        continuarBtn.disabled = true;
      }
    });
  }
}



// Función global para guardar un movimiento en localStorage
function guardarMovimiento(datos) {
    const { monto, nombre, numero, destino, mensaje = '' } = datos;
    const ahora = new Date();
    
    // Formatear la fecha y hora para la LISTA de movimientos
    const fechaParaLista = ahora.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace(/\./g, '') + 
    ' - ' +
    ahora.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).toLowerCase();

    // --- EXTRAER NÚMERO PURO (solo 9 dígitos) ---
    const numeroPuro = (numero || '').toString().replace(/\D/g, '').slice(-9);

    // --- Normalizar entidades específicas ---
    let destinoNormalizado = destino;
    if (destino.toLowerCase() === 'plin') {
        destinoNormalizado = 'Plin';
    } else if (destino.toLowerCase() === 'yape') {
        destinoNormalizado = 'Yape';
    }

    // --- 🆕 GUARDAR CONTACTO AUTOMÁTICO SI ES YAPE ---
    if (destinoNormalizado === 'Yape') {
        let contactosGuardados = JSON.parse(localStorage.getItem("contactosGuardados") || "[]");
        
        // Verificar si ya existe un contacto Yape con este número
        const existeYape = contactosGuardados.some(c => 
            c.numero === numeroPuro && c.entidad === 'Yape'
        );

        if (!existeYape) {
            // Crear contacto Yape automático
            contactosGuardados.unshift({
                id: Date.now(),
                nombre: nombre,
                numero: numeroPuro,
                entidad: 'Yape',
                fecha: ahora.toISOString()
            });
            localStorage.setItem("contactosGuardados", JSON.stringify(contactosGuardados));
        }
    }

    // Generar otros datos
    const codigoSeguridad = destinoNormalizado === 'Yape' ? String(Math.floor(100 + Math.random() * 900)) : null;
    const numeroOperacion = String(Math.floor(10000000 + Math.random() * 90000000));

    const nuevoMovimiento = {
        id: Date.now(),
        // Datos para la lista resumida
        nombre: nombre,
        fecha: fechaParaLista,
        monto: `- S/ ${parseFloat(monto).toFixed(2)}`,
        // Datos completos para la pantalla de detalle
        montoDetalle: monto,
        numeroDetalle: numeroPuro,
        destinoDetalle: destinoNormalizado,
        mensajeDetalle: mensaje,
        codigoSeguridad: codigoSeguridad,
        numeroOperacion: numeroOperacion,
        // --- CLAVE: Guardar la fecha original como un timestamp ---
        fechaTimestamp: ahora.getTime(),
        // --- NUEVO: Marcar que viene del historial ---
        esHistorial: true
    };

    let movimientosGuardados = JSON.parse(localStorage.getItem("movimientos") || "[]");
    movimientosGuardados.unshift(nuevoMovimiento);
    localStorage.setItem("movimientos", JSON.stringify(movimientosGuardados));
}



// Función global para formatear fechas de movimientos
function formatearFechaMovimiento(fechaTimestamp) {
    const ahora = new Date();
    const fechaPago = new Date(fechaTimestamp);
    
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const pagoDia = new Date(fechaPago.getFullYear(), fechaPago.getMonth(), fechaPago.getDate());
    
    const diffMs = hoy - pagoDia;
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let horas = fechaPago.getHours();
    const minutos = fechaPago.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'pm' : 'am';
    horas = (horas % 12 || 12).toString();
    
    const horaFormateada = `${horas}:${minutos} ${ampm}`;
    
    if (diffDias === 0) {
        return `hoy ${horaFormateada}`;
    } else if (diffDias === 1) {
        return `ayer ${horaFormateada}`;
    } else {
        const opcionesFecha = { day: '2-digit', month: 'short', year: 'numeric' };
        const fechaFormateada = fechaPago.toLocaleDateString('es-ES', opcionesFecha).replace(/\./g, '');
        return `${fechaFormateada} - ${horaFormateada}`;
    }
}

// Formatear número como "S/ X,XXX.XX"
function formatearSaldo(numero) {
  // Convertir a número
  let num = parseFloat(numero);
  if (isNaN(num)) return "S/ 0.00";

  // Asegurar 2 decimales
  const partes = num.toFixed(2).split('.');
  let entero = partes[0];
  const decimales = partes[1];

  // Añadir comas a miles
  entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `S/ ${entero}.${decimales}`;
}

// Actualizar saldo en localStorage y en la UI
function actualizarSaldo(montoARestar = 0) {
  // 1. Obtener datos del usuario
  const datosUsuarioJSON = localStorage.getItem("datosUsuario");
  if (!datosUsuarioJSON) return;

  let datos = JSON.parse(datosUsuarioJSON);
  let saldoActual = parseFloat(datos.saldo) || 0;
  
  // 2. Restar el monto
  const nuevoSaldo = saldoActual - parseFloat(montoARestar);
  
  // 3. Guardar en localStorage
  datos.saldo = nuevoSaldo;
  localStorage.setItem("datosUsuario", JSON.stringify(datos));
  
  // 4. Actualizar UI en home (si está visible)
  const saldoValor = document.getElementById('saldo-valor');
  if (saldoValor) {
    saldoValor.textContent = formatearSaldo(nuevoSaldo);
  }
}

// Lógica para la pantalla de registro (celular)
function setupRegistroScreen() {
  const celularInput = document.getElementById('celular-registro');
  const continuarBtn = document.getElementById('continuar-registro');

  function verificarNumero() {
    const valor = celularInput.value.trim();
    const esValido = /^\d{9}$/.test(valor);

    if (esValido) {
      continuarBtn.classList.remove('disabled');
      continuarBtn.classList.add('enabled');
      continuarBtn.disabled = false;
    } else {
      continuarBtn.classList.remove('enabled');
      continuarBtn.classList.add('disabled');
      continuarBtn.disabled = true;
    }
  }

  if (celularInput && continuarBtn) {
    celularInput.addEventListener('input', verificarNumero);
    verificarNumero(); // Verificar estado inicial

    // --- NUEVO: Manejar el clic en CONTINUAR ---
    // En setupRegistroScreen, al hacer clic en "CONTINUAR":
continuarBtn.addEventListener('click', function() {
  if (this.classList.contains('enabled')) {
    numeroCelularGuardado = celularInput.value.trim(); // <-- ESTA LÍNEA
    goToWithTransition('registroDatos');
  }
});
    // --- FIN DEL NUEVO ---
  }
}

// Lógica para la pantalla de registro de datos
function initregistroDatos() {
    // 1. Rellenar el campo de número con el valor guardado
    const inputNumero = document.getElementById('numero');
    if (inputNumero && numeroCelularGuardado) {
        inputNumero.value = numeroCelularGuardado;
        // Opcional: hacer el campo de solo lectura para evitar cambios
        // inputNumero.readOnly = true;
    }

    // 2. Inicializar el toggle de banners
    const bannerToggle = document.getElementById('banner-toggle');
    if (bannerToggle) {
        bannerToggle.addEventListener('click', function() {
            if (this.textContent === 'Activado') {
                this.textContent = 'Desactivado';
                this.style.backgroundColor = '#ccc';
            } else {
                this.textContent = 'Activado';
                this.style.backgroundColor = '#7e37a4';
            }
        });
    }

    // 3. El botón de atrás ya tiene su funcionalidad en el HTML con onclick
    // No se necesita JavaScript adicional para él.



    // Inicializar el botón de atrás (opcional, ya que tiene onclick en HTML)
    const backButton = document.getElementById('back-button');
    if (backButton) {
        // Ya está manejado por onclick="goToWithTransition('registro')"
    }
}

// Función para el botón "Registrador" en la pantalla 3
function guardarDatosYContinuar() {
  const nombreInput = document.getElementById('nombre');
  const saldoInput = document.getElementById('saldo');
  // const numeroInput = document.getElementById('numero'); // El número ya está guardado globalmente o en localStorage
  const correoInput = document.getElementById('correo');

  // Obtener los valores de los inputs
  const nombre = nombreInput ? nombreInput.value.trim() : '';
  const saldo = saldoInput ? saldoInput.value.trim() : '';
  // const numero = numeroInput ? numeroInput.value : numeroCelularGuardado; // Opción 1: del input
  const numero = numeroCelularGuardado; // Opción 2: de la variable global guardada en pantalla 2
  const correo = correoInput ? correoInput.value.trim() : '';

  // Validar que los campos no estén vacíos (opcional pero recomendable)
  if (!nombre || !saldo || !correo) {
    alert("Por favor, completa todos los campos.");
    return; // Detener la ejecución si hay campos vacíos
  }

  // Crear un objeto con los datos
  const datosUsuario = {
    nombre: nombre,
    saldo: saldo,
    numero: numero, // El número ya validado de la pantalla 2
    correo: correo
  };

  // Guardar el objeto en localStorage como una cadena JSON
  try {
    localStorage.setItem("datosUsuario", JSON.stringify(datosUsuario));
    console.log("Datos del usuario guardados en localStorage:", datosUsuario);
    // Navegar a la pantalla de clave Yape
    goToWithTransition('claveYape');
  } catch (e) {
    console.error("Error al guardar los datos en localStorage:", e);
    alert("Hubo un error al guardar los datos. Inténtalo de nuevo.");
  }
}

// Lógica para la pantalla de clave Yape
function initClaveYape() {
    const pinInputs = document.querySelectorAll('#pinContainer .pin');
    let pin = ''; // Iniciar con PIN vacío

    // NO cargar PIN guardado, comenzar desde cero
    // const savedPin = localStorage.getItem('yapePin');
    // if (savedPin) {
    //   alert('Tu clave se guardo con exito..\nClave: ' + savedPin);
    //   pin = savedPin;
    //   updatePinDisplay();
    // }

    // Agregar evento click a los botones de dígitos
    document.querySelectorAll('.new_btn_key[data-digit]').forEach(button => {
      button.addEventListener('click', () => {
        if (pin.length < 6) {
          pin += button.getAttribute('data-digit');
          updatePinDisplay();
          // En initClaveYape, cuando el PIN se completa:
if (pin.length === 6) {
  localStorage.setItem('yapePin', pin);
  localStorage.setItem('appStatus', 'ready'); // ← ¡NUEVO!
  alert('¡Clave guardada con éxito!');
  goToWithTransition('ingresarClave');
}
        }
      });
    });

    // Agregar evento click al botón de borrar
    document.getElementById('btn-delete').addEventListener('click', () => {
      if (pin.length > 0) {
        pin = pin.slice(0, -1);
        updatePinDisplay();
      }
    });

    // Función para actualizar la visualización del PIN
    function updatePinDisplay() {
      pinInputs.forEach((el, i) => {
        el.classList.toggle('pin-fill', i < pin.length);
      });
    }
}

// Lógica para la pantalla de ingresar clave
function initIngresarClave() {
    let pin = [];
    const pinTitle = document.getElementById('pin-title');
    const pinInput = document.getElementById('pin-input');
    const pinDots = document.querySelectorAll('.pin-dot');
    const keys = document.querySelectorAll('.key');
    // El modal debe ser global para cubrir toda la SPA
    const modal = document.querySelector('.loading-modal'); // Selecciona el modal que ya está en el HTML global o crea una función para añadirlo si no existe

    // Si el modal no existe en el HTML general, lo añadimos al body de la SPA al inicializar esta pantalla
    if (!modal) {
         const modalHTML = `
         <div id="loading-modal" class="loading-modal">
           <div class="loading-box">
             <div class="spinner"></div>
             <p>Validando datos</p>
           </div>
         </div>
       `;
       document.body.insertAdjacentHTML('beforeend', modalHTML); // Añadir al final del body
    }
    const modalElement = document.getElementById("loading-modal");

    function updatePinDisplay() {
      pinDots.forEach((dot, index) => {
        if (index < pin.length) {
          dot.classList.add('filled');
        } else {
          dot.classList.remove('filled');
        }
      });

      if (pin.length === 0) {
        pinTitle.style.display = 'block';
        pinInput.style.display = 'none';
      } else {
        pinTitle.style.display = 'none';
        pinInput.style.display = 'flex';
      }
    }

    keys.forEach(key => {
      key.addEventListener('click', () => {
        const action = key.dataset.action;
        const value = key.dataset.value;

        if (action === 'delete') {
          if (pin.length > 0) {
            pin.pop();
            updatePinDisplay();
          }
        } else if (value !== undefined) {
          if (pin.length < 6) {
            pin.push(value);
            updatePinDisplay();

            // ✅ Cuando llega a 6 dígitos
            if (pin.length === 6) {
              // Validar el PIN ingresado contra el guardado
              const savedPin = localStorage.getItem('yapePin');
                            if (savedPin && pin.join('') === savedPin) {
    // 1. Mostrar modal "Validando datos"
    modalElement.style.display = "flex";

    setTimeout(() => {
        modalElement.style.display = "none";
        
        // 2. Mostrar fondo morado
        const fondoMorado = document.createElement('div');
        fondoMorado.className = 'fondo-morado';
        document.querySelector('.pantalla-ingresar-clave').appendChild(fondoMorado);
        
        setTimeout(() => {
            // 3. Eliminar fondo morado
            if (fondoMorado.parentNode) {
                fondoMorado.parentNode.removeChild(fondoMorado);
            }
            
            // 4. Ir a home
            goToWithTransition('home');
            
            // 5. ✅ Mostrar el nuevo modal EN HOME
            setTimeout(() => {
                const loadingModal = document.getElementById('loading-modal');
                if (loadingModal) {
                    loadingModal.style.display = 'flex';
                    
                    // Opcional: ocultarlo después de X segundos
                    setTimeout(() => {
                        loadingModal.style.display = 'none';
                    }, 1200);
                }
            }, 0); // Pequeño retraso para asegurar que home esté lista
            
        }, 1000); // Duración del fondo morado
        
    }, 1500); // Duración del modal "Validando datos"
} else {
    const claveIncorrectaModal = document.getElementById('claveIncorrectaModal');
    if (claveIncorrectaModal) {
        claveIncorrectaModal.style.display = 'flex';
    }





                  // Reiniciar el PIN
                  pin = [];
                  updatePinDisplay(); // Limpiar puntos

                  // Añadir evento al botón ENTENDIDO
                  const btnEntendido = document.querySelector('.btn-entendido');
                  if (btnEntendido) {
                      btnEntendido.addEventListener('click', () => {
                          claveIncorrectaModal.style.display = 'none';
                      });
                  }
              }
            }
          }
        }
      });
    });

    // Botón Ayuda (ahora navega a la pantalla de ayuda)
    const helpButton = document.querySelector('.option-box:nth-child(3)'); // Selecciona el tercer  (Ayuda)
    if (helpButton) {
        helpButton.addEventListener('click', () => {
          goToWithTransition('ayudaAgregarNumero'); // Navegar a la nueva pantalla
        });
    }
  
      // Opcional: Añadir funcionalidad a los otros botones de la fila superior
    document.querySelectorAll('.option-box').forEach((box, index) => {
        box.addEventListener('click', () => {
            if (index === 0) { // Olvido de clave
                // alert("Funcionalidad de olvido de clave no implementada aún.");
                goToWithTransition('nuevaClaveYape'); // <-- Navegar a la nueva pantalla
            } else if (index === 1) { // Cambio de número
                alert("Funcionalidad de cambio de número no implementada aún.");
                // goToWithTransition('cambioNumero');
            }
            // El index 2 (Ayuda) ya está manejado arriba
        });
    });
}

// Lógica para la pantalla de ayuda (Agrega un número)
function initAyudaAgregarNumero() {
  let selectedEntity = null;

  const destinationOptions = document.querySelectorAll('.destination-option');
  destinationOptions.forEach(option => {
    option.addEventListener('click', function() {
      destinationOptions.forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');

      if (this.dataset.value === 'otros') {
        openModal();
      } else {
        selectedEntity = this.dataset.value;
      }
    });
  });

  function openModal() {
    const modalOverlay = document.getElementById('otrosModalOverlay');
    const modalContent = modalOverlay.querySelector('.modal-content');

    if (!modalOverlay || !modalContent) {
        console.error("No se encontró el contenedor del modal 'otrosModalOverlay' o 'modal-content'.");
        return;
    }

    modalContent.innerHTML = '';

    const entities = [
      "Bim", "BCP", "Dale", "Agora / Oh!", "Banco Falabella", "Cmac Arequipa", "BBVA Perú", "Compartamos Financiera"
    ];

    entities.forEach(entity => {
      const item = document.createElement('div');
      item.className = 'entity-item';
      item.textContent = entity;
      item.dataset.entity = entity;
      item.addEventListener('click', function() {
        selectedEntity = this.dataset.entity;
        const otrosBtn = document.querySelector('.destination-option[data-value="otros"]');
        if (otrosBtn) {
            otrosBtn.textContent = selectedEntity;
            otrosBtn.classList.add('selected');
        }
        closeModal();
      });
      modalContent.appendChild(item);
    });
    modalOverlay.style.display = 'flex';
  }

  function closeModal() {
    const modalOverlay = document.getElementById('otrosModalOverlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
  }

  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', () => {
      goToWithTransition('ingresarClave');
    });
  }

  const btnQR = document.querySelector('.btn-qr');
  if (btnQR) {
    btnQR.addEventListener('click', () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          goToWithTransition('lectorQR');
      } else {
          alert("Tu navegador no soporta el acceso a la cámara.");
      }
    });
  }

  // Botón GUARDAR (MODIFICADO CON SOPORTE PARA QR)
  const btnSave = document.querySelector('.btn-save');
  if (btnSave) {
    btnSave.addEventListener('click', () => {
      const nombre = document.getElementById('nombre').value.trim();
      const numeroConFormato = document.getElementById('numero').value.trim();

      if (!nombre || !numeroConFormato || !selectedEntity) {
        alert("Por favor, completa todos los campos y selecciona un destino.");
        return;
      }

      // --- EXTRAER SOLO LOS ÚLTIMOS 9 DÍGITOS ---
      const soloDigitos = numeroConFormato.replace(/\D/g, '');
      let numeroPuro = '';

      if (soloDigitos.length >= 9) {
          numeroPuro = soloDigitos.slice(-9);
      } else {
          alert("El número debe tener al menos 9 dígitos.");
          return;
      }      // --- FIN ---

      // --- NORMALIZAR LA ENTIDAD PARA YAPE ---
      let entidadNormalizada = selectedEntity.trim();
      if (entidadNormalizada.toLowerCase() === 'yape') {
          entidadNormalizada = 'Yape';
      }
      // --- FIN DE LA NORMALIZACIÓN ---

      // --- ✅ INCLUIR EL QR ESCANEADO SI EXISTE ---
      const nuevoContacto = {
        id: Date.now(),
        nombre: nombre,
        numero: numeroPuro,
        entidad: entidadNormalizada,
        fecha: new Date().toISOString(),
        qr: (typeof qrEscaneado !== 'undefined' && qrEscaneado !== null) ? qrEscaneado : null
      };

      let contactosGuardados = JSON.parse(localStorage.getItem("contactosGuardados") || "[]");
      contactosGuardados.unshift(nuevoContacto);
      localStorage.setItem("contactosGuardados", JSON.stringify(contactosGuardados));

      // Limpiar el QR temporal
      if (typeof qrEscaneado !== 'undefined') {
        qrEscaneado = null;
      }

      alert(`Contacto guardado:\nNombre: ${nombre}\nNúmero: ${numeroPuro}\nEntidad: ${entidadNormalizada}`);
      goToWithTransition('yapearA');
    });
  }
}

// Lógica para la pantalla del lector QR
function initLectorQR(modo = 'guardar') {
    // --- Verificar que jsQR esté cargado ---
    if (typeof jsQR === 'undefined') {
        console.error("jsQR no está cargado.");
        alert("Error al cargar el lector de QR.");
        if (modo === 'buscar') {
            goToWithTransition('home');
        } else {
            goToWithTransition('ayudaAgregarNumero');
        }
        return;
    }

    const video = document.getElementById('camera');
    const scannerBox = document.getElementById('scanner-box');
    const flashBtn = document.getElementById('flash-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    const closeBtn = document.getElementById('close-btn');
    const scanInstruction = document.getElementById('scan-instruction');

    let stream = null;
    let track = null;
    let torchOn = false;
    let scanning = true;

    async function initCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            video.srcObject = stream;
            track = stream.getVideoTracks()[0];
            video.onloadedmetadata = () => requestAnimationFrame(scanBoxArea);
        } catch (err) {
            console.error("Error al acceder a la cámara:", err);
            alert("No se pudo acceder a la cámara.");
            if (modo === 'buscar') {
                goToWithTransition('home');
            } else {
                goToWithTransition('ayudaAgregarNumero');
            }
        }
    }

    function getCropArea() {
        const videoRect = video.getBoundingClientRect();
        const boxRect = scannerBox.getBoundingClientRect();
        const vw = video.videoWidth;        const vh = video.videoHeight;
        const dispW = videoRect.width;
        const dispH = videoRect.height;
        const videoRatio = vw / vh;
        const displayRatio = dispW / dispH;
        let sx = 0, sy = 0, sw = vw, sh = vh;

        if (displayRatio > videoRatio) {
            const scale = vh / dispH;
            const scaledWidth = vw / scale;
            const cropX = (dispW - scaledWidth) / 2;
            const boxLeft = boxRect.left - videoRect.left;
            const boxTop = boxRect.top - videoRect.top;
            sx = (boxLeft - cropX) * scale;
            sy = boxTop * scale;
            sw = boxRect.width * scale;
            sh = boxRect.height * scale;
        } else {
            const scale = vw / dispW;
            const scaledHeight = vh / scale;
            const cropY = (dispH - scaledHeight) / 2;
            const boxLeft = boxRect.left - videoRect.left;
            const boxTop = boxRect.top - videoRect.top;
            sx = boxLeft * scale;
            sy = (boxTop - cropY) * scale;
            sw = boxRect.width * scale;
            sh = boxRect.height * scale;
        }

        sx = Math.max(0, Math.min(vw - 1, Math.round(sx)));
        sy = Math.max(0, Math.min(vh - 1, Math.round(sy)));
        sw = Math.max(1, Math.min(vw - sx, Math.round(sw)));
        sh = Math.max(1, Math.min(vh - sy, Math.round(sh)));
        return { sx, sy, sw, sh };
    }

    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');

    function scanBoxArea() {
        if (!scanning || !video.videoWidth) return;

        try {
            const { sx, sy, sw, sh } = getCropArea();
            c.width = sw;
            c.height = sh;
            ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
            const img = ctx.getImageData(0, 0, sw, sh);
            const code = jsQR(img.data, sw, sh, { inversionAttempts: "attemptBoth" });
            if (code && code.data) {
                scanning = false;
                if (stream) stream.getTracks().forEach(t => t.stop());

                if (modo === 'buscar') {
                    // 🔍 Buscar contacto por QR
                    const contactos = JSON.parse(localStorage.getItem("contactosGuardados") || "[]");
                    const contactoEncontrado = contactos.find(c => c.qr === code.data);
                    
                    if (contactoEncontrado) {
                        if (scanInstruction) {
                            scanInstruction.textContent = "¡Contacto encontrado! Redirigiendo...";
                            scanInstruction.style.color = "green";
                        }
                        setTimeout(() => {
                            goToWithTransition('ingresarMonto', { 
                                numeroDestino: contactoEncontrado.numero,
                                nombrePersonalizado: contactoEncontrado.nombre
                            });
                        }, 1000);
                    } else {
                        if (scanInstruction) {
                            scanInstruction.textContent = "Contacto no encontrado.";
                            scanInstruction.style.color = "red";
                        }
                        setTimeout(() => {
                            goToWithTransition('home');
                        }, 2000);
                    }
                } else {
                    // 💾 Guardar QR temporalmente
                    qrEscaneado = code.data;
                    if (scanInstruction) {
                        scanInstruction.textContent = "¡QR guardado! Regresando...";
                        scanInstruction.style.color = "green";
                    }
                    setTimeout(() => {
                        goToWithTransition('ayudaAgregarNumero');
                    }, 1000);
                }
                return;
            }
        
        } catch (e) {
            console.warn("Error durante el escaneo:", e);
        }
        requestAnimationFrame(scanBoxArea);
    }

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', ev => {
        const f = ev.target.files?.[0];
        if (!f) return;

        const img = new Image();
        img.src = URL.createObjectURL(f);

        img.onload = () => {
            const cc = document.createElement('canvas');
            const cctx = cc.getContext('2d');
            cc.width = img.width;
            cc.height = img.height;
            cctx.drawImage(img, 0, 0);
            const data = cctx.getImageData(0, 0, cc.width, cc.height);
            const code = jsQR(data.data, cc.width, cc.height, { inversionAttempts: "attemptBoth" });

            if (code && code.data) {
                scanning = false;
                if (modo === 'buscar') {
                    const contactos = JSON.parse(localStorage.getItem("contactosGuardados") || "[]");
                    const contactoEncontrado = contactos.find(c => c.qr === code.data);
                    
                    if (contactoEncontrado) {
                        alert("¡Contacto encontrado!");
                        goToWithTransition('ingresarMonto', { 
                            numeroDestino: contactoEncontrado.numero,
                            nombrePersonalizado: contactoEncontrado.nombre
                        });
                    } else {
                        alert("Contacto no encontrado.");
                        goToWithTransition('home');
                    }
                } else {
                    qrEscaneado = code.data;
                    alert("QR guardado.");
                    goToWithTransition('ayudaAgregarNumero');
                }
            } else {
                alert("No se encontró QR en la imagen.");
                if (modo === 'buscar') {
                    goToWithTransition('home');
                } else {
                    goToWithTransition('ayudaAgregarNumero');
                }
            }
            URL.revokeObjectURL(img.src);
        };
    });

    flashBtn.addEventListener('click', async () => {        if (!track) return alert("La cámara aún no inició.");
        const caps = track.getCapabilities();
        if (!caps.torch) return alert("Tu dispositivo no soporta linterna.");
        try {
            torchOn = !torchOn;
            await track.applyConstraints({ advanced: [{ torch: torchOn }] });
            flashBtn.textContent = torchOn ? 'Apagar linterna' : 'Encender linterna';
        } catch (e) {
            alert("No se pudo encender la linterna.");
        }
    });

    closeBtn.addEventListener("click", () => {
        scanning = false;
        if (stream) stream.getTracks().forEach(t => t.stop());
        if (modo === 'buscar') {
            goToWithTransition('home');
        } else {
            goToWithTransition('ayudaAgregarNumero');
        }
    });

    initCamera();
}

// Lógica para la pantalla de nueva clave Yape
function initNuevaClaveYape() {
    const pinInputs = document.querySelectorAll('#pinContainer .pin');
    let pin = '';

    // NO cargar PIN guardado, comenzar desde cero para la nueva clave
    // La clave anterior se sobrescribe al guardar la nueva

    // Agregar evento click a los botones de dígitos
    document.querySelectorAll('.new_btn_key[data-digit]').forEach(button => {
      button.addEventListener('click', () => {
        if (pin.length < 6) {
          pin += button.getAttribute('data-digit');
          updatePinDisplay();
          if (pin.length === 6) {
            // Aquí se sobrescribe la clave anterior
            localStorage.setItem('yapePin', pin);
            console.log("Nueva clave guardada en localStorage:", pin);
            // Mostrar modal de éxito
            mostrarModalClaveCambiada();
            // Opcional: Reiniciar el PIN después de guardar
            // pin = '';
            // updatePinDisplay();
          }
        }
      });
    });

    // Agregar evento click al botón de borrar
    document.getElementById('btn-delete-nueva').addEventListener('click', () => {
      if (pin.length > 0) {
        pin = pin.slice(0, -1);
        updatePinDisplay();
      }
    });

    // Función para actualizar la visualización del PIN
    function updatePinDisplay() {
      pinInputs.forEach((el, i) => {
        el.classList.toggle('pin-fill', i < pin.length);
      });
    }

    // Función para mostrar el modal de clave cambiada
    function mostrarModalClaveCambiada() {
        // Crear el HTML del modal si no existe
        let modal = document.getElementById('modalClaveCambiada');
        if (!modal) {
             const modalHTML = `
             <div id="modalClaveCambiada" class="modal-clave-cambiada">
               <div class="content">
                 <img src="assets/icono22.svg" alt="Éxito"> <!-- Reemplaza con tu SVG -->
                 <p>Su clave se cambió con éxito</p>
                 <button class="btn-cerrar" onclick="cerrarModalClaveCambiada()">Aceptar</button>
               </div>
             </div>
           `;
           document.body.insertAdjacentHTML('beforeend', modalHTML); // Añadir al final del body
           modal = document.getElementById('modalClaveCambiada');
        }
        modal.style.display = 'flex';
    }
}

// Función para cerrar el modal de clave cambiada (debe ser global)
function cerrarModalClaveCambiada() {
    const modal = document.getElementById('modalClaveCambiada');
    if (modal) {
        modal.style.display = 'none';
        // Opcional: Navegar a otra pantalla después de cerrar el modal
        goToWithTransition('ingresarClave'); // O la pantalla que desees
    }
}

// Lógica para la pantalla de inicio (Home)
function initHome() {
    // Recuperar datos del usuario guardados en localStorage
    const datosUsuarioGuardados = localStorage.getItem("datosUsuario");
    // En initHome()
if (datosUsuarioGuardados) {
  try {
    const datos = JSON.parse(datosUsuarioGuardados);
    const nombreUsuarioElement = document.getElementById('nombre-usuario');
    if (nombreUsuarioElement) {
      nombreUsuarioElement.textContent = `Hola, ${datos.nombre || 'Usuario'}`;
    }
    const saldoElement = document.getElementById('saldo-valor');
    if (saldoElement) {
      // ✅ USAR LA FUNCIÓN DE FORMATEO
      saldoElement.textContent = formatearSaldo(datos.saldo);
    }
  } catch (e) {
    console.error("Error al parsear los datos del usuario:", e);
    // ... manejo de error ...
            const nombreUsuarioElement = document.getElementById('nombre-usuario');
            if (nombreUsuarioElement) {
                nombreUsuarioElement.textContent = `Hola, Usuario`;
            }
        }
    } else {
        const nombreUsuarioElement = document.getElementById('nombre-usuario');
        if (nombreUsuarioElement) {
            nombreUsuarioElement.textContent = `Hola, Usuario`;
        }
    }

    // Inicializar el toggle de saldo
    window.toggleSaldoHome = function() {
        const icon = document.getElementById('icon-saldo');
        const texto = document.getElementById('texto-saldo');
        const saldo = document.getElementById('saldo-valor');

        if (saldoVisibleHome) {
            icon.src = 'assets/eye.svg';
            texto.textContent = 'Mostrar Saldo';
            saldo.style.display = 'none';
            saldoVisibleHome = false;
        } else {
            icon.src = 'assets/eye2.svg';
            texto.textContent = 'Ocultar Saldo';
            saldo.style.display = 'block';
            saldoVisibleHome = true;
        }
    };

    let saldoVisibleHome = false;
    

    // Cargar movimientos
    function cargarYMostrarMovimientos() {
        const contLista = document.getElementById("movimientos-lista");
        const noMov = document.getElementById("no-movimientos");
        const cardMov = document.getElementById("movements-card");

        if (!contLista || !noMov || !cardMov) return;

        const movimientosGuardadosJSON = localStorage.getItem("movimientos");
        let movimientos = [];

        if (movimientosGuardadosJSON) {
            try {
                movimientos = JSON.parse(movimientosGuardadosJSON);
            } catch (e) {
                console.error("Error al parsear movimientos:", e);
            }
        }

        if (movimientos.length > 0) {
            noMov.style.display = "none";
            cardMov.style.display = "block";
            contLista.innerHTML = '';

            const movimientosAMostrar = movimientos.slice(0, 6);
            movimientosAMostrar.forEach(mov => {
                const divMovimiento = document.createElement('div');
                divMovimiento.className = 'movimiento';
              divMovimiento.dataset.id = mov.id; // ← AÑADIR ESTA LÍNEA
              divMovimiento.innerHTML = `
                    <p class="nombre">${
                        mov.destinoDetalle && mov.destinoDetalle.toLowerCase() !== 'yape' 
                            ? `${mov.destinoDetalle} - ${mov.nombre}` 
                            : mov.nombre
                    }</p>
                    <p class="fecha">${formatearFechaMovimiento(mov.fechaTimestamp)}</p>
                    <p class="monto">${mov.monto}</p>
                `;
                
                divMovimiento.addEventListener('click', () => {
                    const datosParaDetalle = {
                        monto: mov.montoDetalle,
                        nombre: mov.nombre,
                        numero: mov.numeroDetalle,
                        mensaje: mov.mensajeDetalle,
                        codigoSeguridad: mov.codigoSeguridad,
                        numeroOperacion: mov.numeroOperacion,
                        destino: mov.destinoDetalle,
                        fechaTimestamp: mov.fechaTimestamp,
                        esHistorial: true
                    };
                    goToWithTransition('confirmacionDeYapeo', datosParaDetalle);
                });
                contLista.appendChild(divMovimiento);
            });

            // Añadir el botón "Ver todos" si hay más de 6
if (movimientos.length > 1) {
    const verTodos = document.createElement('p');
    verTodos.className = 'ver-todos';
    verTodos.textContent = 'Ver todos';
    verTodos.style.cursor = 'pointer';
    verTodos.addEventListener('click', () => {
        goToWithTransition('historialCompleto');
    });
    contLista.appendChild(verTodos);
}
        } else {
            noMov.style.display = "block";
            cardMov.style.display = "none";
        }
    }

    cargarYMostrarMovimientos();

    // Toggle movimientos
    const btnMov = document.getElementById('movements-card');
    const contLista = document.getElementById('movimientos-lista');
    const flechaMov = document.getElementById('arrow-icon');
    const textoMov = document.getElementById('texto-mov');
    const transactionCard = document.querySelector('.transaction-card');

    if (btnMov) {
        btnMov.addEventListener('click', () => {            const activo = contLista.classList.toggle('activa');
            btnMov.classList.toggle('expanded', activo);
            flechaMov.classList.toggle('girar', activo);
            textoMov.textContent = activo ? 'Ocultar movimientos' : 'Mostrar movimientos';

            if (activo) {
                transactionCard.classList.add('expand-step1');
                setTimeout(() => transactionCard.classList.add('expand-step2'), 400);
                setTimeout(() => transactionCard.classList.add('expand-step3'), 800);
                setTimeout(() => {
                    transactionCard.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 200);
            } else {
                transactionCard.classList.remove('expand-step1', 'expand-step2', 'expand-step3');
            }
        });
    }

    // --- ✅ BOTÓN ESCANEAR QR EN HOME ---
    const qrButton = document.querySelector('.qr-button');
    if (qrButton) {
        qrButton.onclick = () => {
            // Abrir lector QR en modo "buscar"
            goToWithTransition('lectorQR', { modo: 'buscar' });
        };
    }

    // --- INICIO DE LA LÓGICA DEL CARRUSEL ---
if (!bannersHomeCargados) {
    import("https://esm.sh/@supabase/supabase-js@2").then(({ createClient }) => {
        const SUPABASE_URL = "https://vzgkmunhtwcobukrcovn.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Z2ttdW5odHdjb2J1a3Jjb3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTM5MDgsImV4cCI6MjA3ODQ2OTkwOH0.bbfvHD57_ZFhU0QGP59-PAt6xaxNUgRYMmCynBHfTfQ";
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        async function cargarBanners() {
            const contenedor = document.getElementById("banner-slider");
            const dotContainer = document.getElementById("dot-container");
            if (!contenedor || !dotContainer) return;

            const { data, error } = await supabase.from("banners").select("urls").order("id", { ascending: false }).limit(1);
            if (error) {
                console.error("Error al cargar banners:", error);
                contenedor.innerHTML = "<p style='text-align:center;color:#fff;'>Error al cargar banners</p>";
                return;
            }

            const urls = data?.[0]?.urls || [];
            let htmlBanners = '';
            let htmlDots = '';

            // ❌ Antes
urls.forEach((url, index) => {
  htmlBanners += `
    <div class="banner-item">
      <img src="${url}" alt="Banner ${index + 1}" class="banner-img" />
      <div class="progress-bar"><div class="progress-fill"></div></div>
    </div>
  `;
  htmlDots += '<div class="dot"></div>';
});

            bannersHomeHTML = { banners: htmlBanners, dots: htmlDots };
            contenedor.innerHTML = htmlBanners;
            dotContainer.innerHTML = htmlDots;

            iniciarCarrusel(urls.length);
            bannersHomeCargados = true;
        }

        function iniciarCarrusel(totalBanners) {
            const slider = document.querySelector(".banner-slider");
            if (!slider) return;

            // Limpiar intervalo anterior si existe
            if (carruselIntervalo) clearInterval(carruselIntervalo);

            const banners = document.querySelectorAll(".banner-item");
            const dots = document.querySelectorAll(".dot");
            // Asegurar que el índice esté dentro del rango
            currentIndexHome = Math.min(currentIndexHome, totalBanners - 1);

            function actualizar() {
                dots.forEach(d => d.classList.remove("active"));
                if (dots[currentIndexHome]) dots[currentIndexHome].classList.add("active");
                
                const bannerWidth = banners[0].offsetWidth + 18;
                slider.scrollLeft = currentIndexHome * bannerWidth;
            }

            function siguiente() {
                currentIndexHome = (currentIndexHome + 1) % totalBanners;
                actualizar();
            }

            // Iniciar desde el índice guardado
            actualizar();
            carruselIntervalo = setInterval(siguiente, 4200);

            // Eventos de interacción
            slider.addEventListener("touchstart", () => clearInterval(carruselIntervalo));
            slider.addEventListener("touchend", () => {
                setTimeout(() => {
                    carruselIntervalo = setInterval(siguiente, 4200);
                }, 100);
            });

            slider.addEventListener("mouseenter", () => clearInterval(carruselIntervalo));
            slider.addEventListener("mouseleave", () => {
                carruselIntervalo = setInterval(siguiente, 4200);
            });
        }
        cargarBanners();
    }).catch(err => {
        console.error("Error al importar Supabase:", err);
        const contenedor = document.getElementById("banner-slider");
        if (contenedor) {
            contenedor.innerHTML = "<p style='text-align:center;color:#fff;'>Error al cargar el carrusel</p>";
        }
    });
} else {
    // Reutilizar HTML y continuar desde currentIndexHome
    const contenedor = document.getElementById("banner-slider");
    const dotContainer = document.getElementById("dot-container");
    if (contenedor && dotContainer && bannersHomeHTML) {
        contenedor.innerHTML = bannersHomeHTML.banners;
        dotContainer.innerHTML = bannersHomeHTML.dots;
                // Reiniciar carrusel con el índice guardado
        setTimeout(() => {
            const totalBanners = document.querySelectorAll(".banner-item").length;
            if (totalBanners > 0) {
                iniciarCarruselDesdeMemoria(totalBanners);
            }
        }, 100);
    }
}

function iniciarCarruselDesdeMemoria(totalBanners) {
    const slider = document.querySelector(".banner-slider");
    if (!slider) return;

    if (carruselIntervalo) clearInterval(carruselIntervalo);

    const banners = document.querySelectorAll(".banner-item");
    const dots = document.querySelectorAll(".dot");

    currentIndexHome = Math.min(currentIndexHome, totalBanners - 1);

    function actualizar() {
        dots.forEach(d => d.classList.remove("active"));
        if (dots[currentIndexHome]) dots[currentIndexHome].classList.add("active");
        const bannerWidth = banners[0].offsetWidth + 18;
        slider.scrollLeft = currentIndexHome * bannerWidth;
    }

    function siguiente() {
        currentIndexHome = (currentIndexHome + 1) % totalBanners;
        actualizar();
    }

    actualizar();
    carruselIntervalo = setInterval(siguiente, 4200);

    slider.addEventListener("touchstart", () => clearInterval(carruselIntervalo));
    slider.addEventListener("touchend", () => {
        setTimeout(() => {
            carruselIntervalo = setInterval(siguiente, 4200);
        }, 100);
    });

    slider.addEventListener("mouseenter", () => clearInterval(carruselIntervalo));
    slider.addEventListener("mouseleave", () => {
        carruselIntervalo = setInterval(siguiente, 4200);
    });
}
// --- FIN DE LA LÓGICA DEL CARRUSEL ---
    // --- FIN DE LA LÓGICA DEL CARRUSEL ---
  // Inicializar eliminación de movimientos
initEliminarMovimientos();
}

// Lógica para la pantalla de nueva clave Yape
function initNuevaClaveYape() {
    const pinInputs = document.querySelectorAll('#pinContainer .pin');
    let pin = '';

    // NO cargar PIN guardado, comenzar desde cero para la nueva clave
    // La clave anterior se sobrescribe al guardar la nueva

    // Agregar evento click a los botones de dígitos
    document.querySelectorAll('.new_btn_key[data-digit]').forEach(button => {
      button.addEventListener('click', () => {
        if (pin.length < 6) {
          pin += button.getAttribute('data-digit');
          updatePinDisplay();
          if (pin.length === 6) {
            // Aquí se sobrescribe la clave anterior
            localStorage.setItem('yapePin', pin);
            console.log("Nueva clave guardada en localStorage:", pin);
            // Mostrar modal de éxito
            mostrarModalClaveCambiada();
            // Opcional: Reiniciar el PIN después de guardar
            // pin = '';
            // updatePinDisplay();
          }
        }
      });
    });

    // Agregar evento click al botón de borrar
    document.getElementById('btn-delete-nueva').addEventListener('click', () => {
      if (pin.length > 0) {
        pin = pin.slice(0, -1);
        updatePinDisplay();
      }
    });

    // Función para actualizar la visualización del PIN
    function updatePinDisplay() {
      pinInputs.forEach((el, i) => {
        el.classList.toggle('pin-fill', i < pin.length);
      });
    }

    // Función para mostrar el modal de clave cambiada
    function mostrarModalClaveCambiada() {
        // Crear el HTML del modal si no existe
        let modal = document.getElementById('modalClaveCambiada');
        if (!modal) {
             const modalHTML = `
             <div id="modalClaveCambiada" class="modal-clave-cambiada">
               <div class="content">
                 <img src="assets/icono22.svg" alt="Éxito"> <!-- Reemplaza con tu SVG -->
                 <p>Su clave se cambió con éxito</p>
                 <button class="btn-cerrar" onclick="cerrarModalClaveCambiada()">Aceptar</button>
               </div>
             </div>
           `;
           document.body.insertAdjacentHTML('beforeend', modalHTML); // Añadir al final del body
           modal = document.getElementById('modalClaveCambiada');
        }
        modal.style.display = 'flex';
    }
}

// Función para cerrar el modal de clave cambiada (debe ser global)
function cerrarModalClaveCambiada() {
    const modal = document.getElementById('modalClaveCambiada');
    if (modal) {
        modal.style.display = 'none';
        // Opcional: Navegar a otra pantalla después de cerrar el modal
        goToWithTransition('ingresarClave'); // O la pantalla que desees
    }
}

// Lógica para la pantalla "Yapear a"
function initYapearA() {
  // Datos de ejemplo (solo para referencia visual, no se usan en la búsqueda real)
  const contacts = [
    { name: "+51903105094", number: "980 565 107" },
    { name: "+51903105094", number: "920 732 432" },
    { name: "Estiven Alejandro", number: "915 175 250" },
    { name: "Ester😁", number: "956 756 876" },
    { name: "Gerardo Lopez", number: "932 985 471" },
    { name: "Eugenia Pereda lopez", number: "943 785 683" },
    { name: "Juliana", number: "999 123 456" }
  ];

  const searchBar = document.getElementById("search-bar");
  const searchInput = document.querySelector(".search-input");
  const clearBtn = document.getElementById("clear-btn");
  const newNumberResult = document.getElementById("new-number-result");
  const newNumberValue = document.getElementById("new-number-value");
  const noPagos = document.getElementById("no-pagos");
  const activeIndicator = document.getElementById("active-indicator");

  let timeoutId;

  // --- EVENTO PARA EL RESULTADO "A NUEVO CELULAR" (MODIFICADO) ---
newNumberResult.addEventListener('click', () => {
    const valorBusqueda = searchInput.value.trim();
    
    // ✅ Permitir tanto números como ***
    if (valorBusqueda === '***' || (/^\d+$/.test(valorBusqueda) && (valorBusqueda.length === 3 || valorBusqueda.length === 9))) {
        goToWithTransition('ingresarMonto', { numeroDestino: valorBusqueda });
    }
});

  function updateActiveIndicator() {
    const isActivePendientes = document.getElementById("tab-pendientes").classList.contains("active");
    activeIndicator.style.left = isActivePendientes ? '56%' : '0%';
  }

  document.getElementById("tab-contactos").addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById("tab-contactos").classList.add("active");
    renderContacts(contacts);
    searchBar.style.display = "flex";
    newNumberResult.style.display = "none";
    document.getElementById("new-number-msg").style.display = "none";
    searchInput.value = "";
    searchBar.classList.remove("has-text");
    updateActiveIndicator();
  });

  document.getElementById("tab-pendientes").addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById("tab-pendientes").classList.add("active");
    const contactList = document.getElementById("contact-list");
    contactList.innerHTML = "";
    contactList.appendChild(noPagos);
    noPagos.style.display = "list-item";
    searchBar.style.display = "none";
    newNumberResult.style.display = "none";
    searchInput.value = "";
    searchBar.classList.remove("has-text");
    updateActiveIndicator();
  });

  function renderContacts(list) {
    const contactListEl = document.getElementById("contact-list");
    contactListEl.innerHTML = "";
    list.forEach(contact => {
        const li = document.createElement("li");
        li.className = "contact-item";
        li.innerHTML = `
            <div class="contact-name">${contact.name}</div>
            <div class="contact-number">${contact.number}</div>
        `;
        // ✅ NAVEGACIÓN REAL EN LUGAR DE ALERT
        li.addEventListener("click", () => {
            const numeroLimpio = contact.number.replace(/\D/g, '');
            goToWithTransition('ingresarMonto', { 
                numeroDestino: numeroLimpio,
                nombrePersonalizado: contact.name
            });
        });
        contactListEl.appendChild(li);
    });
}

  function handleSearchInput(query) {
  clearTimeout(timeoutId);

  if (query === "") {
    searchBar.classList.remove("has-text");
    newNumberResult.style.display = "none";
    document.getElementById("new-number-msg").style.display = "none";
    renderContacts(contacts);
    return;
  }
  
  searchBar.classList.add("has-text");

  timeoutId = setTimeout(() => {
    const isAsterisks = query === '***';
    const isNumber = /^\d+$/.test(query);

    if (isAsterisks) {
      newNumberValue.textContent = '***';
      newNumberResult.style.display = 'block';
      document.getElementById('new-number-msg').style.display = 'block';
      document.getElementById('contact-list').innerHTML = '';
    } else if (isNumber) {
      if (query.length === 3 || query.length === 9) {
        newNumberValue.textContent = query;
        newNumberResult.style.display = 'block';
        document.getElementById('new-number-msg').style.display = 'block';
        document.getElementById('contact-list').innerHTML = '';
      } else {
        newNumberResult.style.display = 'none';
        document.getElementById('contact-list').innerHTML = '';
      }
    } else {
      
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(query.toLowerCase())
      );
      newNumberResult.style.display = 'none';
      document.getElementById('new-number-msg').style.display = 'none'; 
      renderContacts(filtered);
    }
  }, 1000);
}

  searchInput.addEventListener("input", (e) => {
    const value = e.target.value.trim();
    const searchIcon = document.getElementById("search-icon");

    if (value.length > 0) {
      searchIcon.src = "assets/garra.svg";
    } else {
      searchIcon.src = "assets/search2.svg";
    }

    handleSearchInput(value);
  });

  searchInput.addEventListener("paste", (e) => {
    const pastedText = (e.clipboardData || window.clipboardData).getData("text");
    handleSearchInput(pastedText.trim());
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchBar.classList.remove("has-text");
    newNumberResult.style.display = "none";
    document.getElementById("new-number-msg").style.display = "none";
    renderContacts(contacts);
    searchInput.focus();
  });

  const closeButton = document.getElementById("close-button");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      goToWithTransition('home');
    });
  }
  
  renderContacts(contacts);
  updateActiveIndicator();
}

function initIngresarMonto(data) {
    let numeroDestino = '';
    let nombrePersonalizado = null;

    if (typeof data === 'string') {
        numeroDestino = data;
    } else if (data && typeof data === 'object') {
        numeroDestino = data.numeroDestino || '';
        nombrePersonalizado = data.nombrePersonalizado || null;
    }

    
let numeroPuro = '';
if (numeroDestino === '***') {
  numeroPuro = '***';
} else {
  numeroPuro = (numeroDestino || '').toString().replace(/\D/g, '');
}    
    
    let nombreContacto = null;
    let entidadContacto = null;
    let contactosDelNumero = [];

    const contactosGuardadosJSON = localStorage.getItem("contactosGuardados");
    if (contactosGuardadosJSON) {
        try {
            const contactosGuardados = JSON.parse(contactosGuardadosJSON);
            contactosDelNumero = contactosGuardados.filter(c => c.numero === numeroPuro);
            
            if (contactosDelNumero.length > 0) {
                const contactoYape = contactosDelNumero.find(c => c.entidad === 'Yape');
                if (contactoYape) {
                    nombreContacto = contactoYape.nombre;
                    entidadContacto = 'Yape';
                } else {
                    const primerContacto = contactosDelNumero[0];
                    nombreContacto = primerContacto.nombre;
                    entidadContacto = primerContacto.entidad;
                }
            }
        } catch (e) {
            console.error("Error al parsear contactos guardados:", e);
        }
    }

    const searchInput = document.getElementById('search-input');
    const nicknameSection = document.querySelector('.nickname-section');
    const nicknameInput = document.getElementById('nickname-input');
    const amountInput = document.getElementById("amount-input");
    const messageInput = document.getElementById('message-input');
    
    if (tempIngresarMontoData && tempIngresarMontoData.numero === numeroPuro) {
        
        if (searchInput) searchInput.value = tempIngresarMontoData.nombre || '';
        if (messageInput) messageInput.value = tempIngresarMontoData.mensaje || '';
        if (amountInput) amountInput.value = tempIngresarMontoData.monto || '0';
    } else {
        
        if (searchInput) {
            if (entidadContacto === 'Yape') {
                searchInput.value = nombreContacto || '';
            } else if (entidadContacto) {
                searchInput.value = nombreContacto || '';
            } else {
                searchInput.value = nombrePersonalizado || '';
            }
        }
        if (messageInput) messageInput.value = '';
        if (amountInput) amountInput.value = '0';
    }

    
if (nicknameSection) {
  
  const esAsteriscos = numeroPuro === '***';

  if (esAsteriscos) {
    nicknameSection.style.display = 'block';
    if (nicknameInput) {
      nicknameInput.value = '*** *** ***';
    }
  } else if (entidadContacto === 'Yape') {
    
    nicknameSection.style.display = 'block';
    if (nicknameInput) {
      const lastThreeDigits = numeroPuro.length >= 3 
          ? numeroPuro.slice(-3) 
          : numeroPuro.padStart(3, '0');
      nicknameInput.value = `*** *** ${lastThreeDigits}`;
    }
  } else if (entidadContacto) {
    
    nicknameSection.style.display = 'none';
  } else {
    // Caso genérico
    nicknameSection.style.display = 'block';
    if (nicknameInput) {
      const lastThreeDigits = numeroPuro.length >= 3 
          ? numeroPuro.slice(-3) 
          : numeroPuro.padStart(3, '0');
      nicknameInput.value = `*** *** ${lastThreeDigits}`;
    }
  }
}

if (searchInput) {
  const esAsteriscos = numeroPuro === '***';
  
  if (esAsteriscos) {
    searchInput.value = '';
    searchInput.placeholder = 'Inserte el nombre';
  } else {
    if (entidadContacto === 'Yape') {
      searchInput.value = nombreContacto || '';
    } else if (entidadContacto) {
      searchInput.value = nombreContacto || '';
    } else {
      searchInput.value = nombrePersonalizado || '';
    }
  }
}
    function measureTextWidth(text, inputEl) {
        const style = window.getComputedStyle(inputEl);
        const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const canvas = measureTextWidth._canvas || (measureTextWidth._canvas = document.createElement('canvas'));
        const ctx = canvas.getContext('2d');        ctx.font = font;
        return Math.ceil(ctx.measureText(text).width);
    }

    function sanitizeAmount(v) {
        v = (v || '').toString().trim().replace(/[^0-9.]/g, '');
        const p = v.split('.');
        if (p.length > 2) v = p[0] + '.' + p[1];
        if (/^0\d+/.test(v) && !v.startsWith('0.')) v = v.replace(/^0+/, '');
        return v === '' ? '0' : v;
    }

    function adjustCurrencyPosition() {
        const raw = amountInput.value;
        const v = sanitizeAmount(raw);
        amountInput.value = v;
        const text = (v === '' || v === '0') ? '0' : v;
        const baseOffset = -35;
        const extraPadding = 12;
        const textWidth = measureTextWidth(text, amountInput);
        const finalX = baseOffset - (textWidth / 2) - extraPadding;
        document.querySelector('.currency').style.transform = `translate(${finalX}px, -13px)`;
    }

    function updateAmountDisplay() {
        let v = amountInput.value.replace(/[^0-9.]/g, "");
        
        const preParts = v.split(".");
        if (preParts[0].length > 5) {
            preParts[0] = preParts[0].slice(0, 5);
            v = preParts.join(".");
        }

        let isValid = false;
        if (v === "" || v === "." || v === "0") {
            v = "0";
            document.getElementById('amount-wrapper').classList.remove('has-dot');
            document.getElementById("ghost-decimals").textContent = "00";
            isValid = false;
        } else {
            const parts = v.split(".");
            if (parts.length > 2) v = parts[0] + "." + parts[1];

            if (v.includes(".")) {
                let [ent, dec] = v.split(".");
                dec = (dec || "").slice(0,2);

                if (dec.length === 0) {
                    document.getElementById("ghost-decimals").textContent = "00";
                } else if (dec.length === 1) {                    document.getElementById("ghost-decimals").textContent = "0";
                } else {
                    document.getElementById("ghost-decimals").textContent = "";
                }
                document.getElementById('amount-wrapper').classList.add('has-dot');
                v = ent + "." + dec;
            } else {
                document.getElementById('amount-wrapper').classList.remove('has-dot');
                document.getElementById("ghost-decimals").textContent = "00";
            }

            const n = parseFloat(v);
            isValid = !isNaN(n) && n > 0;
        }

        amountInput.value = v;
        adjustCurrencyPosition();
        
        const pantallaContainer = document.querySelector('.pantalla-ingresar-monto');
        if (pantallaContainer) {
            pantallaContainer.classList.toggle('amount-not-zero', isValid);
        }
    }

    // Reasignar eventos del monto
    if (amountInput) {
        // Limpiar eventos anteriores
        amountInput.removeEventListener("input", updateAmountDisplay);
        amountInput.addEventListener("input", updateAmountDisplay);
        updateAmountDisplay(); // Aplicar estado inicial
    }

    // ==== BOTÓN "YAPEAR" ====
    const yapearBtn = document.getElementById('yapear-btn');
    if (yapearBtn) {
        // Clonar para limpiar eventos anteriores
        const newYapearBtn = yapearBtn.cloneNode(true);
        yapearBtn.parentNode.replaceChild(newYapearBtn, yapearBtn);
        
        newYapearBtn.onclick = () => {
            const monto = amountInput.value.trim();
            const num = parseFloat(monto);
            if (!monto || isNaN(num) || num < 0.01 || num > 99999) {
                return alert("Monto inválido. Debe estar entre 0.01 y 99999.");
            }
          
actualizarSaldo(num);
          
            const nombreUsuario = searchInput.value.trim() || "Contacto";

            const datosTransaccion = {
                monto: monto,                nombre: nombreUsuario,
                numero: numeroPuro,
                mensaje: messageInput.value.trim() || "",
                codigoSeguridad: String(Math.floor(100 + Math.random() * 900)),
                numeroOperacion: String(Math.floor(10000000 + Math.random() * 90000000)),
                destino: "Yape",
                fechaTimestamp: Date.now(),
                esHistorial: false
            };

            // Limpiar datos temporales
            tempIngresarMontoData = null;

            const loadingModal = document.getElementById('loadingModal');
            if (loadingModal) {
                loadingModal.style.display = 'flex';
            }

            setTimeout(() => {
                if (loadingModal) {
                    loadingModal.style.display = 'none';
                }
                guardarMovimiento(datosTransaccion);
                goToWithTransition('confirmacionDeYapeo', datosTransaccion);
            }, 1500);
        };
    }

    // ==== BOTÓN "OTROS BANCOS" ====
    const otherBanksBtn = document.getElementById('other-banks');
    if (otherBanksBtn) {
        const newOtherBanksBtn = otherBanksBtn.cloneNode(true);
        otherBanksBtn.parentNode.replaceChild(newOtherBanksBtn, otherBanksBtn);
        
        newOtherBanksBtn.onclick = () => {
            // Guardar estado actual
            tempIngresarMontoData = {
                monto: amountInput.value,
                mensaje: messageInput.value,
                nombre: searchInput.value,
                numero: numeroPuro
            };
            
            goToWithTransition('otrosBancos', { 
                entidadPrincipal: entidadContacto || 'Yape',
                otrasEntidades: contactosDelNumero
                    .filter(c => c.entidad !== (entidadContacto || 'Yape'))
                    .map(c => ({ entidad: c.entidad, nombre: c.nombre })),
                nombre: nombreContacto || "Contacto",
                monto: amountInput.value,                numero: numeroPuro
            });
        };
    }

    // ==== NAVEGACIÓN ====
    const backBtn = document.getElementById('back-btn');
    const closeBtn = document.getElementById('close-btn');
    
    if (backBtn) {
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        newBackBtn.onclick = () => {
            tempIngresarMontoData = null; // Limpiar al salir
            goToWithTransition('yapearA');
        };
    }
    
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.onclick = () => {
            tempIngresarMontoData = null; // Limpiar al salir
            goToWithTransition('home');
        };
    }

    // ==== EFECTO RIPPLE ====
    document.querySelectorAll('.ripple-effect').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            const buttonRect = this.getBoundingClientRect();
            const size = Math.max(buttonRect.width, buttonRect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            const x = e.offsetX - size / 2;
            const y = e.offsetY - size / 2;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

// ===== AJUSTE CUANDO APARECE TECLADO =====
(function () {
  const msgSection = document.querySelector('.message-section');
  const buttons = document.querySelector('.pantalla-ingresar-monto .buttons');

  if (!window.visualViewport || !msgSection || !buttons) return;

  function adjustForKeyboard() {
    const viewport = window.visualViewport;
    const keyboardHeight = window.innerHeight - viewport.height;

    if (keyboardHeight > 120) {
      // botones sobre teclado
      const buttonsBottom = keyboardHeight + 12;
      buttons.style.bottom = buttonsBottom + "px";

      // mensaje sobre botones
      const gap = 16;
      const msgBottom = buttonsBottom + buttons.offsetHeight + gap;
      msgSection.style.bottom = msgBottom + "px";

    } else {
      // volver a valores CSS originales
      buttons.style.bottom = "4vw";
      msgSection.style.bottom = "22vw";
    }
  }

  visualViewport.addEventListener('resize', adjustForKeyboard);
})();
}

// Lógica para la pantalla "Otros bancos"
function initOtrosBancos(entidadPrincipal, otrasEntidades, nombre, monto, numero) {
    const content = document.querySelector('.content');
    if (!content) return;

    // --- Estado: entidad y nombre seleccionados ---
    let entidadSeleccionada = entidadPrincipal;
    let nombreSeleccionado = nombre;

    // 1. Caso especial: solo Yape
    const titleEl = document.querySelector('.section-title');
    if (titleEl && entidadPrincipal === 'Yape' && (!otrasEntidades || otrasEntidades.length === 0)) {
        titleEl.textContent = "Por el momento este contacto solo está afiliado a yape...";
        const entityCards = document.querySelectorAll('.entity-card');
        entityCards.forEach(card => card.style.display = 'none');
        // ⚠️ NO hay "return" → seguimos para asignar los botones
    }

    // 2. Actualizar título (solo si no es el caso "solo Yape")
    if (titleEl && !(entidadPrincipal === 'Yape' && (!otrasEntidades || otrasEntidades.length === 0))) {
        titleEl.textContent = "Selecciona una entidad financiera";
    }

    // 3. Eliminar tarjeta original ("Plin" del HTML)
    const originalCard = document.querySelector('.entity-card');
    if (originalCard) {
        originalCard.remove();
    }

    // 4. Crear tarjetas
    if (otrasEntidades && otrasEntidades.length > 0) {
        otrasEntidades.forEach(otra => {
            const newEntityCard = document.createElement('div');
            newEntityCard.className = 'entity-card';
            newEntityCard.setAttribute('data-entity', otra.entidad);
            newEntityCard.innerHTML = `
                <div class="entity-svg-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24.0 24.0">
                        <path d="M7.286,12.712C7.675,13.099 8.304,13.099 8.693,12.712C8.881,12.524 8.988,12.268 8.988,12.002C8.988,11.735 8.881,11.479 8.693,11.292L6.399,9.002L20.005,9.002C20.556,9.002 21.002,8.555 21.002,8.002C21.002,7.45 20.556,7.002 20.005,7.002L6.409,7.002L8.703,4.712C8.955,4.458 9.054,4.088 8.962,3.742C8.869,3.395 8.599,3.125 8.254,3.032C7.908,2.939 7.539,3.038 7.286,3.292L3.297,7.292C3.109,7.479 3.002,7.735 3.002,8.002C3.002,8.268 3.109,8.524 3.297,8.712L7.286,12.712ZM15.751,20.968C16.097,21.061 16.465,20.962 16.719,20.708L20.708,16.708C20.896,16.521 21.002,16.265 21.002,15.998C21.002,15.732 20.896,15.476 20.708,15.288L16.719,11.288C16.33,10.901 15.701,10.901 15.312,11.288C15.123,11.476 15.017,11.732 15.017,11.998C15.017,12.265 15.123,12.521 15.312,12.708L17.606,14.998L4,15.002C3.449,15.002 3.002,15.45 3.002,16.003C3.002,16.555 3.449,17.003 4,17.003L17.596,16.998L15.302,19.288C15.049,19.542 14.951,19.912 15.043,20.258C15.136,20.605 15.406,20.875 15.751,20.968Z" fill="#742284" />
                    </svg>
                </div>
                <span class="entity-name">${otra.entidad}</span>
            `;
            content.appendChild(newEntityCard);

            newEntityCard.addEventListener('click', () => {
                entidadSeleccionada = otra.entidad;
                nombreSeleccionado = otra.nombre;

                const loadingModal = document.getElementById('loadingModal');                const confirmationModal = document.getElementById('confirmationModal');
                
                if (loadingModal) loadingModal.style.display = 'flex';
                setTimeout(() => {
                    if (loadingModal) loadingModal.style.display = 'none';
                    if (confirmationModal) {
                        document.querySelector('.confirmation-name').textContent = otra.nombre || "Contacto";
                        document.querySelector('.metodo').textContent = otra.entidad;
                        document.querySelector('.cantidad').textContent = monto || '0';
                        confirmationModal.style.display = 'flex';
                    }
                }, 1500);
            });
        });
    } else {
        // Si no hay otras entidades, pero la principal no es Yape, mostrarla
        if (entidadPrincipal !== 'Yape') {
            const newEntityCard = document.createElement('div');
            newEntityCard.className = 'entity-card';
            newEntityCard.setAttribute('data-entity', entidadPrincipal);
            newEntityCard.innerHTML = `
                <div class="entity-svg-container">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24.0 24.0">
                        <path d="M7.286,12.712C7.675,13.099 8.304,13.099 8.693,12.712C8.881,12.524 8.988,12.268 8.988,12.002C8.988,11.735 8.881,11.479 8.693,11.292L6.399,9.002L20.005,9.002C20.556,9.002 21.002,8.555 21.002,8.002C21.002,7.45 20.556,7.002 20.005,7.002L6.409,7.002L8.703,4.712C8.955,4.458 9.054,4.088 8.962,3.742C8.869,3.395 8.599,3.125 8.254,3.032C7.908,2.939 7.539,3.038 7.286,3.292L3.297,7.292C3.109,7.479 3.002,7.735 3.002,8.002C3.002,8.268 3.109,8.524 3.297,8.712L7.286,12.712ZM15.751,20.968C16.097,21.061 16.465,20.962 16.719,20.708L20.708,16.708C20.896,16.521 21.002,16.265 21.002,15.998C21.002,15.732 20.896,15.476 20.708,15.288L16.719,11.288C16.33,10.901 15.701,10.901 15.312,11.288C15.123,11.476 15.017,11.732 15.017,11.998C15.017,12.265 15.123,12.521 15.312,12.708L17.606,14.998L4,15.002C3.449,15.002 3.002,15.45 3.002,16.003C3.002,16.555 3.449,17.003 4,17.003L17.596,16.998L15.302,19.288C15.049,19.542 14.951,19.912 15.043,20.258C15.136,20.605 15.406,20.875 15.751,20.968Z" fill="#742284" />
                    </svg>
                </div>
                <span class="entity-name">${entidadPrincipal}</span>
            `;
            content.appendChild(newEntityCard);

            newEntityCard.addEventListener('click', () => {
                entidadSeleccionada = entidadPrincipal;
                nombreSeleccionado = nombre;
                
                const loadingModal = document.getElementById('loadingModal');
                const confirmationModal = document.getElementById('confirmationModal');
                
                if (loadingModal) loadingModal.style.display = 'flex';
                setTimeout(() => {
                    if (loadingModal) loadingModal.style.display = 'none';
                    if (confirmationModal) confirmationModal.style.display = 'flex';
                }, 1500);
            });
        }
    }

    // 5. Actualizar modal inicial
    const confirmationName = document.querySelector('.confirmation-name');
    const metodoSpan = document.querySelector('.metodo');
    const cantidadSpan = document.querySelector('.cantidad');        if (confirmationName) confirmationName.textContent = nombre || "Contacto";
    if (metodoSpan) metodoSpan.textContent = entidadPrincipal;
    if (cantidadSpan) cantidadSpan.textContent = monto || '0';

    // 6. Botón Confirmar: usar los valores seleccionados
    const confirmButton = document.querySelector('.confirm-button');
    if (confirmButton) {
        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
        
        newConfirmButton.addEventListener('click', () => {
            const confirmationModal = document.getElementById('confirmationModal');
            const loadingModal = document.getElementById('loadingModal');
            const modalText = loadingModal ? loadingModal.querySelector('.modal-text') : null;
            
            if (confirmationModal) confirmationModal.style.display = 'none';
            if (modalText) modalText.textContent = 'Yapeando';
            if (loadingModal) loadingModal.style.display = 'flex';

            const datosTransaccion = {
                monto: monto,
                nombre: nombreSeleccionado,
                numero: numero,
                mensaje: '',
                codigoSeguridad: String(Math.floor(100 + Math.random() * 900)),
                numeroOperacion: String(Math.floor(10000000 + Math.random() * 90000000)),
                destino: entidadSeleccionada,
                fechaTimestamp: Date.now(),
                esHistorial: false
            };
          
          // Antes de guardar el movimiento
const montoNum = parseFloat(monto) || 0;
actualizarSaldo(montoNum); // ✅ ACTUALIZAR SALDO
          
          

            setTimeout(() => {
                if (modalText) modalText.textContent = 'Validando datos';
                if (loadingModal) loadingModal.style.display = 'none';
                guardarMovimiento(datosTransaccion);
                goToWithTransition('confirmacionDeYapeo', datosTransaccion);
            }, 1500);
        });
    }

    // 7. Navegación — ✅ SIEMPRE se ejecuta
    const backBtn = document.getElementById('backBtn');
    const closeBtn = document.getElementById('closeBtn');
    
    if (backBtn) {
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        newBackBtn.addEventListener('click', () => {
            // Al volver, restaurar el estado guardado
            goToWithTransition('ingresarMonto', {                 numeroDestino: numero,
                nombrePersonalizado: nombre
            });
        });
    }
    
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', () => {
            tempIngresarMontoData = null; // Limpiar al salir
            goToWithTransition('home');
        });
    }

    // 8. Ripple effect
    document.querySelectorAll('.header-btn').forEach(button => {
        button.addEventListener('click', function () {
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${(rect.width - size) / 2}px`;
            ripple.style.top = `${(rect.height - size) / 2}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    const cancelBtn = document.querySelector('.cancel-link');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const confirmationModal = document.getElementById('confirmationModal');
            if (confirmationModal) confirmationModal.style.display = 'none';
        });
    }
}


// Lógica para la pantalla de confirmación de yapeo
function initConfirmacionDeYapeo(datos) {
    const {
        monto = '0',
        nombre = 'Contacto',
        numero = '',
        mensaje = '',
        codigoSeguridad = '000',
        numeroOperacion = '0000000',
        destino = 'Yape',
        fechaTimestamp = null,
        esHistorial = false
    } = datos;

    // --- ACTUALIZAR EL DOM CON LOS DATOS ---
    document.getElementById('monto-resultado').textContent = monto;
    document.getElementById('nombre-resultado').textContent = nombre;
    document.getElementById('operacion-resultado').textContent = numeroOperacion;
    
    const destinoFormateado = destino.charAt(0).toUpperCase() + destino.slice(1).toLowerCase();
    document.getElementById('destino-resultado').textContent = destinoFormateado;

    // --- OCULTAR CÓDIGO DE SEGURIDAD SI NO ES YAPE ---
    const destinoNormalizado = (destino || '').trim().toLowerCase();
    const esYape = destinoNormalizado === 'yape';
    const securityRow = document.getElementById('security-row');
    const divider2 = document.getElementById('divider2');
    if (securityRow && divider2) {
        if (esYape) {
            securityRow.style.display = 'flex';
            divider2.style.display = 'block';
        } else {
            securityRow.style.display = 'none';
            divider2.style.display = 'none';
        }
    }

    // --- ÍCONO DE LOGO DE YAPE ---
    const yapeLogoImg = document.getElementById('yape-logo-img');
    if (yapeLogoImg) {
        yapeLogoImg.classList.remove('yape-logo-gif', 'yape-logo-svg');

        if (esHistorial) {
            yapeLogoImg.src = 'assets/intac.svg';
            yapeLogoImg.alt = 'Ícono de transacción';
            yapeLogoImg.classList.add('yape-logo-svg');
        } else {
            yapeLogoImg.src = 'assets/AnimationYape.gif';
            yapeLogoImg.alt = 'Animación de Yape';
            yapeLogoImg.classList.add('yape-logo-gif');        }
    }

    // --- CÓDIGO DE SEGURIDAD ---
    const contenedorCodigo = document.getElementById('codigo-seguridad');
    if (contenedorCodigo && esYape) {
        contenedorCodigo.innerHTML = '';
        codigoSeguridad.split('').forEach(digito => {
            const span = document.createElement('span');
            span.textContent = digito;
            contenedorCodigo.appendChild(span);
        });
    }

    // --- ÚLTIMOS 3 DÍGITOS ---
    let numVisible = '*** *** ***';
    if (numero.length >= 3) {
        numVisible = `*** *** ${numero.slice(-3)}`;
    } else if (numero) {
        numVisible = `*** *** ${numero.padStart(3, '*')}`;
    }
    document.getElementById('numero-resultado').textContent = numVisible;

    // --- FECHA Y HORA GUARDADA ---
    let fechaMostrar = 'Fecha no disponible';
    let horaMostrar = 'Hora no disponible';

    if (fechaTimestamp) {
        const fechaPago = new Date(fechaTimestamp);
        fechaMostrar = fechaPago.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).replace(/\./g, '');

        let horas = fechaPago.getHours();
        const minutos = fechaPago.getMinutes().toString().padStart(2, '0');
        const ampm = horas >= 12 ? 'p. m.' : 'a. m.';
        horas = (horas % 12 || 12).toString().padStart(2, '0');

        horaMostrar = `${horas}:${minutos} ${ampm}`;
    }

    document.getElementById('fecha-resultado').textContent = fechaMostrar;
    document.getElementById('hora-resultado').textContent = horaMostrar;

    // --- MENSAJE OPCIONAL ---
    const mensajeContainer = document.getElementById('mensaje-container');
    if (mensajeContainer) {
        if (mensaje && mensaje.trim() !== '') {            document.getElementById('mensaje-resultado').textContent = mensaje;
            mensajeContainer.classList.remove('hidden');
        } else {
            mensajeContainer.classList.add('hidden');
        }
    }

    // --- BOTÓN DE CERRAR ---
    const closeButton = document.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            goToWithTransition('home');
        });
    }

    // --- OCULTAR BOTONES Y AJUSTAR BANNER POR DEFECTO ---
    const buttonsContainer = document.getElementById('yape-buttons-container');
    const promoBanner = document.getElementById('promo-banner');
    
    if (buttonsContainer && promoBanner) {
        buttonsContainer.style.display = 'none';
        promoBanner.style.top = '42.5vw';

        if (datos && datos.esHistorial === true) {
            buttonsContainer.style.display = 'flex';
            promoBanner.style.top = '0vw';

            buttonsContainer.querySelector('.btn-yape.primary')?.addEventListener('click', () => {
                let numeroLimpio = (numero || '').toString().replace(/\D/g, '');
                if (numeroLimpio.length >= 9) {
                    numeroLimpio = numeroLimpio.slice(-9);
                } else if (numeroLimpio.length === 3) {
                    // No se puede reconstruir el número completo, pero sí repetir el pago con el nombre
                } else {
                    alert("No se puede repetir el pago: número inválido.");
                    return;
                }
                goToWithTransition('ingresarMonto', { 
                    numeroDestino: numeroLimpio,
                    nombrePersonalizado: nombre
                });
            });

            buttonsContainer.querySelector('.btn-yape.secondary')?.addEventListener('click', () => {
                alert("¿En qué podemos ayudarte?");
            });

            setTimeout(() => {
                const promoImg = document.getElementById("promo-img");
                if (promoImg) {                    promoImg.src = "https://vzgkmunhtwcobukrcovn.supabase.co/storage/v1/object/public/Banner/Screen_20260126_232649.webp";
                }
            }, 100);
        }
    }

    // --- CONTROL DEL VIDEO — SOLO OCULTARLO CUANDO TERMINE — SIN ELIMINARLO DEL DOM ---
    const crop = document.querySelector('.chispa-crop');
    if (crop) {
        crop.style.display = esHistorial ? 'none' : 'block';
    }

    const video = document.querySelector('.chispa-logo');
    if (video) {
        // 🔑 limpieza mínima para SPA
        video.muted = true; 
        video.pause();
        video.onended = null;
        video.currentTime = 0;

        if (esHistorial) {
            // Si viene del historial: ocultar y pausar
            video.style.display = 'none';
        } else {
            // Si es un nuevo pago: mostrar y reproducir
            video.style.display = 'block';
            video.loop = false;
            video.playbackRate = 1;

            // ✅ OCULTAR EL VIDEO CUANDO TERMINE — pero NO ELIMINARLO DEL DOM
            video.onended = () => {
                video.style.display = 'none'; // ✅ Solo ocultarlo — no eliminarlo
                video.onended = null;
            };

            // ✅ Reproducir el video después de que se cargue la pantalla
            setTimeout(() => {
                video.play().catch(e => {
                    console.warn("Error al reproducir video:", e);
                });
            }, 100);
        }
    }

    // --- AÑADIR CLASES PARA ESTILOS DE LA PANTALLA ---
    const screen = document.querySelector('.pantalla-confirmacion-de-yapeo .screen');
    if (screen) {
        screen.classList.remove('pago-nuevo', 'desde-historial');
        if (esHistorial) {
            screen.classList.add('desde-historial');
        } else {            screen.classList.add('pago-nuevo');
        }
    }
}





// Lógica para la pantalla "Historial Completo"
function initHistorialCompleto() {
    const content = document.getElementById('historial-content');
    if (!content) return;

    // Obtener todos los movimientos
    const movimientosGuardadosJSON = localStorage.getItem("movimientos");
    let movimientos = [];
    if (movimientosGuardadosJSON) {
        try {
            movimientos = JSON.parse(movimientosGuardadosJSON);
        } catch (e) {
            console.error("Error al parsear movimientos:", e);
        }
    }

    if (movimientos.length === 0) {
        content.innerHTML = '<div style="text-align:center; padding:20px; color:#888;">No hay movimientos aún.</div>';
        return;
    }

    // Agrupar movimientos por mes/año
    const grupos = {};
    movimientos.forEach(mov => {
        const fecha = new Date(mov.fechaTimestamp);
        const mesAnio = fecha.toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
        }).replace(/\./g, '');
        
        if (!grupos[mesAnio]) {
            grupos[mesAnio] = [];
        }
        grupos[mesAnio].push(mov);
    });

    // Ordenar meses de más reciente a más antiguo
    const mesesOrdenados = Object.keys(grupos).sort((a, b) => {
        const [mesA, anioA] = a.split(' ');
        const [mesB, anioB] = b.split(' ');
        const fechaA = new Date(`${anioA}-${getMesNumero(mesA)}-01`);
        const fechaB = new Date(`${anioB}-${getMesNumero(mesB)}-01`);
        return fechaB - fechaA;
    });

    // Función auxiliar para convertir nombre de mes a número
    function getMesNumero(nombreMes) {
        const meses = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'        ];
        return String(meses.indexOf(nombreMes.toLowerCase()) + 1).padStart(2, '0');
    }

    // Generar HTML
    content.innerHTML = '';
    mesesOrdenados.forEach(mesAnio => {
        const section = document.createElement('section');
        
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month';
        monthHeader.textContent = mesAnio.charAt(0).toUpperCase() + mesAnio.slice(1);
        
        const movementsList = document.createElement('div');
        movementsList.className = 'movements';
        
        grupos[mesAnio].forEach(mov => {
    const movement = document.createElement('div');
    movement.className = 'movement';
    
    // ✅ USAR LA MISMA FUNCIÓN QUE EN HOME
    const fechaLista = formatearFechaMovimiento(mov.fechaTimestamp);
    
    movement.innerHTML = `
        <div>
            <div class="name">${
                mov.destinoDetalle && mov.destinoDetalle.toLowerCase() !== 'yape' 
                    ? `${mov.destinoDetalle} - ${mov.nombre}` 
                    : mov.nombre
            }</div>
            <div class="date">${fechaLista}</div>
        </div>
        <div class="amount">${mov.monto}</div>
    `;
    
    movement.addEventListener('click', () => {
        const datosParaDetalle = {
            monto: mov.montoDetalle,
            nombre: mov.nombre,
            numero: mov.numeroDetalle,
            mensaje: mov.mensajeDetalle,
            codigoSeguridad: mov.codigoSeguridad,
            numeroOperacion: mov.numeroOperacion,
            destino: mov.destinoDetalle,
            fechaTimestamp: mov.fechaTimestamp,
            esHistorial: true
        };
        goToWithTransition('confirmacionDeYapeo', datosParaDetalle);
    });
    
    movementsList.appendChild(movement);
});
        
        section.appendChild(monthHeader);
        section.appendChild(movementsList);
        content.appendChild(section);
    });

    // Botón de cerrar
    document.getElementById('close-historial')?.addEventListener('click', () => {
        goToWithTransition('home');
    });
  
  // Dentro de initHistorialCompleto()
document.getElementById('close-historial')?.addEventListener('click', () => {
  goToWithTransition('home');
});

// 👇 NUEVO: Listener para el ícono 827.svg
document.getElementById('ir-a-registro-datos')?.addEventListener('click', () => {
  goToWithTransition('registroDatos');
});
}

// Función para eliminar movimientos
function initEliminarMovimientos() {
    const iconoUsuario = document.querySelector('.iconuser');
    if (!iconoUsuario) return;

    let modoEliminar = false;
    let movimientoAEliminar = null;

    const modal = document.getElementById('modalEliminar');
    const btnSi = document.getElementById('btnEliminarSi');
    const btnNo = document.getElementById('btnEliminarNo');

    iconoUsuario.addEventListener('click', () => {
        const container = document.querySelector('.pantalla-home');
        if (!container) return;

        modoEliminar = !modoEliminar;
        container.classList.toggle('modo-eliminar', modoEliminar);

        if (modoEliminar) {
            document.querySelectorAll('.movimiento').forEach(mov => {
                mov.style.cursor = 'pointer';
                mov.onclick = () => {
                    movimientoAEliminar = mov;
                    mov.classList.add('eliminando');
                    modal.style.display = 'flex';
                };
            });
        } else {
            document.querySelectorAll('.movimiento').forEach(mov => {
                mov.onclick = null;
                mov.classList.remove('eliminando');
                mov.style.cursor = 'default';
            });
            modal.style.display = 'none';
        }
    });

    btnSi.addEventListener('click', () => {
        if (!movimientoAEliminar) return;

        // ✅ Obtener el ID del movimiento
        const idMovimiento = parseInt(movimientoAEliminar.dataset.id);

        // ✅ Eliminar de localStorage
        let movimientosGuardados = JSON.parse(localStorage.getItem("movimientos") || "[]");
        movimientosGuardados = movimientosGuardados.filter(mov => mov.id !== idMovimiento);
        localStorage.setItem("movimientos", JSON.stringify(movimientosGuardados));

        // ✅ Eliminar de la UI
        movimientoAEliminar.remove();

        // ✅ Actualizar estado visual
        if (movimientosGuardados.length === 0) {
            document.getElementById('no-movimientos').style.display = "block";
            document.getElementById('movements-card').style.display = "none";
        }

        // ✅ Resetear estado
        modoEliminar = false;
        document.querySelector('.pantalla-home').classList.remove('modo-eliminar');
        document.querySelectorAll('.movimiento').forEach(mov => {
            mov.onclick = null;
            mov.style.cursor = 'default';
        });
        modal.style.display = 'none';
        movimientoAEliminar = null;
    });

    btnNo.addEventListener('click', () => {
        if (movimientoAEliminar) {
            movimientoAEliminar.classList.remove('eliminando');
        }
        modal.style.display = 'none';
        movimientoAEliminar = null;
    });
}

async function cargarBannerDesdeSupabase() {
    try {
        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
        const SUPABASE_URL = "https://vzgkmunhtwcobukrcovn.supabase.co";
        const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Z2ttdW5odHdjb2J1a3Jjb3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTM5MDgsImV4cCI6MjA3ODQ2OTkwOH0.bbfvHD57_ZFhU0QGP59-PAt6xaxNUgRYMmCynBHfTfQ";
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

        const { data, error } = await supabase
            .from("fixed_banners")
            .select("image_url")
            .eq("screen", "confirmacion_yapeo")
            .eq("active", true)
            .limit(1)
            .single();

        if (error || !data) {
            console.log("No hay banner activo para confirmación");
            return null;
        }
        return data.image_url;
    } catch (err) {
        console.error("Error al cargar banner de confirmación:", err);
        return null;
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  // ✅ Precargar video (siempre)
  precargarVideoConfirmacion();
  precargarBannerConfirmacion();

  // ✅ Mostrar splash screen
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.style.display = 'flex'; // Asegurar que se muestre
  }

  setTimeout(() => {
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash.style.display = 'none', 300);
    }

    // 👇 TU LÓGICA EXACTA (sin cambios)
    try {
      const isFirstSession = !sessionStorage.getItem('appLaunched');
      const hasUserData = localStorage.getItem('appStatus') === 'ready' && localStorage.getItem('yapePin');

      if (isFirstSession) {
        sessionStorage.setItem('appLaunched', 'true');
        if (!hasUserData) {
          localStorage.clear();
          goToWithTransition('inicio');
          return;
        }
      }

      if (hasUserData) {
        goToWithTransition('ingresarClave');
      } else {
        goToWithTransition('inicio');
      }
    } catch (e) {
      console.error("Error al iniciar:", e);
      localStorage.clear();
      goToWithTransition('inicio');
    }
  }, 1000); // ← Espera 2s para el splash
});
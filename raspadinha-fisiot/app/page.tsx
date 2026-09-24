'use client';

import { useEffect, useRef } from 'react';

const WHATSAPP_NUMBER = '5531992594953';
const WHATSAPP_HELP_TEXT = encodeURIComponent(
  'Olá! Não recebi meu código da raspadinha da Caminhada FISIOT por Elas.'
);
const WHATSAPP_REVEAL_TEXT = encodeURIComponent(
  'Olá! Raspei minha raspadinha da Caminhada FISIOT por Elas e quero saber mais sobre minha surpresa 🎁'
);

export default function HomePage() {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputRowRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLParagraphElement>(null);
  const accessSectionRef = useRef<HTMLElement>(null);
  const scratchSectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const scratchPrizeRef = useRef<HTMLDivElement>(null);
  const prizeMedalRef = useRef<HTMLSpanElement>(null);
  const prizeTitleRef = useRef<HTMLHeadingElement>(null);
  const prizeTextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const form = formRef.current!;
    const input = inputRef.current!;
    const inputRow = inputRowRef.current!;
    const msg = msgRef.current!;
    const accessSection = accessSectionRef.current!;
    const scratchSection = scratchSectionRef.current!;
    const canvas = canvasRef.current!;
    const confettiCanvas = confettiCanvasRef.current!;
    const submitBtn = submitBtnRef.current!;
    const scratchPrize = scratchPrizeRef.current!;
    const prizeMedal = prizeMedalRef.current!;
    const prizeTitle = prizeTitleRef.current!;
    const prizeText = prizeTextRef.current!;

    const ctx = canvas.getContext('2d')!;
    const cctx = confettiCanvas.getContext('2d')!;

    let scratching = false;
    let revealed = false;
    let lastCheck = 0;
    let submitting = false;

    // Resultado do participante, vindo do backend após validar o código.
    // Mostra somente o resultado desta pessoa — nunca números, faixas ou regras internas.
    function applyResult(prize: string | null) {
      if (prize) {
        scratchPrize.classList.add('is-winner');
        prizeMedal.textContent = '🎉';
        prizeTitle.textContent = 'Parabéns, você ganhou! 🎁';
        prizeText.textContent = `Você ganhou: ${prize}. Fale com a organização pelo WhatsApp para combinar a retirada.`;
      } else {
        scratchPrize.classList.remove('is-winner');
        prizeMedal.textContent = '🎗️';
        prizeTitle.textContent = 'Obrigada por participar! 💗';
        prizeText.textContent =
          'Sua raspadinha apoia a campanha de prevenção da Caminhada FISIOT por Elas. Continue com a gente!';
      }
    }

    function showError(text: string) {
      msg.textContent = text;
      msg.className = 'form-msg error';
      inputRow.classList.add('invalid');
      setTimeout(() => inputRow.classList.remove('invalid'), 420);
    }

    function showOk(text: string) {
      msg.textContent = text;
      msg.className = 'form-msg ok';
    }

    function showPending(text: string) {
      msg.textContent = text;
      msg.className = 'form-msg';
    }

    async function handleSubmit(e: Event) {
      e.preventDefault();
      if (submitting) return;

      const raw = input.value;
      const code = String(raw || '').trim().toUpperCase();

      if (!code) {
        showError('Digite o código que você recebeu para continuar.');
        return;
      }

      submitting = true;
      submitBtn.disabled = true;
      showPending('Verificando seu código…');

      try {
        const res = await fetch('/api/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const data = await res.json();

        if (data.ok) {
          showOk('Código válido! Preparando sua raspadinha…');
          applyResult(data.prize ?? null);
          unlockScratch();
        } else {
          showError(data.error || 'Código inválido. Confira com a organização e tente novamente.');
        }
      } catch {
        showError('Não foi possível verificar agora. Confira sua conexão e tente novamente.');
      } finally {
        submitting = false;
        submitBtn.disabled = false;
      }
    }

    function unlockScratch() {
      setTimeout(() => {
        accessSection.style.display = 'none';
        scratchSection.classList.add('is-active');
        scratchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setupCanvas();
      }, 420);
    }

    function handleTryAnother() {
      scratchSection.classList.remove('is-active');
      scratchPrize.classList.remove('is-winner');
      accessSection.style.display = '';
      input.value = '';
      msg.textContent = '';
      msg.className = 'form-msg';
      revealed = false;
      accessSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => input.focus(), 400);
    }

    function setupCanvas() {
      const frame = canvas.parentElement!;
      const rect = frame.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      canvas.style.opacity = '1';
      canvas.style.display = 'block';
      canvas.style.transition = 'opacity .6s ease';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      revealed = false;

      drawFoil(rect.width, rect.height);
      attachPointerEvents();
    }

    function drawFoil(w: number, h: number) {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#d9497e');
      grad.addColorStop(0.5, '#8a67c6');
      grad.addColorStop(1, '#24a98d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalAlpha = 0.14;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let x = -h; x < w + h; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.font = '700 ' + Math.max(16, w * 0.065) + "px 'Libre Franklin', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RASPE AQUI', w / 2, h / 2 - h * 0.08);
      ctx.font = '400 ' + Math.max(12, w * 0.04) + "px 'Libre Franklin', sans-serif";
      ctx.fillText('🎗️ Caminhada FISIOT por Elas', w / 2, h / 2 + h * 0.1);
      ctx.restore();
    }

    function getPos(evt: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    }

    function scratchAt(x: number, y: number) {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function attachPointerEvents() {
      canvas.onpointerdown = (e) => {
        scratching = true;
        canvas.setPointerCapture(e.pointerId);
        const p = getPos(e);
        scratchAt(p.x, p.y);
      };
      canvas.onpointermove = (e) => {
        if (!scratching) return;
        const p = getPos(e);
        scratchAt(p.x, p.y);
        throttledCheck();
      };
      canvas.onpointerup = () => {
        scratching = false;
        checkRevealProgress();
      };
      canvas.onpointerleave = () => {
        scratching = false;
      };
      canvas.onpointercancel = () => {
        scratching = false;
      };
    }

    function throttledCheck() {
      const now = Date.now();
      if (now - lastCheck < 160) return;
      lastCheck = now;
      checkRevealProgress();
    }

    function checkRevealProgress() {
      if (revealed) return;
      const w = canvas.width,
        h = canvas.height;
      let data: Uint8ClampedArray;
      try {
        data = ctx.getImageData(0, 0, w, h).data;
      } catch {
        return;
      }
      let total = 0,
        cleared = 0;
      const step = 40;
      for (let i = 3; i < data.length; i += step) {
        total++;
        if (data[i] === 0) cleared++;
      }
      const pct = cleared / total;
      if (pct > 0.5) completeReveal();
    }

    function completeReveal() {
      if (revealed) return;
      revealed = true;
      canvas.style.opacity = '0';
      setTimeout(() => {
        canvas.style.display = 'none';
        canvas.onpointerdown = canvas.onpointermove = canvas.onpointerup = null;
      }, 620);
      launchConfetti();
    }

    function handleRevealAll() {
      completeReveal();
    }

    const confettiColors = ['#d9497e', '#8a67c6', '#4bc9ac', '#f0d18f', '#e9769f'];

    function resizeConfetti() {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }

    function launchConfetti() {
      type Piece = {
        x: number; y: number; w: number; h: number; rot: number;
        vRot: number; vy: number; vx: number; color: string;
      };
      const pieces: Piece[] = [];
      const count = 90;
      for (let i = 0; i < count; i++) {
        pieces.push({
          x: Math.random() * confettiCanvas.width,
          y: -20 - Math.random() * 200,
          w: 6 + Math.random() * 6,
          h: 8 + Math.random() * 8,
          rot: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.3,
          vy: 2 + Math.random() * 3,
          vx: (Math.random() - 0.5) * 2,
          color: confettiColors[i % confettiColors.length],
        });
      }
      const start = Date.now();
      function frame() {
        const elapsed = Date.now() - start;
        cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        pieces.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vRot;
          cctx.save();
          cctx.translate(p.x, p.y);
          cctx.rotate(p.rot);
          cctx.fillStyle = p.color;
          cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          cctx.restore();
        });
        if (elapsed < 2600) {
          requestAnimationFrame(frame);
        } else {
          cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
      }
      requestAnimationFrame(frame);
    }

    function handleWindowResize() {
      if (scratchSection.classList.contains('is-active') && !revealed) {
        setupCanvas();
      }
    }

    form.addEventListener('submit', handleSubmit);
    const tryAnotherBtn = document.getElementById('try-another-btn');
    const revealAllBtn = document.getElementById('reveal-all-btn');
    tryAnotherBtn?.addEventListener('click', handleTryAnother);
    revealAllBtn?.addEventListener('click', handleRevealAll);
    window.addEventListener('resize', resizeConfetti);
    window.addEventListener('resize', handleWindowResize);
    resizeConfetti();

    return () => {
      form.removeEventListener('submit', handleSubmit);
      tryAnotherBtn?.removeEventListener('click', handleTryAnother);
      revealAllBtn?.removeEventListener('click', handleRevealAll);
      window.removeEventListener('resize', resizeConfetti);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return (
    <div className="wrap">
      <header className="site-header">
        <div className="brandmark">
          <img src="/assets/logo-fisiot.jpg" alt="FISIOT" />
          <div className="txt">
            <b>Raspadinha FISIOT por Elas</b>
            <span>Outubro Rosa · 1ª Caminhada Contra o Câncer</span>
          </div>
        </div>
        <a className="back-link" href="https://caminhadafisiotporelas.com.br" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar para a Caminhada
        </a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="ribbon-tag">🎗️ Outubro Rosa · FISIOT por Elas</span>
          <h1>
            Sua raspadinha está <em>te esperando</em>
          </h1>
          <p className="lead">
            Quem recebeu um código da organização da Caminhada pode liberar a sua raspadinha
            digital agora mesmo e descobrir uma surpresa especial preparada com muito carinho.
          </p>
          <div className="steps-mini">
            <span>
              <i>1</i> Receba seu código
            </span>
            <span>
              <i>2</i> Desbloqueie aqui
            </span>
            <span>
              <i>3</i> Raspe e revele
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="blob"></div>
          <span className="sparkle s1">✨</span>
          <span className="sparkle s2">🎀</span>
          <span className="sparkle s3">💗</span>
          <div className="poster-card">
            <span className="poster-card-badge">Arte oficial aprovada</span>
            <img
              className="poster-card-img"
              src="/assets/cartaz-raspadinha-prevencao.jpg"
              alt="Cartaz oficial da 1ª Raspadinha da Prevenção FISIOT por Elas: raspe e descubra se você ganhou, ganhe até R$ 300 em produtos Bellamama Cosméticos, 70% do valor arrecadado será destinado ao IREFIS — Outubro Rosa, movimento pela saúde, prevenção pela vida"
              width={911}
              height={1600}
              loading="eager"
            />
          </div>
        </div>
      </section>

      <section className="access-section" id="acesso" ref={accessSectionRef}>
        <div className="access-card">
          <span className="tape" aria-hidden="true"></span>
          <h2>Seu código de acesso</h2>
          <p className="hint">Digite abaixo o código que você recebeu da organização.</p>
          <form className="code-form" id="unlock-form" ref={formRef} noValidate>
            <label htmlFor="code-input">Código de acesso</label>
            <div className="code-input-row" id="code-input-row" ref={inputRowRef}>
              <input
                type="text"
                id="code-input"
                name="code"
                placeholder="Ex.: FISIOT-XXXXXX"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                inputMode="text"
                ref={inputRef}
              />
            </div>
            <button type="submit" className="btn-unlock" ref={submitBtnRef}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Desbloquear minha raspadinha
            </button>
            <p className="form-msg" id="form-msg" role="status" aria-live="polite" ref={msgRef}></p>
          </form>
          <div className="help-row">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_HELP_TEXT}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 32 32" fill="currentColor">
                <path d="M16.02 2.67C8.65 2.67 2.67 8.65 2.67 16.02c0 2.6.73 5.03 2 7.1L2.67 29.33l6.4-1.98a13.3 13.3 0 0 0 6.95 1.95c7.37 0 13.35-5.98 13.35-13.35S23.39 2.67 16.02 2.67zm0 24.3c-2.2 0-4.24-.64-5.96-1.75l-.43-.26-3.86 1.2 1.22-3.73-.28-.44a11.14 11.14 0 0 1-1.72-5.97c0-6.15 5-11.15 11.15-11.15s11.15 5 11.15 11.15-5 11.15-11.15 11.15zm6.2-8.36c-.34-.17-2-1-2.3-1.1-.31-.11-.54-.17-.76.17-.23.34-.87 1.1-1.07 1.33-.2.23-.4.25-.73.08-.34-.17-1.43-.53-2.72-1.7-1-.9-1.68-2-1.87-2.34-.2-.34-.02-.52.15-.69.15-.15.34-.4.5-.6.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.08-.17-.76-1.84-1.04-2.52-.27-.65-.55-.56-.76-.57-.2-.01-.43-.01-.66-.01-.23 0-.6.08-.92.43-.31.34-1.2 1.18-1.2 2.86 0 1.69 1.23 3.32 1.4 3.55.17.23 2.42 3.71 5.88 5.2.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2-.82 2.28-1.6.28-.78.28-1.46.2-1.6-.08-.14-.31-.23-.65-.4z" />
              </svg>
              Não recebeu seu código? Falar com a organização
            </a>
          </div>
        </div>
      </section>

      <section className="scratch-section" id="raspadinha" ref={scratchSectionRef}>
        <div className="scratch-card-shell">
          <h2>Raspe e revele sua surpresa 🎁</h2>
          <p className="instructions">Use o dedo no celular ou arraste o mouse sobre a área abaixo.</p>

          <div className="scratch-frame">
            <div className="scratch-prize" ref={scratchPrizeRef}>
              <span className="medal" ref={prizeMedalRef}>🎗️</span>
              <h3 ref={prizeTitleRef}>Surpresa especial da Caminhada FISIOT por Elas</h3>
              <p ref={prizeTextRef}>Para saber os detalhes da sua surpresa, fale com a organização pelo WhatsApp.</p>
            </div>
            <canvas className="scratch-canvas" id="scratch-canvas" ref={canvasRef}></canvas>
          </div>

          <div className="scratch-actions">
            <button className="btn-ghost" id="reveal-all-btn" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Já raspei, revelar tudo
            </button>
            <a
              className="btn-solid"
              id="whatsapp-reveal-btn"
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_REVEAL_TEXT}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 32 32" fill="currentColor">
                <path d="M16.02 2.67C8.65 2.67 2.67 8.65 2.67 16.02c0 2.6.73 5.03 2 7.1L2.67 29.33l6.4-1.98a13.3 13.3 0 0 0 6.95 1.95c7.37 0 13.35-5.98 13.35-13.35S23.39 2.67 16.02 2.67z" />
              </svg>
              Falar com a organização
            </a>
            <button className="btn-ghost" id="try-another-btn" type="button">
              Testar outro código
            </button>
          </div>
          <p className="reveal-note">
            Cada código é pessoal e de uso único. Os detalhes da sua surpresa são combinados diretamente com a
            organização pelo WhatsApp.
          </p>
        </div>
      </section>

      <section className="how-section">
        <div className="section-title">
          <span className="eyebrow">Como funciona</span>
          <h2>Simples, rápido e acolhedor</h2>
          <p>Pensado para quem apoiou a 1ª Caminhada Contra o Câncer — FISIOT por Elas.</p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="num">1</div>
            <h3>Você recebe um código</h3>
            <p>A organização entrega um código pessoal, pelo WhatsApp ou presencialmente na Caminhada.</p>
          </div>
          <div className="step-card">
            <div className="num">2</div>
            <h3>Você libera a raspadinha</h3>
            <p>Digite o código no campo acima para desbloquear a sua raspadinha digital.</p>
          </div>
          <div className="step-card">
            <div className="num">3</div>
            <h3>Você raspa e revela</h3>
            <p>Raspe com o dedo ou o mouse e receba orientações sobre sua surpresa pelo WhatsApp.</p>
          </div>
        </div>
      </section>

      <section className="support-section">
        <div className="support-inner">
          <p className="label">Uma iniciativa de apoio à Caminhada FISIOT por Elas</p>
          <div className="logo-row">
            <img src="/assets/logo-irefis.jpg" alt="Instituto IREFIS — Instituto de Reabilitação FISIOT em Saúde" />
            <img src="/assets/logo-fisiot.jpg" alt="FISIOT — 15 anos, desde 1996" />
            <img src="/assets/logo-bellamama.jpg" alt="Bellamama Cosméticos" />
            <img src="/assets/logo-rede-olho-cancer.jpg" alt="Rede de Olho no Câncer" />
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="section-title">
          <span className="eyebrow">Dúvidas rápidas</span>
          <h2>Perguntas frequentes</h2>
        </div>
        <div className="faq-list">
          <details className="faq-item">
            <summary>Não recebi nenhum código, o que eu faço?</summary>
            <p className="faq-a">
              Fale com a organização da Caminhada FISIOT por Elas pelo WhatsApp (31) 99259-4953 — o botão de
              contato está logo acima do campo de código.
            </p>
          </details>
          <details className="faq-item">
            <summary>Posso usar meu código mais de uma vez?</summary>
            <p className="faq-a">
              Não. Cada código é pessoal e de uso único: depois de raspado, ele não pode ser usado novamente. Em
              caso de dúvida sobre o seu, entre em contato pelo WhatsApp.
            </p>
          </details>
          <details className="faq-item">
            <summary>A raspadinha funciona no celular?</summary>
            <p className="faq-a">
              Sim! A raspadinha responde ao toque no celular e ao mouse no computador. Se preferir, use o botão
              &quot;Já raspei, revelar tudo&quot; para revelar de uma vez.
            </p>
          </details>
          <details className="faq-item">
            <summary>Isso é a página oficial da Caminhada?</summary>
            <p className="faq-a">
              Esta é a raspadinha de apoio à Caminhada FISIOT por Elas. A página completa do evento fica em
              caminhadafisiotporelas.com.br.
            </p>
          </details>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-grid">
          <a className="footer-cta" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 32 32" fill="currentColor">
              <path d="M16.02 2.67C8.65 2.67 2.67 8.65 2.67 16.02c0 2.6.73 5.03 2 7.1L2.67 29.33l6.4-1.98a13.3 13.3 0 0 0 6.95 1.95c7.37 0 13.35-5.98 13.35-13.35S23.39 2.67 16.02 2.67z" />
            </svg>
            Falar no WhatsApp
          </a>
          <div className="footer-links">
            <a href="https://caminhadafisiotporelas.com.br" target="_blank" rel="noopener noreferrer">
              Site oficial da Caminhada
            </a>
          </div>
        </div>
        <p className="footer-fine">
          © Instituto IREFIS — Raspadinha FISIOT por Elas. Uma iniciativa de apoio à 1ª Caminhada Contra o
          Câncer — FISIOT por Elas.
        </p>
      </footer>

      <canvas id="confetti-canvas" aria-hidden="true" ref={confettiCanvasRef}></canvas>
    </div>
  );
}

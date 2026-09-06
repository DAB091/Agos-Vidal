import { useState, useRef, useEffect } from 'react';

/* =========================================================================
   DATA: articulation-unit dictionary
   Each unit has a placeholder image path and an optional (currently null)
   audio path, so real recordings can be dropped in later without touching
   any logic below.
   ========================================================================= */

const UNIT_ORDER = [
  'A', 'B/V', 'CH', 'D', 'E', 'F', 'G', 'I', 'J', 'K/C/Q', 'L', 'LL',
  'M', 'N', 'Ñ', 'O', 'P', 'R', 'RR', 'S', 'T', 'U', 'X', 'Z',
];

const fileSafe = (unit) => unit.replace(/\//g, '');

const ARTICULATION_UNITS = UNIT_ORDER.reduce((acc, unit) => {
  acc[unit] = {
    image: `/images/articulation/${fileSafe(unit)}.png`,
    audio: null, // e.g. later: `/audio/phonemes/${fileSafe(unit)}.mp3`
  };
  return acc;
}, {});

/* =========================================================================
   DATA: word bank
   Every word explicitly defines its own articulation segmentation as a
   sequence of { unit, letters } pairs. "letters" is the literal slice of
   the word that produces that unit's sound, so segmentation is authoritative
   per word rather than inferred from spelling (e.g. an initial "R" is
   segmented as the "RR" unit because word-initial R is always trilled in
   Spanish, while the "R" in "PERA" is a single intervocalic flap).
   ========================================================================= */

const WORDS = [
  { id: 1, word: 'PERRO', image: '/images/words/perro.png', articulation: [
    { unit: 'P', letters: 'P' }, { unit: 'E', letters: 'E' }, { unit: 'RR', letters: 'RR' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 2, word: 'GATO', image: '/images/words/gato.png', articulation: [
    { unit: 'G', letters: 'G' }, { unit: 'A', letters: 'A' }, { unit: 'T', letters: 'T' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 3, word: 'CASA', image: '/images/words/casa.png', articulation: [
    { unit: 'K/C/Q', letters: 'C' }, { unit: 'A', letters: 'A' }, { unit: 'S', letters: 'S' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 4, word: 'QUESO', image: '/images/words/queso.png', articulation: [
    { unit: 'K/C/Q', letters: 'QU' }, { unit: 'E', letters: 'E' }, { unit: 'S', letters: 'S' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 5, word: 'CHUPETE', image: '/images/words/chupete.png', articulation: [
    { unit: 'CH', letters: 'CH' }, { unit: 'U', letters: 'U' }, { unit: 'P', letters: 'P' },
    { unit: 'E', letters: 'E' }, { unit: 'T', letters: 'T' }, { unit: 'E', letters: 'E' },
  ]},
  { id: 6, word: 'CHOCOLATE', image: '/images/words/chocolate.png', articulation: [
    { unit: 'CH', letters: 'CH' }, { unit: 'O', letters: 'O' }, { unit: 'K/C/Q', letters: 'C' }, { unit: 'O', letters: 'O' },
    { unit: 'L', letters: 'L' }, { unit: 'A', letters: 'A' }, { unit: 'T', letters: 'T' }, { unit: 'E', letters: 'E' },
  ]},
  { id: 7, word: 'LLAVE', image: '/images/words/llave.png', articulation: [
    { unit: 'LL', letters: 'LL' }, { unit: 'A', letters: 'A' }, { unit: 'B/V', letters: 'V' }, { unit: 'E', letters: 'E' },
  ]},
  { id: 8, word: 'LLUVIA', image: '/images/words/lluvia.png', articulation: [
    { unit: 'LL', letters: 'LL' }, { unit: 'U', letters: 'U' }, { unit: 'B/V', letters: 'V' }, { unit: 'I', letters: 'I' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 9, word: 'BEBÉ', image: '/images/words/bebe.png', articulation: [
    { unit: 'B/V', letters: 'B' }, { unit: 'E', letters: 'E' }, { unit: 'B/V', letters: 'B' }, { unit: 'E', letters: 'É' },
  ]},
  { id: 10, word: 'VACA', image: '/images/words/vaca.png', articulation: [
    { unit: 'B/V', letters: 'V' }, { unit: 'A', letters: 'A' }, { unit: 'K/C/Q', letters: 'C' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 11, word: 'DADO', image: '/images/words/dado.png', articulation: [
    { unit: 'D', letters: 'D' }, { unit: 'A', letters: 'A' }, { unit: 'D', letters: 'D' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 12, word: 'DINOSAURIO', image: '/images/words/dinosaurio.png', articulation: [
    { unit: 'D', letters: 'D' }, { unit: 'I', letters: 'I' }, { unit: 'N', letters: 'N' }, { unit: 'O', letters: 'O' },
    { unit: 'S', letters: 'S' }, { unit: 'A', letters: 'A' }, { unit: 'U', letters: 'U' }, { unit: 'R', letters: 'R' },
    { unit: 'I', letters: 'I' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 13, word: 'FOCA', image: '/images/words/foca.png', articulation: [
    { unit: 'F', letters: 'F' }, { unit: 'O', letters: 'O' }, { unit: 'K/C/Q', letters: 'C' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 14, word: 'FUEGO', image: '/images/words/fuego.png', articulation: [
    { unit: 'F', letters: 'F' }, { unit: 'U', letters: 'U' }, { unit: 'E', letters: 'E' }, { unit: 'G', letters: 'G' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 15, word: 'GALLETA', image: '/images/words/galleta.png', articulation: [
    { unit: 'G', letters: 'G' }, { unit: 'A', letters: 'A' }, { unit: 'LL', letters: 'LL' }, { unit: 'E', letters: 'E' },
    { unit: 'T', letters: 'T' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 16, word: 'JIRAFA', image: '/images/words/jirafa.png', articulation: [
    { unit: 'J', letters: 'J' }, { unit: 'I', letters: 'I' }, { unit: 'R', letters: 'R' }, { unit: 'A', letters: 'A' },
    { unit: 'F', letters: 'F' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 17, word: 'JUGO', image: '/images/words/jugo.png', articulation: [
    { unit: 'J', letters: 'J' }, { unit: 'U', letters: 'U' }, { unit: 'G', letters: 'G' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 18, word: 'CASCO', image: '/images/words/casco.png', articulation: [
    { unit: 'K/C/Q', letters: 'C' }, { unit: 'A', letters: 'A' }, { unit: 'S', letters: 'S' },
    { unit: 'K/C/Q', letters: 'C' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 19, word: 'LUNA', image: '/images/words/luna.png', articulation: [
    { unit: 'L', letters: 'L' }, { unit: 'U', letters: 'U' }, { unit: 'N', letters: 'N' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 20, word: 'LÁPIZ', image: '/images/words/lapiz.png', articulation: [
    { unit: 'L', letters: 'L' }, { unit: 'A', letters: 'Á' }, { unit: 'P', letters: 'P' }, { unit: 'I', letters: 'I' }, { unit: 'Z', letters: 'Z' },
  ]},
  { id: 21, word: 'LEÓN', image: '/images/words/leon.png', articulation: [
    { unit: 'L', letters: 'L' }, { unit: 'E', letters: 'E' }, { unit: 'O', letters: 'Ó' }, { unit: 'N', letters: 'N' },
  ]},
  { id: 22, word: 'MAMÁ', image: '/images/words/mama.png', articulation: [
    { unit: 'M', letters: 'M' }, { unit: 'A', letters: 'A' }, { unit: 'M', letters: 'M' }, { unit: 'A', letters: 'Á' },
  ]},
  { id: 23, word: 'MANO', image: '/images/words/mano.png', articulation: [
    { unit: 'M', letters: 'M' }, { unit: 'A', letters: 'A' }, { unit: 'N', letters: 'N' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 24, word: 'MONO', image: '/images/words/mono.png', articulation: [
    { unit: 'M', letters: 'M' }, { unit: 'O', letters: 'O' }, { unit: 'N', letters: 'N' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 25, word: 'NUBE', image: '/images/words/nube.png', articulation: [
    { unit: 'N', letters: 'N' }, { unit: 'U', letters: 'U' }, { unit: 'B/V', letters: 'B' }, { unit: 'E', letters: 'E' },
  ]},
  { id: 26, word: 'NIÑO', image: '/images/words/nino.png', articulation: [
    { unit: 'N', letters: 'N' }, { unit: 'I', letters: 'I' }, { unit: 'Ñ', letters: 'Ñ' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 27, word: 'PIJAMA', image: '/images/words/pijama.png', articulation: [
    { unit: 'P', letters: 'P' }, { unit: 'I', letters: 'I' }, { unit: 'J', letters: 'J' },
    { unit: 'A', letters: 'A' }, { unit: 'M', letters: 'M' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 28, word: 'PATO', image: '/images/words/pato.png', articulation: [
    { unit: 'P', letters: 'P' }, { unit: 'A', letters: 'A' }, { unit: 'T', letters: 'T' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 29, word: 'PELOTA', image: '/images/words/pelota.png', articulation: [
    { unit: 'P', letters: 'P' }, { unit: 'E', letters: 'E' }, { unit: 'L', letters: 'L' },
    { unit: 'O', letters: 'O' }, { unit: 'T', letters: 'T' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 30, word: 'PERA', image: '/images/words/pera.png', articulation: [
    { unit: 'P', letters: 'P' }, { unit: 'E', letters: 'E' }, { unit: 'R', letters: 'R' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 31, word: 'CARRO', image: '/images/words/carro.png', articulation: [
    { unit: 'K/C/Q', letters: 'C' }, { unit: 'A', letters: 'A' }, { unit: 'RR', letters: 'RR' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 32, word: 'RATÓN', image: '/images/words/raton.png', articulation: [
    { unit: 'RR', letters: 'R' }, { unit: 'A', letters: 'A' }, { unit: 'T', letters: 'T' }, { unit: 'O', letters: 'Ó' }, { unit: 'N', letters: 'N' },
  ]},
  { id: 33, word: 'SAPO', image: '/images/words/sapo.png', articulation: [
    { unit: 'S', letters: 'S' }, { unit: 'A', letters: 'A' }, { unit: 'P', letters: 'P' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 34, word: 'SOPA', image: '/images/words/sopa.png', articulation: [
    { unit: 'S', letters: 'S' }, { unit: 'O', letters: 'O' }, { unit: 'P', letters: 'P' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 35, word: 'TREN', image: '/images/words/tren.png', articulation: [
    { unit: 'T', letters: 'T' }, { unit: 'R', letters: 'R' }, { unit: 'E', letters: 'E' }, { unit: 'N', letters: 'N' },
  ]},
  { id: 36, word: 'UVA', image: '/images/words/uva.png', articulation: [
    { unit: 'U', letters: 'U' }, { unit: 'B/V', letters: 'V' }, { unit: 'A', letters: 'A' },
  ]},
  { id: 37, word: 'OSO', image: '/images/words/oso.png', articulation: [
    { unit: 'O', letters: 'O' }, { unit: 'S', letters: 'S' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 38, word: 'XILÓFONO', image: '/images/words/xilofono.png', articulation: [
    { unit: 'X', letters: 'X' }, { unit: 'I', letters: 'I' }, { unit: 'L', letters: 'L' }, { unit: 'O', letters: 'Ó' },
    { unit: 'F', letters: 'F' }, { unit: 'O', letters: 'O' }, { unit: 'N', letters: 'N' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 39, word: 'ZAPATO', image: '/images/words/zapato.png', articulation: [
    { unit: 'Z', letters: 'Z' }, { unit: 'A', letters: 'A' }, { unit: 'P', letters: 'P' },
    { unit: 'A', letters: 'A' }, { unit: 'T', letters: 'T' }, { unit: 'O', letters: 'O' },
  ]},
  { id: 40, word: 'ZORRO', image: '/images/words/zorro.png', articulation: [
    { unit: 'Z', letters: 'Z' }, { unit: 'O', letters: 'O' }, { unit: 'RR', letters: 'RR' }, { unit: 'O', letters: 'O' },
  ]},
];

/* =========================================================================
   Helpers
   ========================================================================= */

// Fisher-Yates shuffle
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Case-insensitive, accent-insensitive comparison that still treats Ñ as its
// own letter (never collapsed into N).
const NTILDE_PLACEHOLDER = '\u0001';
function normalizeForCompare(str) {
  return str
    .toUpperCase()
    .replace(/Ñ/g, NTILDE_PLACEHOLDER)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(new RegExp(NTILDE_PLACEHOLDER, 'g'), 'Ñ');
}

function isAnswerCorrect(word, rawInput) {
  const trimmed = rawInput.trim();
  if (!trimmed) return false;
  return normalizeForCompare(trimmed) === normalizeForCompare(word.word);
}

// Derives articulation progress purely from the current input + the word's
// explicit segmentation. Recomputed from scratch every time (rather than
// mutated incrementally) so Backspace always lands on the correct state.
function getArticulationState(word, rawInput) {
  const target = normalizeForCompare(word.word);
  const typed = normalizeForCompare(rawInput);

  let matchLen = 0;
  while (
    matchLen < typed.length &&
    matchLen < target.length &&
    typed[matchLen] === target[matchLen]
  ) {
    matchLen++;
  }

  let cumulative = 0;
  let completedCount = 0;
  for (let i = 0; i < word.articulation.length; i++) {
    cumulative += normalizeForCompare(word.articulation[i].letters).length;
    if (matchLen >= cumulative) {
      completedCount = i + 1;
    } else {
      break;
    }
  }

  const currentIndex =
    completedCount < word.articulation.length ? completedCount : word.articulation.length - 1;
  const isComplete = typed.length > 0 && typed === target;

  return { completedCount, currentIndex, isComplete };
}

/* =========================================================================
   Small shared components
   ========================================================================= */

function MissingImage({ label, expectedPath, size = 'normal' }) {
  return (
    <div className={`missing-image missing-image--${size}`} role="img" aria-label={`Imagen pendiente: ${label}`}>
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" className="missing-image__icon">
        <rect x="6" y="10" width="36" height="28" rx="4" />
        <circle cx="17" cy="20" r="3.5" />
        <path d="M10 33l9-9 6 6 8-9 5 6" />
      </svg>
      <span className="missing-image__label">Imagen pendiente</span>
      {expectedPath && <span className="missing-image__path">{expectedPath}</span>}
    </div>
  );
}

function ImageWithFallback({ src, alt, size = 'normal' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (failed) {
    return <MissingImage label={alt} expectedPath={src} size={size} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`asset-image asset-image--${size}`}
      onError={() => setFailed(true)}
    />
  );
}

function AudioButton({ audio, unitLabel }) {
  const audioRef = useRef(null);

  if (!audio) return null;

  const play = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audio);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  return (
    <button
      type="button"
      className="audio-button"
      onClick={play}
      aria-label={`Escuchar el sonido de ${unitLabel}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 9v6h4l5 5V4L8 9H4z" />
        <path d="M16.5 8.5a5 5 0 010 7" fill="none" strokeWidth="2" strokeLinecap="round" />
      </svg>
      Escuchar
    </button>
  );
}

function InstitutionalSignature() {
  return (
    <div className="signature">
      <p className="signature__name">Psicopedagoga Agostina Vidal</p>
      <p className="signature__place">Santiago del Estero · Añatuya</p>
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      <div className="progress-bar__track">
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FeedbackMessage({ feedback }) {
  if (!feedback) return null;
  return (
    <p className={`feedback feedback--${feedback.type}`} role="status" aria-live="polite">
      <span className="feedback__icon" aria-hidden="true">
        {feedback.type === 'success' ? (
          <svg viewBox="0 0 24 24" focusable="false"><path d="M5 13l4 4 10-10" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" focusable="false"><circle cx="12" cy="12" r="9" fill="none" strokeWidth="2" /><path d="M12 8v5" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="16" r="1" /></svg>
        )}
      </span>
      {feedback.message}
    </p>
  );
}

function ArticulationSequence({ articulation, currentIndex, completedCount }) {
  return (
    <ol className="unit-sequence" aria-label="Progreso de unidades de articulación">
      {articulation.map((seg, i) => {
        const status = i < completedCount ? 'done' : i === currentIndex ? 'current' : 'pending';
        return (
          <li key={`${seg.unit}-${i}`} className={`unit-sequence__item unit-sequence__item--${status}`}>
            <span className="unit-sequence__mark" aria-hidden="true">
              {status === 'done' ? '✓' : status === 'current' ? '●' : '○'}
            </span>
            <span className="unit-sequence__label">{seg.unit}</span>
            <span className="unit-sequence__status">
              {status === 'done' ? 'completada' : status === 'current' ? 'actual' : 'pendiente'}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* =========================================================================
   Exercise screens
   ========================================================================= */

function RecognitionExercise({ word, onCorrect }) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [solved, setSolved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (solved) return;
    if (isAnswerCorrect(word, input)) {
      setFeedback({ type: 'success', message: '¡Muy bien! Reconociste la palabra.' });
      setSolved(true);
    } else {
      setFeedback({ type: 'retry', message: '¡Casi! Mirá nuevamente la imagen e intentá otra vez.' });
    }
  };

  return (
    <div className="exercise-block fade-in">
      <p className="exercise-step-label">Actividad 1 de 2</p>
      <h3 className="exercise-heading">¿Qué ves?</h3>
      <p className="exercise-subheading">Escribí su nombre.</p>

      <div className="exercise-image-wrap">
        <ImageWithFallback src={word.image} alt={`Imagen de ${word.word.toLowerCase()}`} size="large" />
      </div>

      <form onSubmit={handleSubmit} className="exercise-form">
        <label htmlFor="recognition-input" className="visually-hidden">
          Escribí el nombre de la imagen
        </label>
        <input
          id="recognition-input"
          type="text"
          className="text-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (feedback?.type === 'retry') setFeedback(null);
          }}
          disabled={solved}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          placeholder="Escribí acá..."
        />
        <FeedbackMessage feedback={feedback} />
        {!solved ? (
          <button type="submit" className="btn btn--primary" disabled={!input.trim()}>
            Comprobar
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={() => onCorrect()}>
            Continuar
          </button>
        )}
      </form>
    </div>
  );
}

function ArticulationExercise({ word, onComplete }) {
  const [input, setInput] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const { completedCount, currentIndex, isComplete } = getArticulationState(word, input);
  const currentUnit = word.articulation[currentIndex]?.unit;
  const unitData = currentUnit ? ARTICULATION_UNITS[currentUnit] : null;

  return (
    <div className="exercise-block fade-in">
      <p className="exercise-step-label">Actividad 2 de 2</p>
      <h3 className="exercise-heading">Escribí y observá cada sonido</h3>
      <p className="exercise-subheading">Escribí de nuevo la palabra, letra por letra.</p>

      <div className="articulation-layout">
        <div className="exercise-image-wrap exercise-image-wrap--compact">
          <ImageWithFallback src={word.image} alt={`Imagen de ${word.word.toLowerCase()}`} size="medium" />
        </div>

        <div className="articulation-focus">
          {unitData && (
            <>
              <div className="articulation-focus__image">
                <ImageWithFallback
                  src={unitData.image}
                  alt={`Gesto articulatorio de ${currentUnit}`}
                  size="medium"
                />
              </div>
              <div className="articulation-focus__unit">
                <span className="articulation-focus__unit-label">{currentUnit}</span>
                <AudioButton audio={unitData.audio} unitLabel={currentUnit} />
              </div>
            </>
          )}
        </div>
      </div>

      <ArticulationSequence
        articulation={word.articulation}
        currentIndex={currentIndex}
        completedCount={completedCount}
      />

      <div className="exercise-form">
        <label htmlFor="articulation-input" className="visually-hidden">
          Escribí la palabra completa
        </label>
        <input
          id="articulation-input"
          type="text"
          className="text-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={confirmed}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          placeholder="Escribí acá..."
        />

        {isComplete && !confirmed && (
          <FeedbackMessage feedback={{ type: 'success', message: '¡Excelente! Completaste la palabra.' }} />
        )}

        {isComplete && !confirmed ? (
          <button type="button" className="btn btn--primary" onClick={() => setConfirmed(true)}>
            Continuar
          </button>
        ) : confirmed ? (
          <button type="button" className="btn btn--primary" onClick={onComplete}>
            Siguiente
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Exercise({ word, activity, onActivityOneDone, onActivityTwoDone }) {
  return (
    <div className="exercise-card">
      <div className="exercise-word-tag">
        <ImageWithFallback src={word.image} alt="" size="thumb" />
        <span>{word.word}</span>
      </div>
      {activity === 1 ? (
        <RecognitionExercise word={word} onCorrect={onActivityOneDone} />
      ) : (
        <ArticulationExercise word={word} onComplete={onActivityTwoDone} />
      )}
    </div>
  );
}

/* =========================================================================
   Screens
   ========================================================================= */

function HomeScreen({ onStartRandom, onGoToCatalog }) {
  return (
    <div className="home fade-in">
      <h1 className="home__title">Jugamos con las palabras</h1>
      <p className="home__subtitle">
        Un espacio para practicar el reconocimiento de palabras y observar cómo se articula cada sonido.
      </p>

      <div className="home__options">
        <button type="button" className="option-card option-card--a" onClick={onStartRandom}>
          <span className="option-card__icon" aria-hidden="true">🎲</span>
          <span className="option-card__title">Práctica aleatoria</span>
          <span className="option-card__desc">Practica todas las palabras en un orden aleatorio.</span>
        </button>

        <button type="button" className="option-card option-card--b" onClick={onGoToCatalog}>
          <span className="option-card__icon" aria-hidden="true">🔎</span>
          <span className="option-card__title">Elegir una palabra</span>
          <span className="option-card__desc">Elegí una palabra para practicarla.</span>
        </button>
      </div>
    </div>
  );
}

function WordCard({ word, onSelect }) {
  return (
    <button type="button" className="word-card" onClick={() => onSelect(word)}>
      <span className="word-card__image">
        <ImageWithFallback src={word.image} alt="" size="small" />
      </span>
      <span className="word-card__name">{word.word}</span>
    </button>
  );
}

function WordGrid({ words, onSelect }) {
  if (words.length === 0) {
    return <p className="empty-state">No encontramos palabras con ese criterio.</p>;
  }
  return (
    <div className="word-grid">
      {words.map((w) => (
        <WordCard key={w.id} word={w} onSelect={onSelect} />
      ))}
    </div>
  );
}

function SpecificCatalog({ onSelect, onHome }) {
  const [search, setSearch] = useState('');
  const filtered = WORDS.filter((w) => w.word.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="catalog fade-in">
      <div className="screen-header">
        <button type="button" className="btn btn--ghost" onClick={onHome}>
          ← Volver al inicio
        </button>
      </div>
      <h2 className="screen-title">Elegí una palabra</h2>
      <p className="screen-subtitle">Seleccioná la palabra que querés practicar con la niña o el niño.</p>

      <label htmlFor="word-search" className="visually-hidden">Buscar palabra</label>
      <input
        id="word-search"
        type="search"
        className="text-input text-input--search"
        placeholder="Buscar palabra..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <WordGrid words={filtered} onSelect={onSelect} />
    </div>
  );
}

function RandomExerciseScreen({ queue, index, activity, onActivityOneDone, onActivityTwoDone, onHome }) {
  const word = queue[index];
  return (
    <div className="fade-in">
      <div className="screen-header">
        <button type="button" className="btn btn--ghost" onClick={onHome}>
          ← Volver al inicio
        </button>
      </div>
      <p className="progress-label">Palabra {index + 1} de {queue.length}</p>
      <ProgressBar current={index + 1} total={queue.length} />
      <Exercise
        word={word}
        activity={activity}
        onActivityOneDone={onActivityOneDone}
        onActivityTwoDone={onActivityTwoDone}
      />
    </div>
  );
}

function SpecificExerciseScreen({ word, activity, onActivityOneDone, onActivityTwoDone, onBackToCatalog, onHome }) {
  return (
    <div className="fade-in">
      <div className="screen-header">
        <button type="button" className="btn btn--ghost" onClick={onBackToCatalog}>
          ← Volver a las palabras
        </button>
        <button type="button" className="btn btn--ghost" onClick={onHome}>
          Inicio
        </button>
      </div>
      <Exercise
        word={word}
        activity={activity}
        onActivityOneDone={onActivityOneDone}
        onActivityTwoDone={onActivityTwoDone}
      />
    </div>
  );
}

function RandomCompletionScreen({ total, onRestart, onHome }) {
  return (
    <div className="completion fade-in">
      <span className="completion__emoji" aria-hidden="true">🎉</span>
      <h2 className="completion__title">¡Felicitaciones!</h2>
      <p className="completion__desc">Completaste todas las palabras.</p>
      <p className="completion__count">{total} / {total}</p>
      <div className="completion__actions">
        <button type="button" className="btn btn--primary" onClick={onRestart}>
          Practicar nuevamente
        </button>
        <button type="button" className="btn btn--ghost" onClick={onHome}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

function SpecificCompletionScreen({ word, onPracticeAgain, onChooseAnother, onHome }) {
  return (
    <div className="completion completion--compact fade-in">
      <h2 className="completion__title">¡Muy bien!</h2>
      <p className="completion__desc">Completaste {word.word}.</p>
      <div className="completion__actions">
        <button type="button" className="btn btn--primary" onClick={onPracticeAgain}>
          Practicar otra vez
        </button>
        <button type="button" className="btn btn--secondary" onClick={onChooseAnother}>
          Elegir otra palabra
        </button>
        <button type="button" className="btn btn--ghost" onClick={onHome}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   App
   ========================================================================= */

export default function App() {
  const [screen, setScreen] = useState('home');
  const [randomQueue, setRandomQueue] = useState([]);
  const [randomIndex, setRandomIndex] = useState(0);
  const [activity, setActivity] = useState(1);
  const [selectedWord, setSelectedWord] = useState(null);
  const [advancing, setAdvancing] = useState(false);

  const goHome = () => {
    setScreen('home');
    setRandomQueue([]);
    setRandomIndex(0);
    setActivity(1);
    setSelectedWord(null);
    setAdvancing(false);
  };

  const startRandom = () => {
    const shuffled = shuffle(WORDS);
    setRandomQueue(shuffled);
    setRandomIndex(0);
    setSelectedWord(shuffled[0]);
    setActivity(1);
    setScreen('randomExercise');
  };

  const openCatalog = () => setScreen('specificCatalog');

  const selectSpecificWord = (word) => {
    setSelectedWord(word);
    setActivity(1);
    setScreen('specificExercise');
  };

  // ---- Random mode transitions ----
  const onRandomActivityOneDone = () => setActivity(2);

  const onRandomActivityTwoDone = () => {
    if (advancing) return;
    setAdvancing(true);
    const nextIndex = randomIndex + 1;
    if (nextIndex < randomQueue.length) {
      setRandomIndex(nextIndex);
      setSelectedWord(randomQueue[nextIndex]);
      setActivity(1);
      setAdvancing(false);
    } else {
      setScreen('randomComplete');
      setAdvancing(false);
    }
  };

  // ---- Specific mode transitions ----
  const onSpecificActivityOneDone = () => setActivity(2);

  const onSpecificActivityTwoDone = () => {
    setScreen('specificComplete');
  };

  const practiceSameWordAgain = () => {
    setActivity(1);
    setScreen('specificExercise');
  };

  return (
    <div className="app-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Atkinson+Hyperlegible:wght@400;700&display=swap');

        :root {
          --paper: #f6efe0;
          --card: #fffcf6;
          --ink: #3a3226;
          --ink-soft: #6c6252;
          --line: #e6d9bf;
          --teal: #3e6f66;
          --teal-dark: #2c5049;
          --teal-tint: #e4efec;
          --honey: #cf8a2c;
          --honey-tint: #f8e9cf;
          --amber-soft: #a86a1f;
          --amber-tint: #fbf1de;
          --radius-lg: 22px;
          --radius-md: 16px;
          --radius-sm: 10px;
          --shadow: 0 12px 30px -18px rgba(58, 50, 38, 0.35);
          --font-head: 'Fraunces', Georgia, serif;
          --font-body: 'Atkinson Hyperlegible', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        * { box-sizing: border-box; }

        html, body { margin: 0; padding: 0; }

        .app-shell {
          min-height: 100vh;
          background:
            radial-gradient(1200px 500px at 15% -10%, rgba(62, 111, 102, 0.08), transparent 60%),
            var(--paper);
          font-family: var(--font-body);
          color: var(--ink);
          padding: 20px 16px 56px;
        }

        .app-topbar {
          max-width: 880px;
          margin: 0 auto 18px;
          display: flex;
          justify-content: flex-end;
        }

        .signature {
          text-align: right;
          line-height: 1.35;
        }
        .signature__name {
          margin: 0;
          font-family: var(--font-head);
          font-style: italic;
          font-weight: 500;
          font-size: 1.02rem;
          color: var(--teal-dark);
        }
        .signature__place {
          margin: 2px 0 0;
          font-size: 0.82rem;
          color: var(--ink-soft);
        }

        .app-main {
          max-width: 880px;
          margin: 0 auto;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow);
          padding: clamp(20px, 4vw, 44px);
        }

        .visually-hidden {
          position: absolute;
          width: 1px; height: 1px;
          padding: 0; margin: -1px;
          overflow: hidden;
          clip: rect(0,0,0,0);
          white-space: nowrap;
          border: 0;
        }

        button { font-family: inherit; }

        .btn {
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 1.05rem;
          border-radius: 999px;
          padding: 14px 28px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          min-height: 52px;
        }
        .btn:focus-visible {
          outline: 3px solid var(--teal-dark);
          outline-offset: 2px;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn--primary {
          background: var(--teal);
          color: #fff;
        }
        .btn--primary:not(:disabled):hover {
          background: var(--teal-dark);
          transform: translateY(-1px);
        }
        .btn--secondary {
          background: var(--honey-tint);
          color: var(--amber-soft);
          border-color: var(--honey);
        }
        .btn--secondary:hover {
          background: var(--honey);
          color: #fff;
        }
        .btn--ghost {
          background: transparent;
          color: var(--teal-dark);
          border: 2px solid var(--line);
          padding: 10px 20px;
          min-height: 44px;
          font-size: 0.95rem;
        }
        .btn--ghost:hover {
          border-color: var(--teal);
          background: var(--teal-tint);
        }

        .screen-header {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .fade-in { animation: fadeSlideIn 0.35s ease both; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ---------- Home ---------- */
        .home__title {
          font-family: var(--font-head);
          font-size: clamp(1.9rem, 4vw, 2.6rem);
          font-weight: 600;
          margin: 0 0 10px;
          color: var(--ink);
        }
        .home__subtitle {
          font-size: 1.08rem;
          color: var(--ink-soft);
          max-width: 56ch;
          line-height: 1.55;
          margin: 0 0 32px;
        }
        .home__options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .option-card {
          text-align: left;
          border-radius: var(--radius-md);
          padding: 26px 24px;
          background: var(--card);
          border: 2px solid var(--line);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .option-card:hover, .option-card:focus-visible {
          transform: translateY(-3px);
          box-shadow: var(--shadow);
        }
        .option-card:focus-visible { outline: 3px solid var(--teal-dark); outline-offset: 2px; }
        .option-card--a { border-left: 6px solid var(--teal); }
        .option-card--b { border-left: 6px solid var(--honey); }
        .option-card__icon { font-size: 2rem; }
        .option-card__title {
          font-family: var(--font-head);
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--ink);
        }
        .option-card__desc {
          color: var(--ink-soft);
          font-size: 0.98rem;
          line-height: 1.45;
        }

        /* ---------- Catalog ---------- */
        .screen-title {
          font-family: var(--font-head);
          font-size: clamp(1.5rem, 3vw, 1.9rem);
          margin: 0 0 6px;
        }
        .screen-subtitle {
          color: var(--ink-soft);
          margin: 0 0 20px;
        }
        .text-input--search { margin-bottom: 22px; }

        .word-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .word-card {
          background: var(--card);
          border: 2px solid var(--line);
          border-radius: var(--radius-md);
          padding: 16px 12px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .word-card:hover, .word-card:focus-visible {
          transform: translateY(-2px);
          border-color: var(--teal);
          box-shadow: var(--shadow);
        }
        .word-card:focus-visible { outline: 3px solid var(--teal-dark); outline-offset: 2px; }
        .word-card__image { width: 100%; aspect-ratio: 1 / 1; border-radius: var(--radius-sm); overflow: hidden; background: var(--teal-tint); }
        .word-card__name {
          font-family: var(--font-head);
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--ink);
        }
        .empty-state { color: var(--ink-soft); font-style: italic; }

        /* ---------- Progress ---------- */
        .progress-label {
          font-weight: 700;
          margin: 0 0 8px;
          color: var(--teal-dark);
        }
        .progress-bar__track {
          background: var(--line);
          border-radius: 999px;
          height: 12px;
          overflow: hidden;
          margin-bottom: 22px;
        }
        .progress-bar__fill {
          height: 100%;
          background: linear-gradient(90deg, var(--teal), var(--honey));
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        /* ---------- Exercise ---------- */
        .exercise-card {
          background: var(--teal-tint);
          border-radius: var(--radius-lg);
          padding: clamp(16px, 3vw, 30px);
        }
        .exercise-word-tag {
          display: none;
        }
        .exercise-step-label {
          font-size: 0.9rem;
          color: var(--teal-dark);
          font-weight: 700;
          margin: 0 0 4px;
        }
        .exercise-heading {
          font-family: var(--font-head);
          font-size: clamp(1.4rem, 3vw, 1.8rem);
          margin: 0 0 4px;
        }
        .exercise-subheading {
          color: var(--ink-soft);
          margin: 0 0 20px;
        }
        .exercise-image-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 22px;
        }
        .exercise-image-wrap--compact { margin-bottom: 0; }

        .asset-image {
          display: block;
          object-fit: cover;
          border-radius: var(--radius-md);
          background: #fff;
        }
        .asset-image--large { width: 100%; max-width: 320px; aspect-ratio: 4/3; }
        .asset-image--medium { width: 160px; height: 160px; }
        .asset-image--small { width: 100%; height: 100%; }
        .asset-image--thumb { width: 36px; height: 36px; border-radius: 8px; }

        .missing-image {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #fff;
          border: 2px dashed var(--line);
          border-radius: var(--radius-md);
          color: var(--ink-soft);
          text-align: center;
          padding: 10px;
        }
        .missing-image--large { width: 100%; max-width: 320px; aspect-ratio: 4/3; }
        .missing-image--medium { width: 160px; height: 160px; }
        .missing-image--small { width: 100%; height: 100%; }
        .missing-image--thumb { width: 36px; height: 36px; border-radius: 8px; }
        .missing-image__icon { width: 32px; height: 32px; fill: none; stroke: var(--ink-soft); stroke-width: 1.6; }
        .missing-image__label { font-size: 0.82rem; font-weight: 700; }
        .missing-image__path { font-size: 0.68rem; opacity: 0.7; word-break: break-all; padding: 0 6px; }

        .exercise-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 420px;
          margin: 0 auto;
        }
        .text-input {
          font-family: var(--font-body);
          font-size: 1.2rem;
          padding: 14px 18px;
          border-radius: var(--radius-sm);
          border: 2px solid var(--line);
          background: #fff;
          color: var(--ink);
          min-height: 52px;
        }
        .text-input:focus-visible, .text-input:focus {
          outline: none;
          border-color: var(--teal);
          box-shadow: 0 0 0 3px var(--teal-tint);
        }

        .feedback {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-weight: 700;
          border-radius: var(--radius-sm);
          padding: 10px 14px;
        }
        .feedback__icon svg { width: 20px; height: 20px; stroke: currentColor; fill: none; }
        .feedback--success {
          background: var(--teal-tint);
          color: var(--teal-dark);
        }
        .feedback--retry {
          background: var(--amber-tint);
          color: var(--amber-soft);
        }

        .articulation-layout {
          display: flex;
          gap: 24px;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .articulation-focus {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .articulation-focus__unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .articulation-focus__unit-label {
          font-family: var(--font-head);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--teal-dark);
          background: #fff;
          border: 2px solid var(--line);
          border-radius: var(--radius-sm);
          padding: 4px 18px;
        }

        .audio-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 2px solid var(--line);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--teal-dark);
          cursor: pointer;
        }
        .audio-button svg { width: 16px; height: 16px; fill: currentColor; stroke: currentColor; }
        .audio-button:hover { background: var(--teal-tint); }

        .unit-sequence {
          list-style: none;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          padding: 0;
          margin: 0 0 24px;
        }
        .unit-sequence__item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          min-width: 48px;
        }
        .unit-sequence__mark {
          font-size: 1.1rem;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 2px solid var(--line);
          background: #fff;
        }
        .unit-sequence__item--done .unit-sequence__mark {
          border-color: var(--teal);
          color: var(--teal-dark);
          background: var(--teal-tint);
        }
        .unit-sequence__item--current .unit-sequence__mark {
          border-color: var(--honey);
          color: var(--amber-soft);
          background: var(--honey-tint);
        }
        .unit-sequence__label { font-size: 0.8rem; font-weight: 700; color: var(--ink); }
        .unit-sequence__status { font-size: 0.65rem; color: var(--ink-soft); }

        /* ---------- Completion ---------- */
        .completion {
          text-align: center;
          padding: 20px 0;
        }
        .completion__emoji { font-size: 2.6rem; }
        .completion__title {
          font-family: var(--font-head);
          font-size: clamp(1.6rem, 3vw, 2.1rem);
          margin: 10px 0 6px;
        }
        .completion__desc { color: var(--ink-soft); margin: 0 0 6px; font-size: 1.05rem; }
        .completion__count {
          font-family: var(--font-head);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--teal-dark);
          margin: 0 0 26px;
        }
        .completion--compact .completion__count { display: none; }
        .completion__actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 14px;
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 600px) {
          .home__options { grid-template-columns: 1fr; }
          .word-grid { grid-template-columns: repeat(2, 1fr); }
          .articulation-layout { flex-direction: column; }
          .app-topbar { justify-content: center; }
          .signature { text-align: center; }
        }
        @media (max-width: 400px) {
          .word-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .app-main { padding: 18px 14px; }
          .btn { width: 100%; }
          .completion__actions .btn { width: 100%; }
          .screen-header { flex-direction: column; }
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in { animation: none; }
          .btn, .option-card, .word-card { transition: none; }
        }
      `}</style>

      <div className="app-topbar">
        <InstitutionalSignature />
      </div>

      <main className="app-main">
        {screen === 'home' && (
          <HomeScreen onStartRandom={startRandom} onGoToCatalog={openCatalog} />
        )}

        {screen === 'specificCatalog' && (
          <SpecificCatalog onSelect={selectSpecificWord} onHome={goHome} />
        )}

        {screen === 'randomExercise' && selectedWord && (
          <RandomExerciseScreen
            queue={randomQueue}
            index={randomIndex}
            activity={activity}
            onActivityOneDone={onRandomActivityOneDone}
            onActivityTwoDone={onRandomActivityTwoDone}
            onHome={goHome}
          />
        )}

        {screen === 'specificExercise' && selectedWord && (
          <SpecificExerciseScreen
            word={selectedWord}
            activity={activity}
            onActivityOneDone={onSpecificActivityOneDone}
            onActivityTwoDone={onSpecificActivityTwoDone}
            onBackToCatalog={() => setScreen('specificCatalog')}
            onHome={goHome}
          />
        )}

        {screen === 'randomComplete' && (
          <RandomCompletionScreen total={WORDS.length} onRestart={startRandom} onHome={goHome} />
        )}

        {screen === 'specificComplete' && selectedWord && (
          <SpecificCompletionScreen
            word={selectedWord}
            onPracticeAgain={practiceSameWordAgain}
            onChooseAnother={() => setScreen('specificCatalog')}
            onHome={goHome}
          />
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Volume2, VolumeX } from "lucide-react";
import { BackgroundBeams } from "@/components/aceternity/background-beams";

// Easter Egg Insider-Daten
const SPECIAL_DATE = "16.12.18";
const FIRST_DATE_LOCATION = "Weihnachtsmarkt Zürich";
const INSIDER_WORD = "umbekehrt";
const KOSENAMEN = ["Blubi", "S'chline", "Tortina", 'Juicy', "Gurkina"];

// Color mapping for sequence challenge
const COLOR_MAP = [
  {
    name: "Gurkina",
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    emoji: "🟣",
  },
  {
    name: "Blubina",
    color: "bg-blue-500",
    hoverColor: "hover:bg-blue-600",
    emoji: "🔵",
  },
  {
    name: "S'chline",
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    emoji: "🟢",
  },
  {
    name: "Torti",
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    emoji: "🟠",
  },
  {
    name: "Tortina",
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    emoji: "🔴",
  },
];

export default function ValentinePage() {
  const [noCount, setNoCount] = useState(0);
  const [success, setSuccess] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hearts, setHearts] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const heartIdRef = useRef(0);

  // Challenge 1: Name puzzle
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [shuffledNames, setShuffledNames] = useState<string[]>([]);

  // Challenge 2: Color sequence
  const [colorSequence, setColorSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [sequenceRound, setSequenceRound] = useState(1);
  const [showingSequence, setShowingSequence] = useState(false);
  const [highlightedColor, setHighlightedColor] = useState<number | null>(null);

  // Challenge 3: Heart collecting
  const [collectedHearts, setCollectedHearts] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  // Challenge 4: Button chaos
  const [fakeButtons, setFakeButtons] = useState<
    Array<{ id: number; x: number; y: number; rotation: number; text: string }>
  >([]);
  const [realButtonId, setRealButtonId] = useState<number>(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  useEffect(() => {
    // Shuffle names for puzzle
    const shuffled = [...KOSENAMEN].sort(() => Math.random() - 0.5);
    setShuffledNames(shuffled);
  }, []);

  // Heart collecting challenge - spawn hearts
  useEffect(() => {
    if (noCount === 3) {
      const interval = setInterval(() => {
        const id = heartIdRef.current++;
        const padding = 60;
        const newHeart = {
          id,
          x: Math.random() * (window.innerWidth - padding * 2) + padding,
          y:
            Math.random() * (window.innerHeight - padding * 2 - 200) +
            padding +
            100,
        };
        setFloatingHearts((prev) => [...prev, newHeart]);

        setTimeout(() => {
          setFloatingHearts((prev) => prev.filter((h) => h.id !== id));
        }, 3000);
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [noCount]);

  // Generate color sequence for challenge 2
  const generateColorSequence = (length: number) => {
    const sequence: number[] = [];
    for (let i = 0; i < length; i++) {
      sequence.push(Math.floor(Math.random() * COLOR_MAP.length));
    }
    return sequence;
  };

  // Play color sequence animation
  const playSequence = async (sequence: number[]) => {
    setShowingSequence(true);
    setPlayerSequence([]);

    for (let i = 0; i < sequence.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setHighlightedColor(sequence[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setHighlightedColor(null);
    }

    setShowingSequence(false);
  };

  // Start color sequence challenge
  useEffect(() => {
    if (noCount === 2 && colorSequence.length === 0) {
      const length = 3 + sequenceRound * 2; // Round 1: 5 colors, Round 2: 7, Round 3: 9
      const newSequence = generateColorSequence(length);
      setColorSequence(newSequence);
      playSequence(newSequence);
    }
  }, [noCount, sequenceRound]);

  // Generate fake buttons for challenge 4 - optimal distribution
  const generateFakeButtons = () => {
    const buttons = [];
    const numButtons = 35;
    const realId = Math.floor(Math.random() * numButtons);
    setRealButtonId(realId);

    const funnyTexts = [
      "JA! 💕",
      "JA! 💝",
      "JA! 💖",
      "JA! ❤️",
      "JA! 💗",
      "Ja Baby!",
      "Ja Schatz!",
      "Natürlich!",
      "Klar!",
      "Sicher!",
      "JA! 🥰",
      "Ja Liebi!",
      "Selbstverständlich!",
      "Logo!",
      "Jawohl!",
    ];

    // Calculate optimal grid based on screen size
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const buttonWidth = 140;
    const buttonHeight = 60;
    const paddingX = 20;
    const paddingY = 20;
    const headerSpace = 150;

    // Create grid with proper spacing
    const usableWidth = screenWidth - paddingX * 2;
    const usableHeight = screenHeight - headerSpace - paddingY * 2;
    const cols = Math.floor(usableWidth / (buttonWidth + paddingX));
    const rows = Math.ceil(numButtons / cols);

    const cellWidth = usableWidth / cols;
    const cellHeight = usableHeight / rows;

    for (let i = 0; i < numButtons; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      // Center position of cell
      const cellCenterX = paddingX + col * cellWidth + cellWidth / 2;
      const cellCenterY =
        headerSpace + paddingY + row * cellHeight + cellHeight / 2;

      // Add random offset within cell bounds (but not too much)
      const offsetX = (Math.random() - 0.5) * (cellWidth * 0.6);
      const offsetY = (Math.random() - 0.5) * (cellHeight * 0.6);

      buttons.push({
        id: i,
        x: cellCenterX + offsetX - buttonWidth / 2,
        y: cellCenterY + offsetY - buttonHeight / 2,
        rotation: Math.random() * 12 - 6,
        text: funnyTexts[Math.floor(Math.random() * funnyTexts.length)],
      });
    }

    // Shuffle for random visual appearance
    buttons.sort(() => Math.random() - 0.5);

    setFakeButtons(buttons);
  };

  useEffect(() => {
    if (noCount === 4 && fakeButtons.length === 0) {
      generateFakeButtons();
    }
  }, [noCount]);

  const createHeart = (x: number, y: number) => {
    const id = heartIdRef.current++;
    setHearts((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== id));
    }, 2000);
  };

  const handlePageClick = (e: React.MouseEvent) => {
    if (success) {
      createHeart(e.clientX, e.clientY);
    }
  };

  const handleYesClick = () => {
    if (noCount === 0) {
      setNoCount(1);
      setShowHint(true);
      setTimeout(() => setShowHint(false), 4000);
      createHeart(window.innerWidth / 2, window.innerHeight / 2);
    } else if (noCount === 1) {
      if (
        selectedNames.length === KOSENAMEN.length &&
        selectedNames.every((name, index) => name === KOSENAMEN[index])
      ) {
        setNoCount(2);
        setShowHint(true);
        setTimeout(() => setShowHint(false), 4000);
        createHeart(window.innerWidth / 2, window.innerHeight / 2);
      } else {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 2000);
      }
    } else if (noCount === 3) {
      if (collectedHearts >= 10) {
        setNoCount(4);
        setShowHint(true);
        setTimeout(() => setShowHint(false), 4000);
        createHeart(window.innerWidth / 2, window.innerHeight / 2);
      } else {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 2000);
      }
    } else if (noCount >= 5) {
      setSuccess(true);
    }
  };

  const handleNameClick = (name: string) => {
    if (noCount === 1) {
      setSelectedNames((prev) => [...prev, name]);
      setShuffledNames((prev) => prev.filter((n) => n !== name));
    }
  };

  const handleNameRemove = (name: string, index: number) => {
    if (noCount === 1) {
      setSelectedNames((prev) => prev.filter((_, i) => i !== index));
      setShuffledNames((prev) =>
        [...prev, name].sort(() => Math.random() - 0.5),
      );
    }
  };

  const handleColorClick = (colorIndex: number) => {
    if (showingSequence || noCount !== 2) return;

    const newPlayerSequence = [...playerSequence, colorIndex];
    setPlayerSequence(newPlayerSequence);

    // Flash the clicked color
    setHighlightedColor(colorIndex);
    setTimeout(() => setHighlightedColor(null), 300);

    // Check if wrong
    if (colorIndex !== colorSequence[newPlayerSequence.length - 1]) {
      // Wrong! Reset and show sequence again
      setTimeout(() => {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 2000);
        playSequence(colorSequence);
      }, 500);
      return;
    }

    // Check if complete
    if (newPlayerSequence.length === colorSequence.length) {
      // Correct! Move to next round or next challenge
      if (sequenceRound < 3) {
        setTimeout(() => {
          setSequenceRound((prev) => prev + 1);
          setColorSequence([]);
          setPlayerSequence([]);
          createHeart(window.innerWidth / 2, window.innerHeight / 2);
        }, 500);
      } else {
        // All 3 rounds complete!
        setTimeout(() => {
          setNoCount(3);
          setShowHint(true);
          setTimeout(() => setShowHint(false), 4000);
          createHeart(window.innerWidth / 2, window.innerHeight / 2);
        }, 500);
      }
    }
  };

  const handleHeartCollect = (heartId: number) => {
    setCollectedHearts((prev) => prev + 1);
    setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
    createHeart(window.innerWidth / 2, window.innerHeight / 2);
  };

  const handleFakeButtonClick = (buttonId: number) => {
    if (buttonId === realButtonId) {
      // Correct button!
      setNoCount(5);
      setShowQuiz(true);
      createHeart(window.innerWidth / 2, window.innerHeight / 2);
    } else {
      // Wrong button - remove it
      setFakeButtons((prev) => prev.filter((b) => b.id !== buttonId));
      setWrongAttempts((prev) => prev + 1);

      if (wrongAttempts >= 4) {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000);
      }
    }
  };

  const handleQuizSubmit = () => {
    const answer = quizAnswer.toLowerCase().trim();
    if (
      answer === "weihnachtsmarkt zürich" ||
      answer === "weihnachtsmarkt" ||
      answer === "zürich"
    ) {
      setShowQuiz(false);
      setSuccess(true);
    } else {
      setShowHint(true);
      setTimeout(() => setShowHint(false), 2000);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (musicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setMusicPlaying(!musicPlaying);
    }
  };

  const getChallengeText = () => {
    if (noCount === 0) return "Willsch du mis Valentinstag-Date sii? 💕";
    if (noCount === 1) return "Ordne mini Kosenamen für dich richtig ah! 💝";
    if (noCount === 2) return "Merk dir die Farb-Sequänz! 🌈";
    if (noCount === 3) return "Sammle 10 Herzli! 💕";
    if (noCount === 4) return "Finde de echti JA-Button! 🎯";
    if (noCount === 5) return "Letscht Challenge! Beantworte die Frag! 🤔";
    return "";
  };

  const getHintText = () => {
    if (noCount === 1) {
      if (selectedNames.length === 0) {
        return "💡 Klick uf die Näme in de richtige Reihefolg!";
      } else {
        const correctCount = selectedNames.filter(
          (name, index) => name === KOSENAMEN[index],
        ).length;
        const allCorrect =
          correctCount === selectedNames.length &&
          selectedNames.length === KOSENAMEN.length;

        if (allCorrect) {
          return "✅ Perfekt! Jetzt uf JA klicke!";
        } else if (correctCount === selectedNames.length) {
          return `💚 ${correctCount}/${KOSENAMEN.length} richtig! Wiiter so!`;
        } else {
          return `💡 ${correctCount}/${selectedNames.length} in korrekter Position (${selectedNames.length}/${KOSENAMEN.length} usgwählt)`;
        }
      }
    }
    if (noCount === 2) {
      if (showingSequence) {
        return `🎵 Runde ${sequenceRound}/3 - Merk dir die Sequänz!`;
      } else {
        return `💡 Runde ${sequenceRound}/3 - ${playerSequence.length}/${colorSequence.length} richtig!`;
      }
    }
    if (noCount === 3) return `💡 ${collectedHearts}/10 Herzli gsammlet!`;
    if (noCount === 4) {
      return `💡 Nur eine isch de echti! Viel Glück! 🍀`;
    }
    if (showQuiz) return "💡 Wo isch öises erschte Date gsi?";
    return "";
  };

  const getRandomKosename = () => {
    return KOSENAMEN[Math.floor(Math.random() * KOSENAMEN.length)];
  };

  if (success) {
    return (
      <div
        className="relative min-h-screen bg-gradient-to-br from-pink-950 via-rose-900 to-red-950 flex items-center justify-center overflow-hidden"
        onClick={handlePageClick}
      >
        <BackgroundBeams />

        <AnimatePresence>
          {hearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ x: heart.x, y: heart.y, opacity: 1, scale: 0 }}
              animate={{ y: heart.y - 200, opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute pointer-events-none"
              style={{ left: 0, top: 0 }}
            >
              <Heart className="w-8 h-8 fill-pink-500 text-pink-500" />
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={toggleMusic}
          className="absolute top-8 right-8 z-50 p-4 rounded-full bg-pink-500/20 backdrop-blur-lg border border-pink-300/30 hover:bg-pink-500/30 transition-all"
        >
          {musicPlaying ? (
            <Volume2 className="w-6 h-6 text-pink-200" />
          ) : (
            <VolumeX className="w-6 h-6 text-pink-200" />
          )}
        </motion.button>

        <audio ref={audioRef} loop>
          <source
            src="https://www.bensound.com/bensound-music/bensound-love.mp3"
            type="audio/mpeg"
          />
        </audio>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative z-10 max-w-4xl mx-auto px-8 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 3, delay: 1 }}
          >
            <Heart className="w-32 h-32 mx-auto mb-8 fill-pink-500 text-pink-500" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-pink-200 via-rose-200 to-red-200 bg-clip-text text-transparent"
          >
            YAYYY! 🎉
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-6 text-pink-100"
          >
            <p className="text-3xl md:text-4xl font-bold">
              Du hesch JA gseit, {getRandomKosename()}! 💕
            </p>

            <p className="text-xl md:text-2xl text-pink-200 max-w-2xl mx-auto leading-relaxed">
              Ich freu mi riesig uf öises Valentinstag-Date! Sit em{" "}
              {SPECIAL_DATE} simmer zäme - und jede Tag mit dir isch special! ✨
            </p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="text-sm text-pink-300 mt-8 cursor-pointer hover:text-pink-100 transition-colors"
              onClick={handlePageClick}
            >
              💝 Klick überall für meh Herzli! 💝
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  y: -100,
                  x: Math.random() * window.innerWidth,
                  opacity: 1,
                }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: Math.random() * 360,
                  opacity: 0,
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                }}
                className="absolute"
              >
                <Heart className="w-4 h-4 fill-pink-400 text-pink-400" />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (showQuiz) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-purple-950 via-pink-900 to-rose-950 flex items-center justify-center overflow-hidden">
        <BackgroundBeams />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 max-w-2xl mx-auto px-8 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-20 h-20 mx-auto mb-8 text-pink-400" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black mb-8 text-pink-100">
            Letscht Challenge! 🎯
          </h2>

          <p className="text-2xl mb-8 text-pink-200">
            Wo isch öises erschte Date gsi?
          </p>

          <input
            type="text"
            value={quizAnswer}
            onChange={(e) => setQuizAnswer(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleQuizSubmit()}
            placeholder="Din Antwort..."
            className="w-full px-6 py-4 text-xl rounded-2xl bg-pink-500/10 backdrop-blur-xl border border-pink-300/30 text-pink-100 placeholder-pink-300/50 focus:outline-none focus:border-pink-400/50 mb-6"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleQuizSubmit}
            className="px-12 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xl font-bold shadow-lg shadow-pink-500/50"
          >
            Absende
          </motion.button>

          <AnimatePresence>
            {showHint && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 text-pink-300"
              >
                {getHintText()}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-950 via-pink-900 to-purple-950 flex items-center justify-center overflow-hidden">
      <BackgroundBeams />

      {/* Floating collectible hearts for challenge 3 */}
      {noCount === 3 && (
        <AnimatePresence>
          {floatingHearts.map((heart) => (
            <motion.div
              key={heart.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute z-50 cursor-pointer touch-none"
              style={{ left: heart.x, top: heart.y }}
              onClick={() => handleHeartCollect(heart.id)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleHeartCollect(heart.id);
              }}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className="w-16 h-16 md:w-12 md:h-12 fill-pink-500 text-pink-500 drop-shadow-lg" />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Fake buttons for challenge 4 */}
      {noCount === 4 && (
        <AnimatePresence>
          {fakeButtons.map((button) => (
            <motion.button
              key={button.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{ scale: 0, opacity: 0, rotate: 360 }}
              transition={{
                duration: 0.3,
              }}
              className="absolute z-40 px-6 py-3 md:px-8 md:py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg md:text-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
              style={{
                left: button.x,
                top: button.y,
                transform: `rotate(${button.rotation}deg)`,
              }}
              onClick={() => handleFakeButtonClick(button.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {button.text}
            </motion.button>
          ))}
        </AnimatePresence>
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto px-8 text-center"
      >
        <motion.div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
              className="absolute"
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
            >
              <Heart className="w-8 h-8 fill-pink-400/30 text-pink-400/30" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Heart className="w-24 h-24 mx-auto mb-8 fill-pink-500 text-pink-500" />
        </motion.div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-pink-200 via-rose-200 to-red-200 bg-clip-text text-transparent leading-tight">
          {getChallengeText()}
        </h1>

        {noCount >= 1 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-pink-200 mb-8"
          >
            Challenge {noCount} vo 5
          </motion.p>
        )}

        {/* Name puzzle for Challenge 1 */}
        {noCount === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-6"
          >
            <div className="min-h-[100px] p-6 bg-pink-500/10 backdrop-blur-xl rounded-2xl border-2 border-pink-400/50">
              <p className="text-sm text-pink-300 mb-3">Dini Uswahl:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {selectedNames.length === 0 ? (
                  <p className="text-pink-300/50 italic">
                    Klick uf die Näme...
                  </p>
                ) : (
                  selectedNames.map((name, index) => (
                    <motion.button
                      key={`selected-${index}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleNameRemove(name, index)}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg"
                    >
                      {index + 1}. {name}
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {shuffledNames.map((name) => (
                <motion.button
                  key={name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNameClick(name)}
                  className="px-6 py-3 bg-pink-500/20 hover:bg-pink-500/30 backdrop-blur-xl border border-pink-300/30 text-pink-100 rounded-xl font-bold transition-all"
                >
                  {name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Color sequence for Challenge 2 */}
        {noCount === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-6"
          >
            <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
              {COLOR_MAP.map((color, index) => (
                <motion.button
                  key={index}
                  disabled={showingSequence}
                  onClick={() => handleColorClick(index)}
                  animate={{
                    scale: highlightedColor === index ? 1.2 : 1,
                    opacity: showingSequence
                      ? highlightedColor === index
                        ? 1
                        : 0.5
                      : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl ${color.color} ${
                    !showingSequence ? color.hoverColor : ""
                  } shadow-lg flex flex-col items-center justify-center text-white font-bold disabled:cursor-not-allowed transition-all`}
                  whileHover={!showingSequence ? { scale: 1.1 } : {}}
                  whileTap={!showingSequence ? { scale: 0.95 } : {}}
                >
                  <span className="text-3xl mb-1">{color.emoji}</span>
                  <span className="text-xs">{color.name}</span>
                </motion.button>
              ))}
            </div>

            {showingSequence && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-pink-200 text-lg"
              >
                👀 Lueg guet zue...
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Show hint */}
        {(noCount === 1 ||
          noCount === 2 ||
          noCount === 3 ||
          noCount === 4 ||
          showHint) &&
          getHintText() && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-pink-500/20 backdrop-blur-xl rounded-2xl border border-pink-300/30"
            >
              <p className="text-lg text-pink-100">{getHintText()}</p>
            </motion.div>
          )}

        <div className="flex gap-6 justify-center items-center flex-wrap">
          {/* JA Button - hidden during button chaos challenge */}
          {noCount !== 4 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleYesClick}
              className="px-16 py-6 rounded-2xl text-2xl font-bold shadow-2xl transition-all bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-500/50"
            >
              JA! 💕
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

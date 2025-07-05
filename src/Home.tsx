import {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import css from "./Home.module.css";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const placeholderQuestions = [
    "What is Apple's current market cap?",
    "How did Palantir perform in Q4 2023?",
    "What are Google's main revenue streams?",
    "Compare NVIDIA's P/E ratio to competitors",
    "What is Tesla's debt-to-equity ratio?",
    "How much cash does Microsoft have on hand?",
    "What are Amazon's quarterly earnings trends?",
    "Analyze Meta's stock performance this year",
  ];

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  }, []);

  // Animated placeholder effect
  useEffect(() => {
    const currentQuestion = placeholderQuestions[placeholderIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= currentQuestion.length) {
        setPlaceholderText(currentQuestion.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setPlaceholderIndex(prev => (prev + 1) % placeholderQuestions.length);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [placeholderIndex]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: inputValue,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);

      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: `I'm analyzing ${inputValue}... This would be replaced with actual financial data and analysis from the AI Market Insights API.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 2000);
    },
    [inputValue, isLoading]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={css.chatContainer}>
        <div className={css.header}>
          <h1 className={css.title}>AI Market Insights</h1>
          <button
            className={css.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
          >
            {theme === "light" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>

        <div className={css.messagesContainer}>
          {messages.length === 0 && (
            <div className={css.welcomeMessage}>
              <h2>Financial Analysis Assistant</h2>
              <p>
                Ask me anything about company financials, market analysis, or
                investment insights.
              </p>
              <div className={css.suggestions}>
                <p>Try asking about:</p>
                <ul>
                  <li>Quarterly earnings and revenue growth</li>
                  <li>EPS (Earnings Per Share) trends</li>
                  <li>Revenue by business segment</li>
                  <li>Year-over-year performance comparisons</li>
                  <li>Forward guidance and analyst estimates</li>
                  <li>Cash flow and balance sheet metrics</li>
                </ul>
              </div>
            </div>
          )}

          {messages.map(message => (
            <div
              key={message.id}
              className={`${css.message} ${css[message.type]}`}
            >
              <div className={css.messageContent}>{message.content}</div>
              <div className={css.messageTime}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`${css.message} ${css.assistant}`}>
              <div className={css.loadingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className={css.inputContainer} onSubmit={handleSubmit}>
          <div className={css.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholderText}
              className={css.input}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={css.sendButton}
              disabled={!inputValue.trim() || isLoading}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4L12 20M12 4L6 10M12 4L18 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </ThemeContext.Provider>
  );
}

export default Home;

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import { arponp30OntologyAugmentedGeneration } from "@aip-market-insights/sdk";
import { auth, default as client } from "./client";
import css from "./Home.module.css";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
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

// Typing animation component
function TypingMessage({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 8); // Much faster typing speed (8ms = ~125 characters per second)

      return () => clearTimeout(timer);
    }
  }, [currentIndex, content]);

  return (
    <div className={css.messageContent}>
      {displayedContent}
      {currentIndex < content.length && <span className={css.cursor}>|</span>}
    </div>
  );
}

function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
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
    "What are Apple's latest quarterly earnings?",
    "Show me Google's most recent earnings report.",
    "How did Nvidia perform last quarter?",
    "What is the latest EPS for Apple?",
    "Give me the most recent revenue for Google.",
    "Nvidia's latest net income?",
    "Analyze Apple's financial performance",
    "Compare Google and Apple's revenue growth",
  ];

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to sign in - this will redirect to OAuth if not authenticated
        await auth.signIn();
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

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

      // Call the arponp30 Ontology Augmented Generation API
      try {
        const result = await client(
          arponp30OntologyAugmentedGeneration
        ).executeFunction({
          userQuestion: inputValue,
        });

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: result,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error fetching financial data:", error);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: `Sorry, I encountered an error fetching financial data for "${inputValue}". Please try again later.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
      } finally {
        setIsLoading(false);
      }
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
        {isCheckingAuth ? (
          <div className={css.authLoading}>
            <div className={css.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Authenticating with Palantir...</p>
          </div>
        ) : (
          <>
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
                  <div className={css.notice}>
                    <strong>AI-Powered:</strong> This app uses the{" "}
                    <b>arponp30 Ontology Augmented Generation</b> API to provide{" "}
                    <b>real-time financial analysis</b> and insights.
                  </div>
                  <h2>AI Financial Analysis Assistant</h2>
                  <p>
                    Ask any financial question about companies, earnings, market
                    analysis, or financial metrics. Powered by advanced AI and
                    ontology data.
                  </p>
                  <div className={css.suggestions}>
                    <p>Try asking about:</p>
                    <ul>
                      <li>Apple&apos;s latest quarterly revenue and growth</li>
                      <li>
                        Google&apos;s most recent EPS and market performance
                      </li>
                      <li>Nvidia&apos;s net income and future outlook</li>
                      <li>Compare Apple and Google&apos;s financial metrics</li>
                      <li>Market analysis for tech companies</li>
                      <li>Financial ratios and valuation metrics</li>
                    </ul>
                  </div>
                </div>
              )}

              {messages.map(message => (
                <div
                  key={message.id}
                  className={`${css.message} ${css[message.type]}`}
                >
                  {message.type === "assistant" ? (
                    <TypingMessage content={message.content} />
                  ) : (
                    <div className={css.messageContent}>{message.content}</div>
                  )}
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
              </div>
            </form>
          </>
        )}
      </div>
    </ThemeContext.Provider>
  );
}

export default Home;

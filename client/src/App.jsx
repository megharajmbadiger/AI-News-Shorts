import { useEffect, useRef, useState } from "react";

import "./index.css";



function App() {

  const [query, setQuery] = useState("");

  const [news, setNews] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [searched, setSearched] = useState(false);

  const [isHomeFeed, setIsHomeFeed] = useState(true);



  // Menu

  const [menuOpen, setMenuOpen] = useState(false);



  // AI Short

  const [selectedShort, setSelectedShort] = useState("");

  const [shortLoading, setShortLoading] = useState(false);

  const [shortTitle, setShortTitle] = useState("");

  const [selectedArticle, setSelectedArticle] =
    useState(null);



  const initialLoadDone = useRef(false);



  // ================================

  // SEARCH NEWS

  // ================================



  const searchNews = async (
    searchQuery = query,
    homeFeed = false
  ) => {

    if (!searchQuery.trim()) {

      setError("Please enter a news topic.");

      return;

    }



    setLoading(true);

    setError("");

    setSearched(true);

    setIsHomeFeed(homeFeed);



    try {

      const response = await fetch(
        `https://ai-news-shorts.onrender.com/api/search?q=${encodeURIComponent(
          searchQuery
        )}`
      );



      if (!response.ok) {

        throw new Error("Failed to fetch news");

      }



      const data = await response.json();



      if (data.success) {

        setNews(data.results);

      } else {

        setError(
          data.message || "Something went wrong."
        );

        setNews([]);

      }



    } catch (err) {

      console.error(err);



      setError(
        "Unable to connect to the server. Please try again."
      );



      setNews([]);

    } finally {

      setLoading(false);

    }

  };



  // ================================

  // LOAD NEWS WHEN APP OPENS

  // ================================



  useEffect(() => {

    if (initialLoadDone.current) {

      return;

    }



    initialLoadDone.current = true;



    setQuery("Technology");



    searchNews("Technology", true);

  }, []);



  // ================================

  // TRENDING SEARCH

  // ================================



  const handleTrending = (topic) => {

    setQuery(topic);

    setMenuOpen(false);

    searchNews(topic, false);

  };



  // ================================

  // HOME

  // ================================



  const handleHome = () => {

    setMenuOpen(false);

    setQuery("Technology");

    searchNews("Technology", true);

  };



  // ================================

  // GENERATE AI SHORT

  // ================================



  const generateShort = async (article) => {

    setShortLoading(true);

    setSelectedShort("");

    setShortTitle(article.title);

    setSelectedArticle(article);

    setError("");



    try {

      const response = await fetch(
        "https://ai-news-shorts.onrender.com/api/summarize",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: article.title,
            summary: article.summary,
            source: article.source,
          }),

        }
      );



      if (!response.ok) {

        throw new Error(
          "Failed to generate AI short"
        );

      }



      const data = await response.json();



      if (data.success) {

        setSelectedShort(data.short);

      } else {

        setError(
          data.message ||
          "Unable to generate AI news short."
        );

      }



    } catch (err) {

      console.error(err);



      setError(
        "Unable to generate AI short. Please try again."
      );

    } finally {

      setShortLoading(false);

    }

  };



  // ================================

  // PARSE AI SHORT

  // ================================



  const parseShort = (text) => {

    const sections = {

      hook: "",

      whatHappened: "",

      whyItMatters: "",

      keyTakeaway: "",

    };



    if (!text) {

      return sections;

    }



    const hookMatch = text.match(
      /HOOK:\s*([\s\S]*?)(?=\n\s*WHAT HAPPENED:|$)/i
    );



    const happenedMatch = text.match(
      /WHAT HAPPENED:\s*([\s\S]*?)(?=\n\s*WHY IT MATTERS:|$)/i
    );



    const mattersMatch = text.match(
      /WHY IT MATTERS:\s*([\s\S]*?)(?=\n\s*KEY TAKEAWAY:|$)/i
    );



    const takeawayMatch = text.match(
      /KEY TAKEAWAY:\s*([\s\S]*?)$/i
    );



    sections.hook =
      hookMatch?.[1]?.trim() || "";



    sections.whatHappened =
      happenedMatch?.[1]?.trim() || "";



    sections.whyItMatters =
      mattersMatch?.[1]?.trim() || "";



    sections.keyTakeaway =
      takeawayMatch?.[1]?.trim() || "";



    return sections;

  };



  // ================================

  // ENTER KEY

  // ================================



  const handleKeyDown = (event) => {

    if (event.key === "Enter") {

      searchNews(query, false);

    }

  };



  // ================================

  // CLOSE AI SHORT

  // ================================



  const closeShort = () => {

    setSelectedShort("");

    setShortTitle("");

    setSelectedArticle(null);

  };



  // ================================

  // COPY SHORT

  // ================================



  const copyShort = async () => {

    try {

      await navigator.clipboard.writeText(
        selectedShort
      );



      alert("AI News Short copied!");

    } catch (error) {

      console.error(
        "Copy failed:",
        error
      );

    }

  };



  // ================================

  // SHARE SHORT

  // ================================



  const shareShort = async () => {

    const shareText =
      `${shortTitle}\n\n${selectedShort}\n\n` +
      "Generated by AI News Shorts";



    try {

      if (navigator.share) {

        await navigator.share({

          title: shortTitle,

          text: shareText,

        });

      } else {

        await navigator.clipboard.writeText(
          shareText
        );



        alert(
          "Sharing is not supported here. The AI News Short has been copied instead!"
        );

      }



    } catch (error) {

      if (error.name !== "AbortError") {

        console.error(
          "Share failed:",
          error
        );

      }

    }

  };



  // ================================

  // OPEN ORIGINAL ARTICLE

  // ================================



  const openOriginalArticle = () => {

    if (selectedArticle?.url) {

      window.open(
        selectedArticle.url,
        "_blank",
        "noopener,noreferrer"
      );

    }

  };



  const parsedShort = parseShort(
    selectedShort
  );



  return (

    <div className="app">



      {/* ================================
          HEADER
      ================================= */}



      <header className="header">



        <div className="logo">

          <span className="logo-icon">

            ✦

          </span>



          <span>

            AI News Shorts

          </span>

        </div>



        <button

          className="menu-button"

          onClick={() =>
            setMenuOpen(!menuOpen)
          }

          aria-label="Open menu"

        >

          {menuOpen ? "✕" : "☰"}

        </button>



      </header>



      {/* ================================
          MENU
      ================================= */}



      {menuOpen && (

        <div

          style={{

            position: "fixed",

            top: "80px",

            right: "40px",

            width: "240px",

            background: "#111111",

            border: "1px solid #333333",

            borderRadius: "16px",

            padding: "10px",

            zIndex: 900,

            boxShadow:
              "0 20px 60px rgba(0,0,0,0.5)",

          }}

        >



          <button

            onClick={handleHome}

            style={{

              width: "100%",

              padding: "14px 16px",

              background: "transparent",

              border: "none",

              color: "#ffffff",

              textAlign: "left",

              borderRadius: "10px",

              cursor: "pointer",

              fontSize: "15px",

            }}

          >

            🏠 Home

          </button>



          <button

            onClick={() =>
              handleTrending("AI")
            }

            style={{

              width: "100%",

              padding: "14px 16px",

              background: "transparent",

              border: "none",

              color: "#ffffff",

              textAlign: "left",

              borderRadius: "10px",

              cursor: "pointer",

              fontSize: "15px",

            }}

          >

            🤖 AI

          </button>



          <button

            onClick={() =>
              handleTrending("Technology")
            }

            style={{

              width: "100%",

              padding: "14px 16px",

              background: "transparent",

              border: "none",

              color: "#ffffff",

              textAlign: "left",

              borderRadius: "10px",

              cursor: "pointer",

              fontSize: "15px",

            }}

          >

            💻 Technology

          </button>



          <button

            onClick={() =>
              handleTrending("India")
            }

            style={{

              width: "100%",

              padding: "14px 16px",

              background: "transparent",

              border: "none",

              color: "#ffffff",

              textAlign: "left",

              borderRadius: "10px",

              cursor: "pointer",

              fontSize: "15px",

            }}

          >

            🇮🇳 India

          </button>



          <button

            onClick={() =>
              handleTrending("Startups")
            }

            style={{

              width: "100%",

              padding: "14px 16px",

              background: "transparent",

              border: "none",

              color: "#ffffff",

              textAlign: "left",

              borderRadius: "10px",

              cursor: "pointer",

              fontSize: "15px",

            }}

          >

            🚀 Startups

          </button>



        </div>

      )}



      {/* ================================
          HERO
      ================================= */}



      <section className="search-section">



        <p className="eyebrow">

          AI-POWERED NEWS

        </p>



        <h1>

          Stay informed.

          <br />

          <span>

            One short at a time.

          </span>

        </h1>



        <p className="description">

          Discover the latest stories from
          multiple sources,

          <br />

          summarized and visualized by AI.

        </p>



        {/* SEARCH */}



        <div className="search-box">



          <input

            type="text"

            value={query}

            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }

            onKeyDown={handleKeyDown}

            placeholder="Search news topics..."

          />



          <button

            className="search-button"

            onClick={() =>
              searchNews(
                query,
                false
              )
            }

            disabled={loading}

          >

            {loading

              ? "..."

              : "🔍"}

          </button>



        </div>



        {error && (

          <p className="error-message">

            {error}

          </p>

        )}



        {/* TRENDING */}



        <div className="trending">



          <span>

            Trending:

          </span>



          <button

            onClick={() =>
              handleTrending("AI")
            }

            disabled={loading}

          >

            AI

          </button>



          <button

            onClick={() =>
              handleTrending(
                "Technology"
              )
            }

            disabled={loading}

          >

            Technology

          </button>



          <button

            onClick={() =>
              handleTrending("India")
            }

            disabled={loading}

          >

            India

          </button>



          <button

            onClick={() =>
              handleTrending(
                "Startups"
              )
            }

            disabled={loading}

          >

            Startups

          </button>



        </div>



      </section>



      {/* ================================
          NEWS
      ================================= */}



      {searched && (

        <section className="news-section">



          {loading ? (



            <div className="loading">



              <div

                style={{

                  fontSize: "30px",

                  marginBottom: "15px",

                }}

              >

                ✦

              </div>



              Loading latest news...



            </div>



          ) : news.length > 0 ? (



            <>



              <div className="results-heading">



                <p>

                  {isHomeFeed

                    ? "LATEST NEWS"

                    : "SEARCH RESULTS"}

                </p>



                <h2>

                  {isHomeFeed

                    ? "What's happening right now"

                    : `Latest news about "${query}"`}

                </h2>



              </div>



              <div className="news-grid">



                {news.map(

                  (article, index) => (



                    <article

                      className="news-card"

                      key={index}

                    >



                      {article.image && (

                        <img

                          src={
                            article.image
                          }

                          alt={
                            article.title
                          }

                          style={{

                            width:
                              "100%",

                            height:
                              "180px",

                            objectFit:
                              "cover",

                            borderRadius:
                              "14px",

                            marginBottom:
                              "20px",

                          }}

                        />

                      )}



                      <div className="news-meta">



                        <span>

                          {
                            article.source
                          }

                        </span>



                        <span>

                          •

                        </span>



                        <span>

                          {
                            article.time
                          }

                        </span>



                      </div>



                      <h3>

                        {
                          article.title
                        }

                      </h3>



                      <p>

                        {
                          article.summary
                        }

                      </p>



                      <button

                        className="read-button"

                        onClick={() =>
                          generateShort(
                            article
                          )
                        }

                        disabled={
                          shortLoading
                        }

                      >

                        {shortLoading

                          ? "Creating short..."

                          : "Read short →"}

                      </button>



                    </article>



                  )

                )}



              </div>



            </>



          ) : (



            <div className="no-results">

              No news found.

            </div>



          )}



        </section>

      )}



      {/* ================================
          AI SHORT MODAL
      ================================= */}



      {(shortLoading ||
        selectedShort) && (



        <div

          style={{

            position: "fixed",

            inset: 0,

            background:
              "rgba(0, 0, 0, 0.82)",

            display: "flex",

            justifyContent:
              "center",

            alignItems:
              "center",

            padding: "20px",

            zIndex: 1000,

            backdropFilter:
              "blur(6px)",

          }}

        >



          <div

            style={{

              width: "100%",

              maxWidth: "760px",

              maxHeight: "90vh",

              overflowY: "auto",

              background:
                "#0f0f0f",

              border:
                "1px solid #333333",

              borderRadius:
                "24px",

              boxSizing:
                "border-box",

              boxShadow:
                "0 25px 100px rgba(0,0,0,0.7)",

            }}

          >



            {/* LOADING */}



            {shortLoading ? (



              <div

                style={{

                  textAlign:
                    "center",

                  padding:
                    "80px 30px",

                }}

              >



                <div

                  style={{

                    fontSize:
                      "46px",

                    marginBottom:
                      "20px",

                  }}

                >

                  ✦

                </div>



                <h2

                  style={{

                    color:
                      "#ffffff",

                    marginBottom:
                      "12px",

                  }}

                >

                  Creating your AI News

                  Short...

                </h2>



                <p

                  style={{

                    color:
                      "#999999",

                    margin: 0,

                  }}

                >

                  Gemini is summarizing

                  this story.

                </p>



              </div>



            ) : (



              <>



                {/* IMAGE */}



                {selectedArticle?.image && (

                  <img

                    src={
                      selectedArticle.image
                    }

                    alt={
                      selectedArticle.title
                    }

                    style={{

                      display:
                        "block",

                      width:
                        "100%",

                      height:
                        "280px",

                      objectFit:
                        "cover",

                      borderRadius:
                        "24px 24px 0 0",

                    }}

                  />

                )}



                <div

                  style={{

                    padding:
                      "30px",

                  }}

                >



                  {/* TITLE */}



                  <div

                    style={{

                      display:
                        "flex",

                      justifyContent:
                        "space-between",

                      alignItems:
                        "flex-start",

                      gap:
                        "20px",

                      marginBottom:
                        "24px",

                    }}

                  >



                    <div>



                      <p

                        style={{

                          color:
                            "#888888",

                          fontSize:
                            "12px",

                          letterSpacing:
                            "2.5px",

                          fontWeight:
                            "600",

                          margin:
                            "0 0 10px",

                        }}

                      >

                        AI NEWS SHORT

                      </p>



                      <h2

                        style={{

                          color:
                            "#ffffff",

                          margin: 0,

                          lineHeight:
                            1.3,

                          fontSize:
                            "28px",

                          fontWeight:
                            "600",

                        }}

                      >

                        {
                          shortTitle
                        }

                      </h2>



                      {selectedArticle?.source && (

                        <p

                          style={{

                            color:
                              "#777777",

                            margin:
                              "12px 0 0",

                            fontSize:
                              "14px",

                          }}

                        >

                          {
                            selectedArticle.source
                          }

                        </p>

                      )}



                    </div>



                    <button

                      onClick={
                        closeShort
                      }

                      style={{

                        flexShrink:
                          0,

                        background:
                          "transparent",

                        border:
                          "1px solid #333333",

                        color:
                          "#ffffff",

                        borderRadius:
                          "10px",

                        width:
                          "42px",

                        height:
                          "42px",

                        cursor:
                          "pointer",

                        fontSize:
                          "18px",

                      }}

                    >

                      ✕

                    </button>



                  </div>



                  {/* HOOK */}



                  {parsedShort.hook && (

                    <div

                      style={{

                        background:
                          "linear-gradient(135deg, #191919, #141414)",

                        border:
                          "1px solid #3a3a3a",

                        borderRadius:
                          "18px",

                        padding:
                          "24px",

                        marginBottom:
                          "16px",

                      }}

                    >



                      <p

                        style={{

                          color:
                            "#999999",

                          fontSize:
                            "12px",

                          fontWeight:
                            "700",

                          letterSpacing:
                            "2px",

                          margin:
                            "0 0 12px",

                        }}

                      >

                        🎯 HOOK

                      </p>



                      <p

                        style={{

                          color:
                            "#ffffff",

                          fontSize:
                            "20px",

                          lineHeight:
                            1.5,

                          fontWeight:
                            "600",

                          margin: 0,

                        }}

                      >

                        {
                          parsedShort.hook
                        }

                      </p>



                    </div>

                  )}



                  {/* WHAT HAPPENED */}



                  {parsedShort.whatHappened && (

                    <div

                      style={{

                        background:
                          "#181818",

                        border:
                          "1px solid #292929",

                        borderRadius:
                          "18px",

                        padding:
                          "24px",

                        marginBottom:
                          "16px",

                      }}

                    >



                      <p

                        style={{

                          color:
                            "#999999",

                          fontSize:
                            "12px",

                          fontWeight:
                            "700",

                          letterSpacing:
                            "2px",

                          margin:
                            "0 0 12px",

                        }}

                      >

                        📰 WHAT HAPPENED

                      </p>



                      <p

                        style={{

                          color:
                            "#dddddd",

                          fontSize:
                            "16px",

                          lineHeight:
                            1.7,

                          margin: 0,

                        }}

                      >

                        {
                          parsedShort.whatHappened
                        }

                      </p>



                    </div>

                  )}



                  {/* WHY IT MATTERS */}



                  {parsedShort.whyItMatters && (

                    <div

                      style={{

                        background:
                          "#181818",

                        border:
                          "1px solid #292929",

                        borderRadius:
                          "18px",

                        padding:
                          "24px",

                        marginBottom:
                          "16px",

                      }}

                    >



                      <p

                        style={{

                          color:
                            "#999999",

                          fontSize:
                            "12px",

                          fontWeight:
                            "700",

                          letterSpacing:
                            "2px",

                          margin:
                            "0 0 12px",

                        }}

                      >

                        💡 WHY IT MATTERS

                      </p>



                      <p

                        style={{

                          color:
                            "#dddddd",

                          fontSize:
                            "16px",

                          lineHeight:
                            1.7,

                          margin: 0,

                        }}

                      >

                        {
                          parsedShort.whyItMatters
                        }

                      </p>



                    </div>

                  )}



                  {/* KEY TAKEAWAY */}



                  {parsedShort.keyTakeaway && (

                    <div

                      style={{

                        background:
                          "linear-gradient(135deg, #1c1c1c, #141414)",

                        border:
                          "1px solid #444444",

                        borderRadius:
                          "18px",

                        padding:
                          "24px",

                        marginBottom:
                          "24px",

                      }}

                    >



                      <p

                        style={{

                          color:
                            "#999999",

                          fontSize:
                            "12px",

                          fontWeight:
                            "700",

                          letterSpacing:
                            "2px",

                          margin:
                            "0 0 12px",

                        }}

                      >

                        ✅ KEY TAKEAWAY

                      </p>



                      <p

                        style={{

                          color:
                            "#ffffff",

                          fontSize:
                            "18px",

                          lineHeight:
                            1.6,

                          fontWeight:
                            "600",

                          margin: 0,

                        }}

                      >

                        {
                          parsedShort.keyTakeaway
                        }

                      </p>



                    </div>

                  )}



                  {/* ACTION BUTTONS */}



                  <div

                    style={{

                      display:
                        "flex",

                      gap:
                        "12px",

                      flexWrap:
                        "wrap",

                    }}

                  >



                    {/* COPY */}



                    <button

                      onClick={
                        copyShort
                      }

                      style={{

                        background:
                          "#ffffff",

                        color:
                          "#000000",

                        border:
                          "none",

                        borderRadius:
                          "11px",

                        padding:
                          "13px 20px",

                        cursor:
                          "pointer",

                        fontWeight:
                          "600",

                        fontSize:
                          "14px",

                      }}

                    >

                      📋 Copy Short

                    </button>



                    {/* SHARE */}



                    <button

                      onClick={
                        shareShort
                      }

                      style={{

                        background:
                          "#222222",

                        color:
                          "#ffffff",

                        border:
                          "1px solid #444444",

                        borderRadius:
                          "11px",

                        padding:
                          "13px 20px",

                        cursor:
                          "pointer",

                        fontWeight:
                          "600",

                        fontSize:
                          "14px",

                      }}

                    >

                      📤 Share Short

                    </button>



                    {/* ORIGINAL */}



                    {selectedArticle?.url && (

                      <button

                        onClick={
                          openOriginalArticle
                        }

                        style={{

                          background:
                            "transparent",

                          color:
                            "#ffffff",

                          border:
                            "1px solid #444444",

                          borderRadius:
                            "11px",

                          padding:
                            "13px 20px",

                          cursor:
                            "pointer",

                          fontSize:
                            "14px",

                        }}

                      >

                        🔗 Read Original Article

                      </button>

                    )}



                  </div>



                </div>



              </>



            )}



          </div>



        </div>



      )}



    </div>

  );

}



export default App;
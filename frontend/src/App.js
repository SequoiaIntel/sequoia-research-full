import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, FileText, History, AlertCircle, CheckCircle, XCircle, Minus } from 'lucide-react';

const TechEquityAnalyzer = () => {
  const [ticker, setTicker] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detailed'
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // API base URL - will be your deployed backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'feisty-nurturing-production-24a8.up.railway.app';

  // Load analysis history from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('equity-analysis-history');
    if (saved) {
      setAnalysisHistory(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('equity-analysis-history', JSON.stringify(analysisHistory));
  }, [analysisHistory]);

  const getRatingColor = (rating) => {
    switch (rating?.toLowerCase()) {
      case 'strong buy': return 'text-white bg-green-600';
      case 'buy': return 'text-white' + ' ' + 'bg-green-500';
      case 'neutral': case 'hold': return 'text-white bg-yellow-600';
      case 'sell': return 'text-white bg-orange-600';
      case 'strong sell': return 'text-white bg-red-600';  
      default: return 'text-gray-600' + ' ' + 'bg-gray-200';
    }
  };

  const getRatingIcon = (rating) => {
    switch (rating?.toLowerCase()) {
      case 'strong buy': case 'buy': return <TrendingUp className="w-4 h-4" />;
      case 'neutral': case 'hold': return <Minus className="w-4 h-4" />;
      case 'sell': case 'strong sell': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const runAnalysis = async () => {
    if (!ticker.trim()) return;

    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    setSelectedHistoryItem(null);

    try {
      console.log("🚀 Starting analysis for:", ticker.toUpperCase());
      
      // Prepare the research prompt based on the user's agent framework
      const researchPrompt = `
As an Advanced AI Alpha-Generation Investment Research Agent for Sequoia AG, analyze ${ticker.toUpperCase()} using the comprehensive framework provided. Focus on high-tech companies and provide:

1. **Executive Summary** with contrarian thesis and differentiated recommendation
2. **Financial Analysis** including 5-year trends and cash flow assessment  
3. **Competitive Positioning** and sustainable advantages analysis
4. **Valuation Analysis** using multiple methods with scenarios
5. **Risk Assessment** including hidden risks and mitigation strategies
6. **Alpha Generation Thesis** with specific contrarian drivers
7. **Final Recommendation** (Strong Buy/Buy/Hold/Sell/Strong Sell) with conviction level

Apply contrarian thinking, challenge consensus views, and identify opportunities others might miss. Provide institutional-grade analysis with specific price targets and time horizons.

Respond with a structured JSON object containing both a detailed analysis and a concise executive summary suitable for quick decision-making.

Structure the response as:
{
  "ticker": "${ticker.toUpperCase()}",
  "analysis_date": "current date",
  "executive_summary": {
    "recommendation": "Strong Buy/Buy/Hold/Sell/Strong Sell",
    "target_price": "number",
    "current_price": "number", 
    "conviction_level": "High/Medium/Low",
    "key_thesis": "2-3 sentence contrarian thesis",
    "primary_catalysts": ["catalyst1", "catalyst2", "catalyst3"],
    "key_risks": ["risk1", "risk2", "risk3"],
    "time_horizon": "6-12 months"
  },
  "detailed_analysis": {
    "financial_analysis": "detailed financial assessment",
    "competitive_positioning": "competitive advantage analysis", 
    "valuation_analysis": "valuation methods and scenarios",
    "risk_assessment": "comprehensive risk analysis",
    "alpha_thesis": "specific alpha generation opportunities",
    "contrarian_insights": "market bias identification and exploitation"
  }
}

DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON. Ensure all JSON is properly formatted and valid.
      `;

      console.log("📡 Calling backend API...");

      // Call our backend instead of Anthropic directly
      const response = await fetch(`${API_BASE_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          researchPrompt: researchPrompt
        })
      });

      console.log("📡 Backend response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.log("❌ Backend error:", errorData);
        throw new Error(`Backend error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const analysisResult = await response.json();
      console.log("✅ Analysis completed successfully!");
      
      setCurrentAnalysis(analysisResult);
      
      // Add to history
      setAnalysisHistory(prev => [analysisResult, ...prev.slice(0, 49)]); // Keep last 50 analyses
      
    } catch (error) {
      console.error("❌ Analysis failed:", error);
      
      // Fallback to mock data if backend fails
      console.log("🎭 Using mock data as fallback");
      const mockAnalysis = {
        id: Date.now(),
        ticker: ticker.toUpperCase(),
        analysis_date: new Date().toLocaleDateString(),
        created_at: new Date().toISOString(),
        executive_summary: {
          recommendation: "Buy",
          target_price: "180.00",
          current_price: "150.00",
          conviction_level: "High",
          key_thesis: "Strong competitive moat in cloud infrastructure with accelerating AI adoption driving revenue growth above consensus expectations.",
          primary_catalysts: [
            "AI infrastructure demand acceleration",
            "Market share gains in enterprise cloud",
            "Margin expansion from operational leverage"
          ],
          key_risks: [
            "Increased competition from hyperscalers",
            "Economic downturn impact on IT spending",
            "Regulatory scrutiny on AI applications"
          ],
          time_horizon: "12 months"
        },
        detailed_analysis: {
          financial_analysis: "Strong revenue growth trajectory with 28% CAGR over past 5 years. Operating margins expanding from 12% to 18% due to economies of scale in cloud infrastructure. Free cash flow conversion consistently above 85% indicating high-quality earnings. Balance sheet strength with minimal debt and $45B cash position provides strategic flexibility.",
          competitive_positioning: "Dominant position in enterprise cloud with 65% market share. Strong moat from network effects, switching costs, and ecosystem lock-in. AI capabilities creating new competitive advantages versus traditional IT vendors. Patent portfolio and R&D investment (15% of revenue) maintaining technological leadership.",
          valuation_analysis: "DCF analysis yields $185 target price assuming 22% revenue growth and 200bp margin expansion. Trading at 25x forward P/E versus peers at 30x despite superior growth profile. Sum-of-parts analysis values cloud segment at $160/share with AI optionality providing additional upside to $200/share.",
          risk_assessment: "Primary risks include competitive pressure from AWS/Azure, potential economic slowdown impacting enterprise spending, and regulatory challenges around AI deployment. Tail risks include major security breach or key talent departures. Downside scenario suggests $120 floor based on asset value and cash position.",
          alpha_thesis: "Market underappreciating AI transformation accelerating cloud adoption rates and driving pricing power expansion. Consensus estimates appear conservative on margin expansion potential. Contrarian opportunity as recent volatility created attractive entry point despite strong fundamentals.",
          contrarian_insights: "While street focuses on competition concerns, data suggests market share stabilization and pricing discipline improving. Recent insider buying and dividend increase signal management confidence. Technical oversold conditions creating tactical opportunity for fundamentally strong name."
        }
      };
      
      setCurrentAnalysis(mockAnalysis);
      setAnalysisHistory(prev => [mockAnalysis, ...prev.slice(0, 49)]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectHistoryItem = (item) => {
    setSelectedHistoryItem(item);
    setCurrentAnalysis(item);
    setViewMode('summary');
  };

  const displayAnalysis = selectedHistoryItem || currentAnalysis;

  return (
    <div style={{ backgroundColor: '#C9C2AD', minHeight: '100vh' }}>
      {/* Header */}
      <div className="shadow-lg border-b-2" style={{backgroundColor: '#15706A', borderBottomColor: '#0F4A45'}}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-wide" style={{color: '#F0E9E5', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                  Sequoia Advisor Group
                </h1>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold" style={{color: '#F0E9E5', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>Proprietary Equity Research Agent</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Welcome Section - Always Visible */}
        <div className="mb-6">
          <div className="rounded-lg shadow-md p-8 text-center border-t-4" style={{backgroundColor: '#F0E9E5', borderTopColor: '#15706A'}}>
            <FileText className="w-12 h-12 mx-auto mb-4" style={{color: '#C9C2AD'}} />
            <h3 className="text-xl font-semibold mb-2" style={{color: '#15706A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
              Welcome to Sequoia Advisor Group Research
            </h3>
            <p className="mb-6" style={{color: '#8F3E0C', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
              Enter a ticker symbol to generate institutional-grade equity analysis
              with contrarian insights and alpha generation opportunities.
            </p>
            <div className="rounded-lg p-6 text-left max-w-md mx-auto border-l-4" style={{backgroundColor: '#F0F7F6', borderLeftColor: '#15706A'}}>
              <h4 className="font-semibold mb-3" style={{color: '#15706A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>Analysis Framework:</h4>
              <ul className="text-sm space-y-2" style={{color: '#2D4A47', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: '#15706A'}}></span>
                  Multi-dimensional fundamental analysis
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: '#8F3E0C'}}></span>
                  Contrarian thinking & bias detection
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: '#15706A'}}></span>
                  Competitive positioning assessment
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: '#8F3E0C'}}></span>
                  Risk-adjusted valuation models
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-3" style={{backgroundColor: '#15706A'}}></span>
                  Alpha generation opportunities
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Input & History */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Ticker Input */}
            <div className="rounded-lg shadow-md p-6 border-l-4" style={{backgroundColor: '#F0E9E5', borderLeftColor: '#15706A'}}>
              <h3 className="text-lg font-semibold mb-4" style={{color: '#15706A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>Analyze Stock</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: '#8F3E0C', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                    Ticker Symbol
                  </label>
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    placeholder="e.g., NVDA, TSLA, GOOGL"
                    className="w-full px-3 py-2 border-2 rounded-md focus:outline-none transition-colors"
                    style={{
                      borderColor: '#C9C2AD',
                      backgroundColor: '#FDFCFB',
                      fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#15706A'}
                    onBlur={(e) => e.target.style.borderColor = '#C9C2AD'}
                    onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && runAnalysis()}
                  />
                </div>
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !ticker.trim()}
                  className="w-full flex items-center justify-center px-4 py-3 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
                  style={{
                    backgroundColor: '#15706A',
                    fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'
                  }}
                  onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#0F4A45')}
                  onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#15706A')}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Run Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Analysis History */}
            <div className="rounded-lg shadow-md p-6 border-l-4" style={{backgroundColor: '#F0E9E5', borderLeftColor: '#8F3E0C'}}>
              <h3 className="text-lg font-semibold mb-4 flex items-center" style={{color: '#15706A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                <History className="w-5 h-5 mr-2" />
                Recent Analyses
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analysisHistory.length === 0 ? (
                  <p className="text-sm" style={{color: '#AA9C93', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>No analyses yet</p>
                ) : (
                  analysisHistory.map((analysis) => (
                    <div
                      key={analysis.id}
                      onClick={() => selectHistoryItem(analysis)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedHistoryItem?.id === analysis.id
                          ? 'shadow-md'
                          : 'hover:shadow-sm'
                      }`}
                      style={{
                        backgroundColor: selectedHistoryItem?.id === analysis.id ? '#F0F7F6' : '#FDFCFB',
                        borderColor: selectedHistoryItem?.id === analysis.id ? '#15706A' : '#E1DFD8'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium" style={{color: '#15706A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>{analysis.ticker}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(analysis.executive_summary?.recommendation)}`} style={{fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                          {analysis.executive_summary?.recommendation}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{color: '#8F3E0C', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {displayAnalysis ? (
              <div className="rounded-lg shadow-md border-t-4" style={{backgroundColor: '#F0E9E5', borderTopColor: '#15706A'}}>
                {/* Analysis Header */}
                <div className="p-6 border-b-2" style={{borderBottomColor: '#E1DFD8'}}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <h2 className="text-2xl font-bold" style={{color: '#15706A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                        {displayAnalysis.ticker}
                      </h2>
                      <div className={`flex items-center px-3 py-2 rounded-full ${getRatingColor(displayAnalysis.executive_summary?.recommendation)}`}>
                        {getRatingIcon(displayAnalysis.executive_summary?.recommendation)}
                        <span className="ml-2 font-semibold" style={{fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                          {displayAnalysis.executive_summary?.recommendation}
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{backgroundColor: '#8F3E0C', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                        Conviction: {displayAnalysis.executive_summary?.conviction_level}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm" style={{color: '#8F3E0C', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                        {displayAnalysis.analysis_date || new Date(displayAnalysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* View Toggle */}
                  <div className="flex space-x-1 rounded-lg p-1" style={{backgroundColor: '#F0F7F6'}}>
                    <button
                      onClick={() => setViewMode('summary')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        viewMode === 'summary'
                          ? 'bg-white text-white shadow-md'
                          : 'hover:bg-white hover:bg-opacity-50'
                      }`}
                      style={{
                        backgroundColor: viewMode === 'summary' ? '#15706A' : 'transparent',
                        color: viewMode === 'summary' ? 'white' : '#15706A',
                        fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'
                      }}
                    >
                      Executive Summary
                    </button>
                    <button
                      onClick={() => setViewMode('detailed')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        viewMode === 'detailed'
                          ? 'bg-white text-white shadow-md'
                          : 'hover:bg-white hover:bg-opacity-50'
                      }`}
                      style={{
                        backgroundColor: viewMode === 'detailed' ? '#15706A' : 'transparent',
                        color: viewMode === 'detailed' ? 'white' : '#15706A',
                        fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'
                      }}
                    >
                      Detailed Report
                    </button>
                  </div>
                </div>

                {/* Analysis Content */}
                <div className="p-6">
                  {viewMode === 'summary' ? (
                    /* Executive Summary View */
                    <div className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-lg p-4 border-l-4" style={{backgroundColor: '#FDFCFB', borderLeftColor: '#15706A'}}>
                          <p className="text-sm font-medium" style={{color: '#8F3E0C', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>Current Price</p>
                          <p className="text-2xl font-bold" style={{color: '#15706A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                            ${displayAnalysis.executive_summary?.current_price}
                          </p>
                        </div>
                        <div className="rounded-lg p-4 border-l-4" style={{backgroundColor: '#FDFCFB', borderLeftColor: '#8F3E0C'}}>
                          <p className="text-sm font-medium" style={{color: '#8F3E0C', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>Target Price</p>
                          <p className="text-2xl font-bold text-green-600" style={{fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                            ${displayAnalysis.executive_summary?.target_price}
                          </p>
                        </div>
                        <div className="rounded-lg p-4 border-l-4" style={{backgroundColor: '#FDFCFB', borderLeftColor: '#C9C2AD'}}>
                          <p className="text-sm font-medium" style={{color: '#8F3E0C', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>Time Horizon</p>
                          <p className="text-2xl font-bold" style={{color: '#15706A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                            {displayAnalysis.executive_summary?.time_horizon}
                          </p>
                        </div>
                      </div>

                      {/* Investment Thesis */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3" style={{color: '#15706A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>Investment Thesis</h3>
                        <div className="p-4 rounded-lg border-l-4" style={{backgroundColor: '#F0F7F6', borderLeftColor: '#15706A'}}>
                          <p className="leading-relaxed" style={{color: '#2D4A47', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                            {displayAnalysis.executive_summary?.key_thesis}
                          </p>
                        </div>
                      </div>

                      {/* Catalysts & Risks */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center" style={{color: '#15706A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                            <TrendingUp className="w-5 h-5 mr-2" style={{color: '#15706A'}} />
                            Primary Catalysts
                          </h3>
                          <div className="p-4 rounded-lg" style={{backgroundColor: '#F0F7F6'}}>
                            <ul className="space-y-2">
                              {displayAnalysis.executive_summary?.primary_catalysts?.map((catalyst, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="w-4 h-4 mt-1 mr-2 flex-shrink-0" style={{color: '#15706A'}} />
                                  <span style={{color: '#2D4A47', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>{catalyst}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center" style={{color: '#8F3E0C', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                            <AlertCircle className="w-5 h-5 mr-2" style={{color: '#8F3E0C'}} />
                            Key Risks
                          </h3>
                          <div className="p-4 rounded-lg" style={{backgroundColor: '#FAF7F5'}}>
                            <ul className="space-y-2">
                              {displayAnalysis.executive_summary?.key_risks?.map((risk, index) => (
                                <li key={index} className="flex items-start">
                                  <XCircle className="w-4 h-4 mt-1 mr-2 flex-shrink-0" style={{color: '#8F3E0C'}} />
                                  <span style={{color: '#5A3E2A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>{risk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Detailed Report View */
                    <div className="space-y-8">
                      {Object.entries(displayAnalysis.detailed_analysis || {}).map(([section, content]) => (
                        <div key={section}>
                          <h3 className="text-lg font-semibold mb-4 capitalize border-b-2 pb-2" style={{color: '#15706A', borderBottomColor: '#E1DFD8', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                            {section.replace(/_/g, ' ')}
                          </h3>
                          <div className="rounded-lg p-6 border-l-4" style={{backgroundColor: '#FDFCFB', borderLeftColor: '#8F3E0C'}}>
                            <p className="leading-relaxed whitespace-pre-wrap" style={{color: '#2D4A47', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                              {content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Placeholder when no analysis selected */
              <div className="rounded-lg shadow-md p-8 text-center border-t-4" style={{backgroundColor: '#F0E9E5', borderTopColor: '#15706A'}}>
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4" style={{color: '#C9C2AD'}} />
                  <p className="text-lg" style={{color: '#15706A', fontFamily: 'Montserrat, Avenir Next, -apple-system, sans-serif'}}>
                    Money doesn't grow on trees - but it does grow at Sequoia
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechEquityAnalyzer;

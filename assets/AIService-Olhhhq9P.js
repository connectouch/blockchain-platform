var I=Object.defineProperty;var O=(a,e,o)=>e in a?I(a,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):a[e]=o;var h=(a,e,o)=>O(a,typeof e!="symbol"?e+"":e,o);const l=class l{constructor(){h(this,"openaiApiKey");h(this,"baseUrl");this.openaiApiKey="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",this.baseUrl="https://api.openai.com/v1",console.log("🔑 AIService initialized with OpenAI API key:",!!this.openaiApiKey),console.log("🔑 API key length:",this.openaiApiKey.length),console.log("🔑 API key preview:",this.openaiApiKey?this.openaiApiKey.substring(0,20)+"...":"NOT SET"),console.log("🌐 OpenAI Base URL:",this.baseUrl),this.testNetworkConnectivity()}async testNetworkConnectivity(){try{console.log("🌐 Testing network connectivity..."),(await fetch("https://httpbin.org/get",{method:"GET",signal:AbortSignal.timeout(5e3)})).ok?console.log("✅ Internet connectivity: OK"):console.warn("⚠️ Internet connectivity: Limited")}catch(e){console.error("❌ Network connectivity test failed:",e)}}static getInstance(){return l.instance||(l.instance=new l),l.instance}async simpleOpenAIRequest(e){console.log("🔄 Making simple OpenAI request...");const o=await fetch(`${this.baseUrl}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.openaiApiKey}`},body:JSON.stringify({model:"gpt-4-turbo-preview",messages:[{role:"system",content:"You are Connectouch, a friendly AI assistant for cryptocurrency and Web3. Respond naturally and helpfully."},{role:"user",content:e}],max_tokens:500,temperature:.7,stream:!1})});if(console.log("📡 Simple request status:",o.status),!o.ok){const s=await o.text();throw console.error("❌ Simple request failed:",s),new Error(`OpenAI API error: ${o.status} - ${s}`)}const t=await o.json();if(console.log("✅ Simple request response:",t),t.choices&&t.choices[0]?.message?.content)return{response:t.choices[0].message.content,suggestions:["Ask another question","Explain more","Show examples","Get help"],confidence:90,metadata:{model:t.model,usage:t.usage,simple_request:!0}};throw new Error("Invalid OpenAI response format")}async testOpenAIConnection(){console.log("🧪 Testing OpenAI connection...");try{const e=await fetch(`${this.baseUrl}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.openaiApiKey}`},body:JSON.stringify({model:"gpt-4-turbo-preview",messages:[{role:"user",content:'Hello! Just testing the connection. Please respond with "Connection successful!"'}],max_tokens:50,temperature:.7,stream:!1})});if(console.log("Test response status:",e.status),!e.ok){const t=await e.text();return console.error("Test failed:",t),{success:!1,error:t}}const o=await e.json();return console.log("Test response:",o),{success:!0,data:o}}catch(e){return console.error("Test error:",e),{success:!1,error:e instanceof Error?e.message:"Unknown error"}}}async enhancedChat(e,o,t,s=[],n,p){if(console.log("🚀 Enhanced chat called with message:",e),console.log("🔑 API Key available:",!!this.openaiApiKey),console.log("🔗 Base URL:",this.baseUrl),!p){console.log("🔄 No streaming callback, trying simple request first...");try{return await this.simpleOpenAIRequest(e)}catch(r){console.log("❌ Simple request failed, trying streaming...",r)}}try{const i=[{role:"system",content:this.createHumanizedSystemPrompt(t,n)},...o.slice(-10),{role:"user",content:e}];console.log("🚀 Making OpenAI API call..."),console.log("🔗 URL:",`${this.baseUrl}/chat/completions`),console.log("📝 Messages count:",i.length),console.log("🔑 Using API key:",this.openaiApiKey.substring(0,20)+"...");const d=await fetch(`${this.baseUrl}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.openaiApiKey}`},body:JSON.stringify({model:"gpt-4-turbo-preview",messages:i,max_tokens:1200,temperature:.8,presence_penalty:.2,frequency_penalty:.1,top_p:.9,stream:!0})});if(console.log("📡 OpenAI Response status:",d.status),console.log("📡 OpenAI Response headers:",Object.fromEntries(d.headers.entries())),!d.ok){const c=await d.text();throw console.error("❌ OpenAI API Error Response:",c),new Error(`OpenAI API error: ${d.status} - ${c}`)}const m=d.body?.getReader(),b=new TextDecoder;let u="",y="";if(m)try{for(;;){const{done:c,value:v}=await m.read();if(c)break;y+=b.decode(v,{stream:!0});const w=y.split(`
`);y=w.pop()||"";for(const k of w)if(k.startsWith("data: ")){const A=k.slice(6);if(A==="[DONE]")break;try{const f=JSON.parse(A).choices?.[0]?.delta?.content;f&&(u+=f,p?.(f))}catch{}}}}finally{m.releaseLock()}if(u){const c=this.parseAIResponse(u,t,s);return{response:c.content,suggestions:c.suggestions||this.getContextualSuggestions(t.feature),confidence:90,actions:c.actions||s,metadata:{model:"gpt-4-turbo-preview",streaming:!0,responseLength:u.length},context:t.feature}}else throw new Error("No response content received")}catch(r){console.error("❌ Enhanced chat error:",r),console.error("🔑 OpenAI API Key available:",!!this.openaiApiKey),console.error("📝 Error details:",r instanceof Error?r.message:r),console.error("🌐 Base URL:",this.baseUrl),console.error("📊 Context:",t),console.error("💬 Message:",e),console.log("🔄 Attempting simple non-streaming request...");try{const i=await this.simpleOpenAIRequest(e);return console.log("✅ Simple request succeeded:",i),i}catch(i){throw console.error("❌ Simple request also failed:",i),new Error(`OpenAI API failed: ${r instanceof Error?r.message:r}. Simple request also failed: ${i instanceof Error?i.message:i}`)}}}createHumanizedSystemPrompt(e,o){return`You are Connectouch, a friendly and knowledgeable AI assistant for the Connectouch Web3 platform. You're like having a crypto-savvy friend who's always excited to help!

🎯 Your Personality:
- Conversational and warm, like chatting with a knowledgeable friend
- Enthusiastic about crypto and Web3 without being overwhelming
- Patient and encouraging, especially with beginners
- Use natural language, contractions, and casual expressions
- Occasionally use relevant emojis to add personality
- Show genuine interest in helping users succeed

💡 Your Expertise:
- Cryptocurrency trading and investment strategies
- DeFi protocols, yield farming, and staking
- NFT markets, trends, and opportunities
- DAO governance and community participation
- Blockchain infrastructure and technology
- Cross-chain operations and bridges
- Risk management and portfolio optimization
- Market analysis and trend identification

🌟 Current Context: ${this.getFeatureDescription(e.feature)}
📊 User's Situation: ${JSON.stringify(e.contextData)}
💼 Portfolio Info: ${JSON.stringify(e.portfolioData)}
⚙️ Preferences: ${JSON.stringify(e.userPreferences)}

🗣️ Communication Style:
- Be conversational: "Hey! I'd love to help you with that" instead of "I can assist you"
- Use natural transitions: "So here's what I'm thinking..." or "Let me break this down for you"
- Show enthusiasm: "That's a great question!" or "I'm excited to help you explore this!"
- Be encouraging: "You're on the right track!" or "Don't worry, we'll figure this out together"
- Use analogies and examples to explain complex concepts
- Ask follow-up questions to better understand their needs

🎯 Guidelines:
- Always prioritize user safety and risk management
- Explain things clearly without being condescending
- Suggest specific, actionable steps
- Admit when you're not certain about something
- Encourage learning and exploration
- Be honest about risks and potential downsides
- Celebrate user successes and progress

Remember: You're not just providing information - you're having a genuine conversation with someone who trusts you to help them navigate the exciting world of Web3! 🚀`}parseAIResponse(e,o,t){const s=this.extractSuggestions(e,o.feature),n=this.extractActions(e,t);return{content:e,suggestions:s,actions:n}}calculateConfidence(e){let o=85;if(e.choices[0]?.finish_reason==="stop"?o+=10:e.choices[0]?.finish_reason==="length"&&(o-=5),e.usage){const t=e.usage.completion_tokens/e.usage.total_tokens;t>.7&&(o+=5),t<.3&&(o-=5)}return Math.min(Math.max(o,60),95)}extractSuggestions(e,o){const t=[/(?:•|\*|-|\d+\.)\s*([^\n]+)/g,/(?:try|consider|you could|might want to)\s+([^.!?]+)/gi],s=[];for(const n of t){const p=e.matchAll(n);for(const r of p)r[1]&&r[1].length>10&&r[1].length<100&&s.push(r[1].trim())}return s.length>0?s.slice(0,4):this.getContextualSuggestions(o)}extractActions(e,o){const t=[...o],s=[/(?:buy|purchase)\s+(\d+\.?\d*)\s+(\w+)/gi,/(?:sell)\s+(\d+\.?\d*)\s+(\w+)/gi,/(?:set|place)\s+(?:a\s+)?(?:stop\s+loss|limit\s+order)/gi];for(const n of s){const p=e.matchAll(n);for(const r of p)r[1]&&r[2]&&t.push({type:"trade",action:r[0].toLowerCase().includes("sell")?"sell":"buy",amount:r[1],asset:r[2].toUpperCase()})}return t}getFeatureDescription(e){return{dashboard:"Main dashboard with portfolio overview and market summary",portfolio:"Portfolio management and analysis section",defi:"DeFi protocols, yield farming, and staking section",nft:"NFT marketplace and collection analysis",dao:"DAO governance and voting section",infrastructure:"Blockchain infrastructure and network analysis","multi-chain":"Cross-chain operations and bridge management",gamefi:"GameFi and play-to-earn gaming section","web3-tools":"Web3 development tools and utilities",analysis:"Advanced market analysis and research tools"}[e]||"General platform section"}async analyzePortfolio(e,o){try{const t=`Analyze this cryptocurrency portfolio and provide insights:

Portfolio Data: ${JSON.stringify(e,null,2)}
User Preferences: ${JSON.stringify(o,null,2)}

Please provide:
1. Overall portfolio health assessment
2. Risk analysis and diversification score
3. Specific recommendations for improvement
4. Potential yield opportunities
5. Rebalancing suggestions if needed

Focus on actionable insights and consider the user's risk tolerance and preferences.`,s=await fetch(`${this.baseUrl}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.openaiApiKey}`},body:JSON.stringify({model:"gpt-4-turbo-preview",messages:[{role:"system",content:"You are an expert cryptocurrency portfolio analyst. Provide detailed, actionable insights while considering risk management and user safety."},{role:"user",content:t}],max_tokens:800,temperature:.3})});if(!s.ok)throw new Error(`Portfolio analysis error: ${s.status}`);const n=await s.json();if(n.choices&&n.choices[0]?.message?.content)return{response:n.choices[0].message.content,suggestions:["Show risk breakdown","Find yield opportunities","Rebalance portfolio","Set price alerts"],confidence:this.calculateConfidence(n),metadata:{model:n.model,usage:n.usage}};throw new Error("Invalid OpenAI response")}catch(t){throw console.error("Portfolio analysis error:",t),new Error(`Portfolio analysis failed: ${t instanceof Error?t.message:t}`)}}async getMarketInsights(e){try{const o=`Provide current cryptocurrency market insights and analysis:

Context: ${e.feature}
Market Data: ${JSON.stringify(e.contextData,null,2)}

Please provide:
1. Current market sentiment and trends
2. Key price movements and catalysts
3. Risk factors to watch
4. Opportunities in the current market
5. Short-term and medium-term outlook

Focus on actionable insights for cryptocurrency investors and traders.`,t=await fetch(`${this.baseUrl}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.openaiApiKey}`},body:JSON.stringify({model:"gpt-4-turbo-preview",messages:[{role:"system",content:"You are an expert cryptocurrency market analyst. Provide current, accurate market insights while emphasizing risk management."},{role:"user",content:o}],max_tokens:800,temperature:.4})});if(!t.ok)throw new Error(`Market insights error: ${t.status}`);const s=await t.json();if(s.choices&&s.choices[0]?.message?.content)return{response:s.choices[0].message.content,suggestions:["Show market trends","Analyze correlations","Find opportunities","Check fear & greed index"],confidence:this.calculateConfidence(s),metadata:{model:s.model,usage:s.usage}};throw new Error("Invalid OpenAI response")}catch(o){throw console.error("Market insights error:",o),new Error(`Market insights failed: ${o instanceof Error?o.message:o}`)}}async assessRisk(e,o){try{const t=`Perform a comprehensive risk assessment for this cryptocurrency portfolio:

Portfolio Data: ${JSON.stringify(e,null,2)}
Market Data: ${JSON.stringify(o,null,2)}

Please analyze:
1. Overall portfolio risk level (Low/Medium/High)
2. Concentration risk and diversification analysis
3. Correlation risks between holdings
4. Market risk factors and volatility exposure
5. Specific recommendations to reduce risk
6. Suggested position sizing and stop-loss levels

Provide actionable risk management strategies.`,s=await fetch(`${this.baseUrl}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.openaiApiKey}`},body:JSON.stringify({model:"gpt-4-turbo-preview",messages:[{role:"system",content:"You are an expert risk management analyst specializing in cryptocurrency portfolios. Provide thorough risk assessments with practical mitigation strategies."},{role:"user",content:t}],max_tokens:800,temperature:.2})});if(!s.ok)throw new Error(`Risk assessment error: ${s.status}`);const n=await s.json();if(n.choices&&n.choices[0]?.message?.content)return{response:n.choices[0].message.content,suggestions:["Set stop losses","Diversify holdings","Monitor correlations","Adjust position sizes"],confidence:this.calculateConfidence(n),metadata:{model:n.model,usage:n.usage}};throw new Error("Invalid OpenAI response")}catch(t){throw console.error("Risk assessment error:",t),new Error(`Risk assessment failed: ${t instanceof Error?t.message:t}`)}}async processTradeCommand(e,o){try{const t=`Parse and analyze this trading command: "${e}"

Context: ${JSON.stringify(o,null,2)}

Please:
1. Extract the trading intent (buy/sell/hold)
2. Identify the asset and quantity
3. Assess the command validity and safety
4. Provide risk warnings if applicable
5. Suggest order type and execution strategy
6. Confirm the parsed details

If this is a valid trading command, provide clear confirmation. If not, explain what's needed.`,s=await fetch(`${this.baseUrl}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.openaiApiKey}`},body:JSON.stringify({model:"gpt-4-turbo-preview",messages:[{role:"system",content:"You are an expert trading assistant. Parse trading commands carefully and always prioritize user safety and risk management."},{role:"user",content:t}],max_tokens:600,temperature:.1})});if(!s.ok)throw new Error(`Trade command error: ${s.status}`);const n=await s.json();if(n.choices&&n.choices[0]?.message?.content)return{response:n.choices[0].message.content,suggestions:["Explain order types","Show market depth","Calculate fees","Set risk management"],confidence:this.calculateConfidence(n),metadata:{model:n.model,usage:n.usage}};throw new Error("Invalid OpenAI response")}catch(t){throw console.error("Trade command error:",t),new Error(`Trade command processing failed: ${t instanceof Error?t.message:t}`)}}async getEducationalContent(e,o){try{const t=`Provide educational content about: ${e}

User Level: ${o}

Please provide:
1. Clear explanation appropriate for the user's level
2. Key concepts and terminology
3. Practical examples and use cases
4. Common mistakes to avoid
5. Next steps for learning
6. Relevant resources or tools

Make the content engaging, accurate, and actionable. Adjust complexity based on user level (beginner/intermediate/advanced).`,s=await fetch(`${this.baseUrl}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.openaiApiKey}`},body:JSON.stringify({model:"gpt-4-turbo-preview",messages:[{role:"system",content:"You are an expert cryptocurrency and blockchain educator. Provide clear, accurate, and engaging educational content tailored to the user's experience level."},{role:"user",content:t}],max_tokens:1e3,temperature:.3})});if(!s.ok)throw new Error(`Educational content error: ${s.status}`);const n=await s.json();if(n.choices&&n.choices[0]?.message?.content)return{response:n.choices[0].message.content,suggestions:["Start with basics","Show examples","Explain risks","Find resources"],confidence:this.calculateConfidence(n),metadata:{model:n.model,usage:n.usage}};throw new Error("Invalid OpenAI response")}catch(t){throw console.error("Educational content error:",t),new Error(`Educational content generation failed: ${t instanceof Error?t.message:t}`)}}getContextualSuggestions(e){const o={dashboard:["Show me my portfolio performance","What's happening in crypto today?","Analyze market trends","Find trading opportunities"],portfolio:["Analyze my portfolio risk","Suggest rebalancing strategies","Find yield opportunities","Compare my performance to market"],defi:["Explain yield farming","Find best staking rewards","Compare lending protocols","Analyze liquidity pools"],nft:["Show trending NFT collections","Analyze floor price trends","Find undervalued NFTs","Explain NFT utility"],dao:["Show active proposals","Analyze voting patterns","Explain governance tokens","Find DAO opportunities"],infrastructure:["Compare blockchain performance","Explain consensus mechanisms","Analyze network security","Show scaling solutions"],"multi-chain":["Compare chain fees","Find bridge opportunities","Analyze cross-chain protocols","Show chain ecosystems"]};return o[e]||o.dashboard||[]}};h(l,"instance");let g=l;typeof window<"u"&&(window.testAIService=()=>g.getInstance().testOpenAIConnection(),window.testSimpleAI=async(a="Hello! Test message.")=>g.getInstance().simpleOpenAIRequest(a),window.forceRealAI=async(a="Hello Connectouch! Please respond naturally.")=>{console.log("🔥 FORCING REAL AI RESPONSE...");const e="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";try{const o=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({model:"gpt-4-turbo-preview",messages:[{role:"system",content:"You are Connectouch, a friendly AI assistant for cryptocurrency and Web3. Respond naturally and conversationally."},{role:"user",content:a}],max_tokens:300,temperature:.8})});if(!o.ok){const s=await o.text();return console.error("❌ Direct API call failed:",s),{error:s,status:o.status}}const t=await o.json();return console.log("✅ Direct API call succeeded:",t),t.choices[0].message.content}catch(o){return console.error("❌ Direct API call error:",o),{error:o instanceof Error?o.message:"Unknown error"}}});export{g as AIService,g as default};


(() => {
  const screens = {
    splash: document.getElementById("splash"),
    entry: document.getElementById("entry"),
    chat: document.getElementById("chat"),
    card: document.getElementById("card"),
    archive: document.getElementById("archive")
  };

  const thread = document.getElementById("thread");
  const quickChoices = document.getElementById("quickChoices");
  const finishButton = document.getElementById("finishButton");
  const composer = document.getElementById("composer");
  const messageInput = document.getElementById("messageInput");
  const focusSuggestion = document.getElementById("focusSuggestion");
  const focusEdit = document.getElementById("focusEdit");
  const cardList = document.getElementById("cardList");

  let route = "";
  let step = 0;
  let userTurns = 0;
  let transcript = [];
  let lastScreen = "entry";

  function show(name){
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("active", key === name);
    });
    window.scrollTo(0, 0);
  }

  function time(){
    return new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"});
  }

  function addMessage(text, role){
    const block = document.createElement("div");
    block.className = `message ${role}`;
    block.textContent = text;

    const t = document.createElement("div");
    t.className = "message-time";
    t.textContent = time();
    block.appendChild(t);

    thread.appendChild(block);
    transcript.push({role, text});
    requestAnimationFrame(() => window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"}));
  }

  function clearChoices(){
    quickChoices.innerHTML = "";
  }

  function setChoices(items){
    clearChoices();
    items.forEach(item => {
      const button = document.createElement("button");
      button.className = "quick-choice";
      button.textContent = item.label;
      button.addEventListener("click", () => {
        clearChoices();
        addMessage(item.label, "user");
        userTurns++;
        updateFinishVisibility();
        setTimeout(() => item.next(), 360);
      });
      quickChoices.appendChild(button);
    });
  }

  function updateFinishVisibility(){
    finishButton.classList.toggle("hidden", userTurns < 3);
  }

  function resetChat(){
    step = 0;
    userTurns = 0;
    transcript = [];
    thread.innerHTML = "";
    clearChoices();
    finishButton.classList.add("hidden");
    messageInput.value = "";
  }

  function openRoute(selectedRoute){
    route = selectedRoute;
    resetChat();
    show("chat");
    setTimeout(startRoute, 300);
  }

  function startRoute(){
    const intro = {
      idea: "まとまっていなくても大丈夫。今浮かんでいることを、そのまま聞かせて。",
      emotion: "急がなくて大丈夫。今に近いものから始めよう。",
      unknown: "分からないままで大丈夫。まずは今に近いものを選んでみよう。",
      casual: "なんとなくでいいよ。今に近いものから始めよう。"
    }[route];

    addMessage(intro, "ai");

    if(route === "idea"){
      setChoices([
        {label:"仕事のこと", next:() => topicWork()},
        {label:"人とのこと", next:() => topicPeople()},
        {label:"これからのこと", next:() => topicFuture()},
        {label:"自分で書く", next:() => focusInput()}
      ]);
    } else if(route === "emotion"){
      setChoices([
        {label:"少しモヤモヤしている", next:() => emotionMoya()},
        {label:"疲れている", next:() => emotionTired()},
        {label:"嬉しいことがあった", next:() => emotionHappy()},
        {label:"うまく言葉にできない", next:() => emotionUnknown()}
      ]);
    } else if(route === "unknown"){
      setChoices([
        {label:"今日あったこと", next:() => todayEvent()},
        {label:"今気になっていること", next:() => currentConcern()},
        {label:"これからしたいこと", next:() => topicFuture()},
        {label:"まだ選べない", next:() => emotionUnknown()}
      ]);
    } else {
      setChoices([
        {label:"今日のこと", next:() => todayEvent()},
        {label:"最近のこと", next:() => recentEvent()},
        {label:"少し先のこと", next:() => topicFuture()},
        {label:"何も決まっていない", next:() => emotionUnknown()}
      ]);
    }
  }

  function topicWork(){
    addMessage("仕事のことなんだね。今に近いのはどれ？","ai");
    setChoices([
      {label:"今の仕事", next:() => askOpen("今の仕事の中で、いちばん心に残っていることを聞かせて。")},
      {label:"職場の人", next:() => askOpen("その人との間で、いちばん引っかかっていることは何だろう。")},
      {label:"働き方", next:() => askOpen("今の働き方で、変えたいと思っていることはある？")},
      {label:"転職", next:() => askTransfer()}
    ]);
  }

  function askTransfer(){
    addMessage("転職について考えているんだね。今はどれに近い？","ai");
    setChoices([
      {label:"辞めたい", next:() => askOpen("辞めたいと思うようになった出来事を、話せる範囲で聞かせて。")},
      {label:"続けるか迷う", next:() => askOpen("続けることと辞めること、それぞれ何が引っかかっている？")},
      {label:"他の仕事を知りたい", next:() => askOpen("今の仕事では足りないと感じているものは何だろう。")},
      {label:"まだ整理できていない", next:() => askOpen("整理できていないままで大丈夫。最近、転職を意識した場面はあった？")}
    ]);
  }

  function topicPeople(){
    addMessage("人とのことなんだね。どれに近い？","ai");
    setChoices([
      {label:"家族", next:() => askOpen("家族とのことで、今いちばん心に残っていることは？")},
      {label:"友人", next:() => askOpen("その友人との間で、気になっていることを聞かせて。")},
      {label:"恋愛", next:() => askOpen("恋愛の中で、今いちばん考えていることは？")},
      {label:"職場の人", next:() => askOpen("その人との出来事で、いちばん残っている場面はどこ？")}
    ]);
  }

  function topicFuture(){
    addMessage("これからのことなんだね。今はどれに近い？","ai");
    setChoices([
      {label:"仕事・キャリア", next:() => topicWork()},
      {label:"お金", next:() => askOpen("お金のことで、今いちばん気になっていることは？")},
      {label:"暮らし", next:() => askOpen("これからの暮らしで、変えたいと思っていることはある？")},
      {label:"やりたいこと", next:() => askOpen("やりたいことについて、今どこで止まっている感じがする？")}
    ]);
  }

  function emotionMoya(){
    addMessage("少しモヤモヤしているんだね。どこに近い？","ai");
    setChoices([
      {label:"仕事", next:() => topicWork()},
      {label:"人とのこと", next:() => topicPeople()},
      {label:"自分のこと", next:() => askOpen("自分のことについて、どんな言葉が浮かんでいる？")},
      {label:"まだ分からない", next:() => askOpen("分からないままで大丈夫。今日の中で、少し残っている場面はある？")}
    ]);
  }

  function emotionTired(){
    addMessage("疲れているんだね。今はどれに近い？","ai");
    setChoices([
      {label:"体が疲れている", next:() => askOpen("今日はどんな時間が、いちばん負担だった？")},
      {label:"気持ちが疲れている", next:() => askOpen("気持ちが重くなったきっかけは思い当たる？")},
      {label:"何もしたくない", next:() => askOpen("今、いちばん減らせそうな負担は何だろう。")},
      {label:"理由は分からない", next:() => askOpen("分からなくて大丈夫。今の自分に必要そうなのは、休むこと？話すこと？")}
    ]);
  }

  function emotionHappy(){
    addMessage("嬉しいことがあったんだね。どれに近い？","ai");
    setChoices([
      {label:"誰かとのこと", next:() => askOpen("誰との、どんな時間が嬉しかった？")},
      {label:"仕事のこと", next:() => askOpen("仕事の中で、何がいちばん嬉しかった？")},
      {label:"自分の変化", next:() => askOpen("自分のどんな変化に気づいた？")},
      {label:"理由は分からない", next:() => askOpen("理由がはっきりしなくてもいいね。今の気分を一言にすると？")}
    ]);
  }

  function emotionUnknown(){
    addMessage("まだ言葉にできなくても大丈夫。今に近いのはどれ？","ai");
    setChoices([
      {label:"少し落ち着きたい", next:() => askOpen("今、頭の中でいちばん大きいものは何だろう。")},
      {label:"何かを決めたい", next:() => askOpen("決めたいことを、まだ曖昧なままでいいから聞かせて。")},
      {label:"少し話したい", next:() => askOpen("今日のことでも、最近のことでも、浮かんだところから聞かせて。")},
      {label:"このままでいたい", next:() => askOpen("言葉を急がなくていいよ。今ここにいる自分に、どんな感じがある？")}
    ]);
  }

  function todayEvent(){
    addMessage("今日のことなんだね。どれに近い？","ai");
    setChoices([
      {label:"心に残ったこと", next:() => askOpen("今日、いちばん心に残った場面を聞かせて。")},
      {label:"うまくいかなかったこと", next:() => askOpen("どの場面が、いちばん引っかかっている？")},
      {label:"嬉しかったこと", next:() => emotionHappy()},
      {label:"特に何もない", next:() => askOpen("何もない日の中で、今少し気になることはある？")}
    ]);
  }

  function recentEvent(){
    addMessage("最近のことなんだね。どれに近い？","ai");
    setChoices([
      {label:"仕事", next:() => topicWork()},
      {label:"人とのこと", next:() => topicPeople()},
      {label:"自分の変化", next:() => askOpen("最近、自分の中で変わったと感じることはある？")},
      {label:"まだ決まらない", next:() => askOpen("決めなくて大丈夫。最近よく思い出すことはある？")}
    ]);
  }

  function currentConcern(){
    addMessage("今気になっていることなんだね。どれに近い？","ai");
    setChoices([
      {label:"仕事", next:() => topicWork()},
      {label:"人とのこと", next:() => topicPeople()},
      {label:"これからのこと", next:() => topicFuture()},
      {label:"自分でも分からない", next:() => emotionUnknown()}
    ]);
  }

  function focusInput(){
    askOpen("今浮かんでいることを、そのまま聞かせて。");
  }

  function askOpen(prompt){
    addMessage(prompt, "ai");
    messageInput.focus();
  }

  function generateReply(text){
    const normalized = text.trim();
    if(!normalized) return "言葉にならなくても大丈夫。";
    if(/仕事|会社|上司|転職|職場/.test(normalized)){
      return "そのことが、今も心に残っているんだね。\nその中で、いちばん引っかかっている場面はどこ？";
    }
    if(/不安|怖|心配|モヤ/.test(normalized)){
      return "まだ正体がはっきりしない気持ちかもしれないね。\n今の自分が守ろうとしているものは、何だと思う？";
    }
    if(/嬉|楽しい|良かった|最高/.test(normalized)){
      return "その気持ちは残しておきたいね。\n何が、いちばん嬉しかった？";
    }
    if(/疲|しんど|無理|何もしたくない/.test(normalized)){
      return "今日は、進むより休むことを選びたい自分もいるのかもしれないね。\n今いちばん減らせそうな負担はある？";
    }
    return "そう思ったんだね。\n今の話の中で、自分でも少し気になった言葉はどれ？";
  }

  function submitText(text){
    if(!text.trim()) return;
    clearChoices();
    addMessage(text.trim(), "user");
    userTurns++;
    updateFinishVisibility();
    messageInput.value = "";
    setTimeout(() => addMessage(generateReply(text), "ai"), 500);
  }

  function buildFocusText(){
    const users = transcript.filter(item => item.role === "user").map(item => item.text);
    const last = users[users.length - 1] || "";
    if(/仕事|会社|上司|転職|職場/.test(last)){
      return "答えを急がず、自分が何を大切にしたいかを見る。";
    }
    if(/不安|怖|心配|モヤ/.test(last)){
      return "分からないままでも、自分を責めなくていい。";
    }
    if(/嬉|楽しい|良かった|最高/.test(last)){
      return "嬉しかった理由を、今日の自分が覚えておく。";
    }
    if(/疲|しんど|無理|何もしたくない/.test(last)){
      return "今日は、進むより休むことを選んでもいい。";
    }
    return "今日は、自分の気持ちを急がずに見てみた。";
  }

  function renderArchive(){
    const cards = JSON.parse(localStorage.getItem("focusCards") || "[]");
    cardList.innerHTML = "";
    if(cards.length === 0){
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "まだカードはありません。";
      cardList.appendChild(empty);
      return;
    }
    cards.forEach(card => {
      const article = document.createElement("article");
      article.className = "saved-card";
      article.innerHTML = `<div class="saved-date">${card.date}</div><div class="saved-text"></div>`;
      article.querySelector(".saved-text").textContent = card.text;
      cardList.appendChild(article);
    });
  }

  document.getElementById("splashButton").addEventListener("click", () => show("entry"));
  setTimeout(() => {
    if(screens.splash.classList.contains("active")) show("entry");
  }, 1500);

  document.querySelectorAll(".entry-option").forEach(button => {
    button.addEventListener("click", () => openRoute(button.dataset.route));
  });

  composer.addEventListener("submit", event => {
    event.preventDefault();
    submitText(messageInput.value);
  });

  messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + "px";
  });

  finishButton.addEventListener("click", () => {
    const suggestion = buildFocusText();
    focusSuggestion.textContent = suggestion;
    focusEdit.value = suggestion;
    show("card");
  });

  document.getElementById("saveCard").addEventListener("click", () => {
    const text = focusEdit.value.trim() || focusSuggestion.textContent;
    const cards = JSON.parse(localStorage.getItem("focusCards") || "[]");
    cards.unshift({
      date: new Date().toLocaleDateString("ja-JP"),
      text
    });
    localStorage.setItem("focusCards", JSON.stringify(cards));
    renderArchive();
    show("archive");
  });

  document.getElementById("skipCard").addEventListener("click", () => show("entry"));
  document.getElementById("backToEntry").addEventListener("click", () => show("entry"));
  document.getElementById("backToChat").addEventListener("click", () => show("chat"));

  document.getElementById("openArchive").addEventListener("click", () => {
    lastScreen = "entry";
    renderArchive();
    show("archive");
  });

  document.getElementById("archiveBack").addEventListener("click", () => show(lastScreen));
  document.getElementById("startAgain").addEventListener("click", () => show("entry"));
})();
